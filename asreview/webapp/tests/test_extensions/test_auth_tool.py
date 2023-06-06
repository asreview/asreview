import json
import os
import shutil
from pathlib import Path
from uuid import uuid4

import pytest

from asreview.entry_points.auth_tool import insert_project
# from asreview.project import _create_project_id
from asreview.utils import asreview_path
from asreview.webapp import DB
# from asreview.webapp.api.projects import _get_authenticated_folder_id
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app
from asreview.webapp.tests.utils import crud
from asreview.webapp.tests.utils import config_parser as cp
from asreview.webapp.tests.utils import api_utils as au
from asreview.webapp.tests.utils import misc as misc
from asreview.webapp.tests.utils import api_utils as au
import asreview.entry_points.auth_tool as tool
#from asreview.webapp.tests.conftest import signin_user
#from asreview.webapp.tests.conftest import signout
#from asreview.webapp.tests.conftest import signup_user


# Test inserting a user into the database
def test_insert_user(client_auth):
    # count users
    assert crud.count_users() == 0
    # get some user credentials
    user_data = cp.get_user_data(1)
    # insert the returned dictionary
    result = tool.insert_user(DB.session, user_data)
    # count users again
    assert crud.count_users() == 1
    # get user
    user = crud.last_user()
    assert user.email == user_data["email"]
    assert user.identifier == user_data["email"]
    assert user.origin == "asreview"
    assert user.name == user_data["name"]
    assert user.affiliation == user_data["affiliation"]
    assert user.confirmed


# Test inserting a duplicate
def test_insert_user_duplicate(client_auth):
    # count users
    assert crud.count_users() == 0
    # get some user credentials
    user_data = cp.get_user_data(1)
    # insert the returned dictionary
    tool.insert_user(DB.session, user_data)    
    # verify user has been created
    assert crud.count_users() == 1
    # and again
    result = tool.insert_user(DB.session, user_data)
    # asserts
    assert not result
    assert crud.count_users() == 1


# Test renaming a project (give it a new id)
def test_rename_project_folder(client_no_auth):
    # create a project and manipulate it
    _, data = au.create_project(client_no_auth, "test")
    # get uuid of project
    old_id = data.get("id")
    # verify if single project folder exists
    assert len(list(asreview_path().glob("*"))) == 1
    assert Path(asreview_path() / old_id).exists()
    with open(Path(asreview_path() / old_id / "project.json"), "r") as f:
        data = json.load(f)
        assert data["id"] == old_id
    # create new id
    new_id = uuid4().hex
    # call rename project
    result = tool.rename_project_folder(old_id, new_id)
    # check 
    assert not Path(asreview_path() / old_id).exists()
    assert Path(asreview_path() / new_id).exists()
    with open(Path(asreview_path() / new_id / "project.json"), "r") as f:
        data = json.load(f)
        assert data["id"] == new_id

