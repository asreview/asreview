import json
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

import asreview.entry_points.auth_tool as tool
from asreview.entry_points.auth_tool import AuthTool
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.tests.utils import api_utils as au
from asreview.webapp.tests.utils import config_parser as cp
from asreview.webapp.tests.utils import crud


def get_auth_tool_object(namespace):
    """This function returns an AuthTool object in which
    the session feature is set to the test database and
    the args feature is set with the <namespace> input
    parameter."""
    tool = AuthTool()
    # manipulate the DB session
    tool.session = DB.session
    tool.args = namespace
    return tool


def interactive_user_data():
    """This function returns a list of strings that can be
    used to trigger an interactively created user account."""
    user_data = cp.get_user_data(1)
    return [
        "Y",
        user_data["email"],
        user_data["name"],
        user_data["affiliation"],
        user_data["password"],
        "n",
    ]


# Test inserting a user into the database
def test_insert_user(client_auth):
    # count users
    assert crud.count_users() == 0
    # get some user credentials
    user_data = cp.get_user_data(1)
    # insert the returned dictionary
    tool.insert_user(DB.session, user_data)
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
    # no inserts, count remains 1
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
    tool.rename_project_folder(old_id, new_id)
    # check
    assert not Path(asreview_path() / old_id).exists()
    assert Path(asreview_path() / new_id).exists()
    with open(Path(asreview_path() / new_id / "project.json"), "r") as f:
        data = json.load(f)
        assert data["id"] == new_id


# Test inserting a project record in the database
def test_inserting_a_project_record(client_auth):
    # count projects
    assert crud.count_projects() == 0
    # insert this data
    data = {"project_id": uuid4().hex, "owner_id": 2}
    tool.insert_project(DB.session, data)
    # count again
    assert crud.count_projects() == 1
    # get last record
    project = crud.last_project()
    assert project.project_id == data["project_id"]
    assert project.owner_id == data["owner_id"]


# Test updating a project record in the database
def test_updating_a_project_record(client_auth):
    # count projects
    assert crud.count_projects() == 0
    # insert this data
    data = {"project_id": uuid4().hex, "owner_id": 2}
    tool.insert_project(DB.session, data)
    # count again
    assert crud.count_projects() == 1
    # change owner id
    data["owner_id"] = 3
    tool.insert_project(DB.session, data)
    # count again, no inserts, count remains 1
    assert crud.count_projects() == 1
    project = crud.last_project()
    assert project.project_id == data["project_id"]
    assert project.owner_id == data["owner_id"]


# Test get users
def test_get_users(client_auth):
    # create 2 users
    user1 = crud.create_user(DB, 1)
    user2 = crud.create_user(DB, 2)
    print(user1, user2)
    assert crud.count_users() == 2
    # test function
    result = tool.get_users(DB.session)
    assert set(result) == set([user1, user2])


# ####################
# Test AuthTool Object
# ####################


# insert users with json string
def test_auth_tool_add_users_with_json(client_auth):
    # assert we have no users
    assert crud.count_users() == 0
    # build appropriate json argument
    user_data = cp.get_user_data(1)
    namespace = Namespace(json=f"{json.dumps([user_data])}")
    # get auth_tool object
    auth_tool = get_auth_tool_object(namespace)
    # execute add users function
    auth_tool.add_users()
    # assert we now have a user
    assert crud.count_users() == 1
    user = crud.last_user()
    # quick asserts, we have already tested this in
    # test_insert_user
    assert user.email == user_data["email"]
    assert user.identifier == user_data["email"]


# insert users interactively, correct input
def test_auth_tool_add_users_interact(client_auth):
    # assert we have no users
    assert crud.count_users() == 0
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # build interactive input
    answers = interactive_user_data()
    with patch('builtins.input', side_effect=answers):
        auth_tool.add_users()
    # assert we now have a users
    assert crud.count_users() == 1


# insert users interactively, incorrect email
def test_auth_tool_add_users_interact_incorr_email(client_auth, capsys):
    """This test interactively inserts a user account, but
    a non valid email address is provided"""
    # assert we have no users
    assert crud.count_users() == 0
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # build interactive input
    answers = interactive_user_data()
    # add in a faulty email address
    answers.insert(1, "abcd@")
    with patch('builtins.input', side_effect=answers):
        auth_tool.add_users()
        _, err = capsys.readouterr()
        assert "Entered email address is not recognized" in err
    # assert we now have a users
    assert crud.count_users() == 1


# insert users interactively, name too short
def test_auth_tool_add_users_interact_incorr_name(client_auth, capsys):
    """This test interactively inserts a user account, but
    a short name is provided"""
    # assert we have no users
    assert crud.count_users() == 0
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # build interactive input
    answers = interactive_user_data()
    # add in a name that is too short
    answers.insert(2, "ab")
    with patch('builtins.input', side_effect=answers):
        auth_tool.add_users()
        _, err = capsys.readouterr()
        assert "Full name must contain more than 2" in err
    # assert we now have a users
    assert crud.count_users() == 1


# insert users interactively, bad password
def test_auth_tool_add_users_interact_incorr_passw(client_auth, capsys):
    """This test interactively inserts a user account, but
    a non valid password is provided"""
    # assert we have no users
    assert crud.count_users() == 0
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # build interactive input
    answers = interactive_user_data()
    # add in a name that is too short
    answers.insert(4, "1111")
    with patch('builtins.input', side_effect=answers):
        auth_tool.add_users()
        _, err = capsys.readouterr()
        assert "Use 8 or more characters with a mix" in err
    # assert we now have a users
    assert crud.count_users() == 1
