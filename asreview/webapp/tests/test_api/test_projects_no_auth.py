import pytest


import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
from asreview.project import get_projects
from asreview.webapp import DB
from asreview.webapp.tests.utils.misc import clear_folders_in_asreview_path
from asreview.project import ASReviewProject

UPLOAD_DATA = [
    {"benchmark": "benchmark:Hall_2012"},
    {"url": "https://raw.githubusercontent.com/asreview/" +
        "asreview/master/tests/demo_data/generic_labels.csv"}
]

@pytest.fixture(params=["client_auth", "client_no_auth"])
def setup(request):
    # get the client
    client = request.getfixturevalue(request.param)
    # provide a project name
    project_name = "project_name"
    if request.param == "client_auth":
        # create, signup and signin users
        user1 = au.create_and_signin_user(client, 1)
        # create a project for this logged in user
        au.create_project(client, project_name)
        # receive project
        project = user1.projects[0]
    else:
        # this has to be created to match the authenticated
        # version of this fixture
        user1 = None
        # create a project
        au.create_project(client, project_name)
        # get all project
        print(get_projects())
        project = get_projects()[0]
        print(project, project.project_id)
    yield client, user1, project
    if request.param == "client_auth":
        # cleanup database and asreview_path
        crud.delete_everything(DB)
    clear_folders_in_asreview_path()


def test_something(setup):
    client, user1, project = setup
    status_code, data = au.get_all_projects(client)
    assert status_code == 200
    assert len(data["result"]) == 1
    # found_project = data["result"][0]
    # print(data["result"])

    # assert found_project["id"] == project.name
    # assert found_project["owner_id"] == user1.id

def test_get_projects_stats_review_stage(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get stats
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 1
    assert data["result"]["n_finished"] == 0
    assert data["result"]["n_setup"] == 0






