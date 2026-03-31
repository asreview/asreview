import json
import logging
import shutil
import tempfile
from pathlib import Path

from asreview.project.migration.v1v2 import _migrate as _migrate_v1v2
from asreview.project.migration.v2v3 import _migrate as _migrate_v2v3
from asreview.project.migration.v2v3 import _validate as _validate_v2v3


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

    if src_version == 1 and _is_empty_v1(folder):
        shutil.rmtree(folder)
        return

    if _is_empty_v2(folder, src_version):
        logging.warning(
            f"Skipping migration of project {project_id}: "
            "no review configured. This project cannot be migrated."
        )
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
        validate = None
    elif current_version == 2:
        migrate = _migrate_v2v3
        validate = _validate_v2v3
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
        if validate is not None:
            validate(Path(tmpdir) / "tmp_project")

        backup = folder.with_name(folder.name + ".backup")
        shutil.move(folder, backup)
        try:
            shutil.move(Path(tmpdir) / "tmp_project", folder)
        except Exception:
            shutil.move(backup, folder)
            raise
        shutil.rmtree(backup)


def _is_empty_v2(folder, current_version):
    """Check if a project at v2 has no reviews configured.

    A v2 project without reviews cannot be migrated to v3 because the review
    data (results.db, data_store.db) does not exist. This should not happen in
    practice, but if it does we skip the project gracefully.

    Parameters
    ----------
    folder : str | Path
        The folder of the project to check.
    current_version : int
        The current version of the project (or the source version if
        the project has already been migrated from v1 to v2).

    Returns
    -------
    bool
        True if the project is at v2 with no reviews, False otherwise.
    """
    if current_version != 2:
        return False

    with open(Path(folder, "project.json")) as f:
        config = json.load(f)

    reviews = config.get("reviews", [])
    return len(reviews) == 0


def _is_empty_v1(folder):
    """Check if a v1 project is empty (no reviews configured).

    Parameters
    ----------
    folder : str | Path
        The folder of the v1 project to check.

    Returns
    -------
    bool
        True if the project has no reviews, False otherwise.
    """
    with open(Path(folder, "project.json")) as f:
        config = json.load(f)

    return len(config.get("reviews", [])) == 0
