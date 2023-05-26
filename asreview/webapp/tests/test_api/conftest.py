import pytest

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp.tests.utils.config_parser import get_user
from asreview.webapp.tests.utils.misc import clear_folders_in_asreview_path


@pytest.fixture()
def setup(client_auth):
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


# @pytest.fixture()
# def setup(client_no_auth):
#     # create a project
#     project_name = "project_name"
#     au.create_project(client_no_auth, project_name)
#     # get the project
#     yield client_no_auth, projects[0]
#     # cleanup asreview_path
#     clear_folders_in_asreview_path()

