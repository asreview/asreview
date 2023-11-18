import json
import random
import re
from pathlib import Path
from typing import Union

from flask import current_app

from asreview.utils import asreview_path


def get_project_id(project):
    """Get a project id from either a Project model
    (authenticated app) or an ASReviewProject object
    (unauthenticated app)."""
    if current_app.config.get("LOGIN_DISABLED"):
        return project.config["id"]

    return project.project_id


def read_project_file(project):
    """Loads the data from the project.json file."""
    id = get_project_id(project)
    with open(asreview_path() / id / "project.json", "r") as f:
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
    model = random.choice(["svm", "nb", "logistic"])
    feature_extraction = random.choice(["tfidf"])
    data = {
        "model": model,
        "feature_extraction": feature_extraction,
        "query_strategy": random.choice(
            ["cluster", "max", "max_random", "max_uncertainty", "random", "uncertainty"]
        ),
        "balance_strategy": random.choice(["double", "simple", "undersample"]),
    }
    return data


def get_folders_in_asreview_path():
    """This function returns the amount of folders located
    in the asreview folder."""
    return [f for f in asreview_path().glob("*") if f.is_dir()]
