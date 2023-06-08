import pytest

import asreview.webapp.tests.utils.api_utils as au
from asreview.project import get_projects
from asreview.webapp import DB
from asreview.webapp.tests.utils import crud
from asreview.webapp.tests.utils.config_parser import get_user


@pytest.fixture(params=["client_auth", "client_no_auth"])
def setup(request):
    """Setup and teardown fixture that will run each test with
    an authenticated version and unauthenticated version of the
    app. In the authenticated version the fixture yields a Flask
    client, a signed-in user plus a project belongoing to this user.
    In the unauthenticated version, the fixture yields a Flask
    client, and a project."""
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


@pytest.fixture(
    params=[
        "client_auth",
        "client_auth_no_creation",
        "client_auth_verified",
        "client_no_auth",
    ]
)
def setup_all_clients(request):
    """This fixture provides 4 different Flask client (authenticated
    and unauthenticated) for every test that uses it."""
    client = request.getfixturevalue(request.param)
    yield client


@pytest.fixture()
def setup_auth(client_auth):
    """This fixtures yields a Flask client for an authenticated
    app, 3 user accounts (first user is signed in) and a project
    belonging to the first user."""
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
