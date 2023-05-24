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
    # substitute the current project folder for an old type of folder
    misc.subs_for_legacy_project_folder(project)
    # try to convert
    status_code, data = au.upgrade_project(client, project)
    assert status_code == 200
    assert data["success"]


# Test get stats !!!!!!! This test needs more states (finish project, do a review)
def test_get_projects_stats(setup):
    client, _, _, _, _ = setup
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 0
    assert data["result"]["n_finished"] == 0
    assert data["result"]["n_setup"] == 1


# Test known demo data
@pytest.mark.parametrize("subset", ["plugin", "benchmark"])
def test_demo_data_project(setup, subset):
    client, _, _, _, _ = setup
    status_code, data = au.get_demo_data(client, subset)
    assert status_code == 200
    assert isinstance(data["result"], list)


# Test unknown demo data
def test_unknown_demo_data_project(setup):
    client, _, _, _, _ = setup
    status_code, data = au.get_demo_data(client, "abcdefg")
    assert status_code == 400
    assert data["message"] == "demo-data-loading-failed"


# Test uploading data to a project
def test_upload_data_to_project(setup):
    client, _, _, _, project = setup
    status_code, data = au.upload_data_to_project(
        client,
        project,
        data={"benchmark": "benchmark:Hall_2012"}
    )
    assert status_code == 200
    assert data["success"]





