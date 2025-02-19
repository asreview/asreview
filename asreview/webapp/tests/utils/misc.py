import io
import json
import random
import re
import zipfile
from pathlib import Path
from typing import Union

from flask import current_app

from asreview.webapp.utils import asreview_path


def custom_remote_auth_headers(
    identifier="foo",
    affiliation="UU",
    email="foo@dev.bar",
    name="Foo Bar",
    secret="secret",
):
    return {
        "environ_base": {
            "REMOTE_USER": identifier,
            "REMOTE_USER_EMAIL": email,
            "REMOTE_USER_AFFILIATION": affiliation,
            "REMOTE_AUTH_SECRET": secret,
        },
        "headers": {},
    }


def get_project_id(project):
    """Get a project id from either a Project model
       (authenticated app) or an asr.Project
    object
       (unauthenticated app)."""
    if not current_app.config.get("AUTHENTICATION"):
        return project.config["id"]

    return project.project_id


def read_project_file(project):
    """Loads the data from the project.json file."""
    id = get_project_id(project)
    with open(asreview_path() / id / "project.json") as f:
        data = json.load(f)
        return data


def manipulate_project_file(project, key, value):
    """Updates key value pairs in the project.json file."""
    id = get_project_id(project)
    data = read_project_file(project)
    data[key] = value
    with open(asreview_path() / id / "project.json", "w+") as f:
        json.dump(data, f)
        return True
    return False


def _extract_stem(path: Union[str, Path]):
    """Extracts a stem from a path or URL containing a filename."""
    return Path(re.split(":|/", str(path))[-1]).stem


def extract_filename_stem(upload_data):
    """Helper function to get the stem part of a filename from a
    Path or URL contaning a filename."""
    # upload data is a dict with a single key value pair
    value = list(upload_data.values())[0]
    # split this value on either / or :
    return _extract_stem(value)


def choose_project_algorithms():
    """Randomly chooses a model plus the appropriate feature
    extraction, query strategy and balance strategy."""
    classifier = random.choice(["svm", "nb", "logistic"])
    feature_extractor = random.choice(["tfidf"])
    data = {
        "name": None,
        "current_value": {
            "classifier": classifier,
            "feature_extractor": feature_extractor,
            "querier": random.choice(
                ["max", "max_random", "max_uncertainty", "random", "uncertainty"]
            ),
            "balancer": random.choice(["balanced", None]),
        },
    }
    return data


def get_folders_in_asreview_path():
    """This function returns the amount of folders located
    in the asreview folder."""
    return [f for f in asreview_path().glob("*") if f.is_dir()]


def get_zip_file_names(flask_response_data):
    asreview_project_zip = io.BytesIO(flask_response_data)

    zip_file = zipfile.ZipFile(asreview_project_zip)
    return zip_file.namelist()
