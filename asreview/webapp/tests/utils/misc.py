import json
import random
import re
import shutil
from pathlib import Path
from typing import Union
from urllib.request import urlopen

from flask import current_app

from asreview.utils import asreview_path


def get_project_id(project):
    """Get a project id from either a Project model
    (authenticated app) or an ASReviewProject object
    (unauthenticated app)."""
    id = None
    if current_app.config.get("AUTHENTICATION_ENABLED"):
        id = project.project_id
    else:
        id = project.config["id"]
    return id


def clear_asreview_path():
    """Removes all files and folders from the ASReview folder."""
    for item in Path(asreview_path()).glob("*"):
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()


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


def subs_for_legacy_project_folder(project):
    """This function helps with testing for legacy projects. A
    quick way to create a legacy project is to take a non-legacy
    folder, remove it contents and copy a legacy project's contents
    into it."""
    shutil.rmtree(asreview_path() / get_project_id(project))
    # I need an old project folder, and I got it in the data dir
    src = Path(
        Path(__file__).parent.parent.resolve(),
        "data/asreview-project-v0-19-startreview",
    )
    dst = asreview_path() / get_project_id(project)
    shutil.copytree(src, dst)


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


def retrieve_project_url_github(major=None):
    """Retrieve .asreview file url from
    asreview-project-files-testing GitHub repository"""

    repo = "/asreview/asreview-project-files-testing"
    repo_api_url = "https://api.github.com/repos" + repo + "/git/trees/master"
    repo_url = "https://github.com" + repo + "/blob/master"
    file_type = "startreview.asreview?raw=true"

    json_file = json.loads(urlopen(repo_api_url).read().decode("utf-8"))["tree"]

    version_tags = []
    project_urls = []

    for file in json_file:
        if file["type"] == "tree":
            version_tags.append(file["path"])

    for tag in version_tags:
        file_version = f"/{tag}/asreview-project-{tag.replace('.', '-')}-"

        if major is None or int(tag[1]) == major:
            project_urls.append(repo_url + file_version + file_type)

    return project_urls
