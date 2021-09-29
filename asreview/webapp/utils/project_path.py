import os
from pathlib import Path


def asreview_path():
    """Get the location where projects are stored.

    Overwrite this location by specifying the ASREVIEW_PATH enviroment
    variable.
    """

    if os.environ.get("ASREVIEW_PATH", None):
        asreview_path = Path(os.environ["ASREVIEW_PATH"])
    else:
        asreview_path = Path("~", ".asreview").expanduser()

    asreview_path.mkdir(parents=True, exist_ok=True)

    return asreview_path


def list_asreview_project_paths():
    """List the projects in the asreview path"""

    file_list = []
    for x in asreview_path().iterdir():
        if x.is_dir():
            if Path(x, "project.json").exists():
                file_list.append(x)
    return file_list


def get_project_path(project_id):
    """Get the project directory.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(asreview_path(), project_id)
