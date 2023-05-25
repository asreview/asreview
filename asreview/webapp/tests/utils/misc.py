import json
import random
import re
import shutil
from pathlib import Path

from asreview.utils import asreview_path

def clear_folders_in_asreview_path():
    for item in Path(asreview_path()).glob("*"):
        if item.is_dir():
            shutil.rmtree(item)


def read_project_file(project):
    id = project.project_id
    with open(asreview_path() / id / "project.json", "r") as f:
        data = json.load(f)
        return data


def manipulate_project_file(project, key, value):
    id = project.project_id
    data = read_project_file(project)
    data[key] = value
    with open(asreview_path() / id / "project.json", "w+") as f:
        json.dump(data, f)
        return True
    return False


def subs_for_legacy_project_folder(project):
    shutil.rmtree(asreview_path() / project.project_id)
    # I need an old project folder, and I got it in the data dir
    src = Path(
        Path(__file__).parent.parent.resolve(),
        "data/asreview-project-v0-19-startreview"
    )
    dst = asreview_path() / project.project_id
    shutil.copytree(src, dst)


def extract_filename_stem(upload_data):
    # upload data is a dict with a single key value pair
    value = list(upload_data.values())[0]
    # split this value on either / or :
    return Path(re.split(":|/", value)[-1]).stem


def choose_project_algorithms():
    model = random.choice(
        ["svm", "nb", "logistic"]
    )
    feature_extraction = random.choice(
        ["tfidf"]
    )
    data = {
        "model": model,
        "feature_extraction": feature_extraction,
        "query_strategy": random.choice(
            ["cluster", "max", "max_random", "max_uncertainty", "random", "uncertainty"]
        ),
        "balance_strategy": random.choice(
            ["double", "simple", "undersample"]
        ),
    }
    return data
