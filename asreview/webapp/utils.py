from pathlib import Path

from asreview.utils import asreview_path
from asreview.project import Project


def get_project_path(folder_id):
    """Get the project directory.

    Arguments
    ---------
    folder_id: str
        The id of the folder containing a project. If there is no
        authentication, the folder_id is equal to the project_id. Otherwise,
        this is equal to {project_owner_id}_{project_id}.
    """
    return Path(asreview_path(), folder_id)


def get_projects(project_paths=None):
    """Get the ASReview projects at the given paths.

    Arguments
    ---------
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
