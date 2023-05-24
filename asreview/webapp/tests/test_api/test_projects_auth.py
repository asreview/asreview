import shutil
from inspect import getfullargspec
from pathlib import Path

import pytest

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.tests.utils.config_parser import get_user

# NOTE: the setup fixture entails: 3 users, user1 is signed in,
# user1 has one project made


# Test getting all projects
def test_get_projects(setup):
    client, user1, _, _, project = setup

    status_code, data = au.get_all_projects(client)
    assert status_code == 200
    assert len(data["result"]) == 1
    found_project = data["result"][0]
    assert found_project["id"] == project.project_id
    assert found_project["owner_id"] == user1.id


# Test create a project
def test_create_projects(setup):
    client, user1, _, _, _ = setup
    project_name = "new_project"

    status_code, data = au.create_project(client, project_name)
    assert status_code == 201
    assert data["name"] == project_name


# Test upgrading a post v0.x project
def test_try_upgrade_a_modern_project(setup):
    client, _, _, _, project = setup

    # verify version
    data = misc.read_project_file(project)
    assert not data["version"].startswith("0.")

    status_code, data = au.upgrade_project(client, project)
    assert status_code == 400
    assert data["message"] == "Can only convert v0.x projects."


# Test upgrading a v0.x project
def test_upgrade_an_old_project(setup):
    client, _, _, _, project = setup
    # remove the current project folder
    shutil.rmtree(asreview_path() / project.project_id)
    # I need an old project folder, and I got it in the data dir
    src = Path(__file__).parent.parent.resolve() / "data/v0.9-project-folder"
    dst = asreview_path() / project.project_id
    shutil.copytree(src, dst)

    

    status_code, data = au.upgrade_project(client, project)
    assert status_code == 200
    assert "There already is a 'reviews' folder" in data["message"]


