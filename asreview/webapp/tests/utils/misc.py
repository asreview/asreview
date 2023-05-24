import json
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


def downgrade_project_file(project):
    id = project.project_id
    # manipulate version in project file
    manipulate_project_file(project, "version", "0.1")
    # remove reviews folder
    if Path(asreview_path() / id / "reviews").exists():
        shutil.rmtree(asreview_path() / id / "reviews")
        return True
    return False