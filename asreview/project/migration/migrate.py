import json
import logging
import shutil
import tempfile
from pathlib import Path

from asreview.project.migration.v1v2 import _migrate as _migrate_v1v2
from asreview.project.migration.v2v3 import _migrate as _migrate_v2v3


__all__ = ["detect_version", "migrate_project"]


def detect_version(project_config):
    """Detect the version of a project from it's config.

    Arguments
    ---------
    project_config : dict
        Project config.

    Returns
    -------
    int
        Project file version.
    """
    # If the project file version is explicitly specified use that value.
    if "project_file_version" in project_config:
        return project_config["project_file_version"]
    # Otherwise use the ASReview major version.
    return int(project_config["version"][0])


def migrate_project(folder, src_version, dst_version):
    """Migrate a project.

    Parameters
    ----------
    folder: str
        The folder of the project to migrate

    Returns
    -------
    None
    """
    if src_version < 1:
        raise ValueError("Source version should be at least 1")
    if dst_version > 3:
        raise ValueError("Destination version should be at most 3")
    if src_version >= dst_version:
        raise ValueError("Source version should be less than destination version.")

    folder = Path(folder)
    if not folder.exists():
        raise FileNotFoundError(f"Project folder {folder} does not exist.")

    if not Path(folder, "project.json").exists():
        raise FileNotFoundError(
            f"Project file {Path(folder, 'project.json')} does not exist."
        )

    # try to get the project id from the project.json file
    with open(Path(folder, "project.json")) as f:
        project_config = json.load(f)
        project_id = project_config.get("id", "unknown")

    if src_version <= 2 and _is_empty_v1_or_v2(folder):
        shutil.rmtree(folder)
        return

    current_version = src_version
    while current_version < dst_version:
        try:
            _migrate_project_one_version(folder, current_version)
            current_version += 1
        except Exception as e:
            logging.exception(
                f"Failed to migrate project {folder} from {current_version} to v{current_version + 1}:\n{e}"
            )
            raise Exception(f"Failed to upgrade project {project_id}.") from e


def _migrate_project_one_version(folder, current_version):
    if current_version == 1:
        migrate = _migrate_v1v2
    elif current_version == 2:
        migrate = _migrate_v2v3
    else:
        raise ValueError("Invalid current version.")

    with tempfile.TemporaryDirectory() as tmpdir:
        shutil.copytree(
            folder,
            Path(tmpdir) / "tmp_project",
            ignore=shutil.ignore_patterns("*.lock"),
        )

        shutil.copytree(
            folder,
            Path(tmpdir) / "tmp_project" / f"legacy_v{current_version}",
            ignore=shutil.ignore_patterns("*.lock"),
        )

        logging.info(
            f"Upgrading project {folder} from v{current_version} to v{current_version + 1}."
        )
        migrate(Path(tmpdir) / "tmp_project")

        shutil.rmtree(folder)
        shutil.copytree(Path(tmpdir) / "tmp_project", folder)


def _is_empty_v1_or_v2(folder):
    """Check if a v1 or v2 project is a setup project without data or reviews.

    Parameters
    ----------
    folder: str
        The folder of the project to check. The project should from v1 or v2.

    Returns
    -------
    bool
        True if the project is a setup without data, False otherwise.
    """
    with open(Path(folder, "project.json")) as f:
        config = json.load(f)

    if len(config.get("reviews", [])) == 0:
        return True

    return False
