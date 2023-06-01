import pytest

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
from asreview.project import get_projects
from asreview.webapp import DB
from asreview.webapp.tests.utils.config_parser import get_user
from asreview.webapp.tests.utils.misc import clear_folders_in_asreview_path


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
        project = get_projects()[0]
    yield client, user1, project
    if request.param == "client_auth":
        # cleanup database and asreview_path
        crud.delete_everything(DB)
    clear_folders_in_asreview_path()


@pytest.fixture(
    params=[
        "client_auth",
        "client_auth_no_creation",
        "client_auth_verified",
        "client_no_auth",
    ]
)
def setup_all_clients(request):
    # get the client
    client = request.getfixturevalue(request.param)
    yield client


@pytest.fixture()
def setup_auth(client_auth):
    # create, signup and signin users
    user1 = au.create_and_signin_user(client_auth, 1)
    user2 = get_user(2)
    user3 = get_user(3)
    # signup user 2
    au.signup_user(client_auth, user2)
    au.signup_user(client_auth, user3)
    # get users 2 and 3 from DB
    user2 = crud.get_user_by_identifier(user2.identifier)
    user3 = crud.get_user_by_identifier(user3.identifier)
    # create a project for this logged in user
    project_name = "project_name"
    au.create_project(client_auth, project_name)
    yield client_auth, user1, user2, user3, user1.projects[0]
    # cleanup database and asreview_path
    crud.delete_everything(DB)
    clear_folders_in_asreview_path()
