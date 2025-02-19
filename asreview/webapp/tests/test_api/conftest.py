import pytest

import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp import DB
from asreview.webapp.tests.utils import crud
from asreview.webapp.tests.utils.config_parser import get_user


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
    user2 = get_user(2)
    user3 = get_user(3)
    # signup users 2 and 3 (signing up means also signing in)
    au.signup_user(client_auth, user2)
    au.signup_user(client_auth, user3)
    # get users 2 and 3 from DB
    user2 = crud.get_user_by_identifier(user2.identifier)
    user3 = crud.get_user_by_identifier(user3.identifier)
    # create a project for this logged in user
    user1 = au.create_and_signin_user(client_auth, 1)
    # this user is now logged in.
    au.create_project(client_auth, "oracle", benchmark="synergy:van_der_Valk_2021")
    yield client_auth, user1, user2, user3, user1.projects[0]
    # cleanup database and asreview_path
    crud.delete_everything(DB)


@pytest.fixture()
def setup_remote_auth(client_remote_auth):
    """This fixtures yields a Flask client for an app
    with remote authentication enabled, and one user account with a project."""
    # create, signup and signin users
    user = get_user(2)
    # signup user 2
    au.signup_user(client_remote_auth, user)

    # get users 2 and 3 from DB
    user = crud.get_user_by_identifier(user.identifier)
    # create a project for this user
    au.create_project(
        client_remote_auth, "oracle", benchmark="synergy:van_der_Valk_2021"
    )
    yield client_remote_auth, user, user.projects[0]
    # cleanup database and asreview_path
    crud.delete_everything(DB)
