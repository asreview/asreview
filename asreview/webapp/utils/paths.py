import json
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


def get_project_file_path(project_id):
    """Get the path to the project file.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "project.json")


def get_tmp_path(project_id):
    """Get the tmp directory in the projecr.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "tmp")


def get_data_path(project_id):
    """Get the path to the data folder.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "data")


def get_iteration_path(project_id, i):
    """Get the iteration dir from the project_id.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), f"result_{i}")


def get_active_path(project_id):
    """Get the active file for the project.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "active.json")


def get_kwargs_path(project_id):
    return Path(get_project_path(project_id), "kwargs.json")


def get_lock_path(project_id):
    """Get the active file for the project.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "lock.sqlite")


def get_pool_path(project_id):
    """Get the pool file for the project and iteration.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "pool.json")


def get_proba_path(project_id):
    """Get the proba file for the project and iteration.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "proba.json")


def get_labeled_path(project_id):
    """Get the labeled file for the project and iteration.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "labeled.json")


def get_state_path(project_id):
    """Get the labeled file for the project and iteration.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    return Path(get_project_path(project_id), "result.json")


def get_simulation_ready_path(project_id, simulation_id):
    """Get the simulation_ready file for the project and iteration.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    simulation_id: str
        The id of the current simulation.
    """

    return Path(get_project_path(project_id), "simulations", simulation_id + ".json")
