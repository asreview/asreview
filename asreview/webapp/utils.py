import os
from pathlib import Path

from asreview.project.api import Project


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


def get_project_path(folder_id):
    """Get the project directory.

    Parameters
    ----------
    folder_id: str
        The id of the folder containing a project. If there is no
        authentication, the folder_id is equal to the project_id. Otherwise,
        this is equal to {project_owner_id}_{project_id}.
    """
    return Path(asreview_path(), folder_id)


def get_projects(project_paths=None):
    """Get the ASReview projects at the given paths.

    Parameters
    ----------
    project_paths : list[Path], optional
        List of paths to projects. By default all the projects in the asreview
        folder are used, by default None

    Returns
    -------
    list[Project]
        Projects at the given project paths.
    """
    if project_paths is None:
        project_paths = [path for path in asreview_path().iterdir() if path.is_dir()]

    return [Project(project_path) for project_path in project_paths]
