import json
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch
from uuid import uuid4

import pytest

import asreview as asr
import asreview.webapp._entry_points.auth_tool as tool
from asreview.webapp import DB
from asreview.webapp._entry_points.auth_tool import AuthTool
from asreview.webapp.tests.utils import api_utils as au
from asreview.webapp.tests.utils import config_parser as cp
from asreview.webapp.tests.utils import crud
from asreview.webapp.tests.utils import misc
from asreview.webapp.utils import asreview_path


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


def import_2_unauthenticated_projects(with_upgrade=True):
    """This function retrieves 2 zipped project (version 1.x)
    files from github and copies them in the asreview folder.
    To use them in tests they need to be upgraded. Both projects
    are returned."""

    tests_folder = Path(__file__).parent.parent
    asreview_v1_0_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v1.0",
        "asreview-project-v1-0-startreview.asreview",
    )

    proj1 = asr.Project.load(
        open(asreview_v1_0_file, "rb"), asreview_path(), safe_import=True
    )

    asreview_v1_5_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v1.5",
        "asreview-project-v1-5-startreview.asreview",
    )

    proj2 = asr.Project.load(
        open(asreview_v1_5_file, "rb"), asreview_path(), safe_import=True
    )

    return proj1, proj2


# Test verifying uuid: correct
def test_verify_id_correct_id():
    id = uuid4().hex
    assert tool.verify_id(id)


# Test verifying uuid: incorrect id
def test_verify_id_incorrect_id():
    id = "incorrect-id"
    assert not tool.verify_id(id)


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


# Test inserting a project record in the database
def test_inserting_a_project_record(client_auth):
    # count projects
    assert crud.count_projects() == 0
    # Make sure the project owner exists as user in the database.
    owner = crud.create_user(DB)
    # insert this data
    data = {"project_id": uuid4().hex, "owner_id": owner.id}
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
    # Make sure the project owner exists as user in the database.
    owner1 = crud.create_user(DB, 1)
    owner2 = crud.create_user(DB, 2)
    # insert this data
    data = {"project_id": uuid4().hex, "owner_id": owner1.id}
    tool.insert_project(DB.session, data)
    # count again
    assert crud.count_projects() == 1
    # change owner id
    data["owner_id"] = owner2.id
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
    with patch("builtins.input", side_effect=answers):
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
    with patch("builtins.input", side_effect=answers):
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
    with patch("builtins.input", side_effect=answers):
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
    with patch("builtins.input", side_effect=answers):
        auth_tool.add_users()
    _, err = capsys.readouterr()
    assert "Use 8 or more characters with a mix" in err
    # assert we now have a users
    assert crud.count_users() == 1


# Test validity check. Note: this and the next test can not
# be parametrized because of the tested function: it -needs-
# to be finished with a correct value
def test_validity_function_valid(capsys):
    """Tests the _ensure_valid_value_for method, expects
    no error messages if the input value respects the
    lambda function."""
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # define a correct value
    correct = "a"
    hint = "Test hint"
    # run function with patched input
    with patch("builtins.input", side_effect=[correct]):
        # run validity function
        auth_tool._ensure_valid_value_for("test", lambda x: x == correct, hint=hint)
    out, err = capsys.readouterr()
    assert not bool(out)
    assert not bool(err)


# Test validity check, see remark previous test if you notice
# the repetition
def test_validity_function_invalid(capsys):
    """Tests the _ensure_valid_value_for method, expects
    error messages if the input value does not respect the
    lambda function."""
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # define a correct value
    correct = "a"
    incorrect = "b"
    hint = "Test hint"
    # run function with patched input
    with patch("builtins.input", side_effect=[incorrect, correct]):
        # run validity function
        auth_tool._ensure_valid_value_for("test", lambda x: x == correct, hint=hint)
    out, err = capsys.readouterr()
    assert not bool(out)
    # An new-line is added to the hint
    assert err == f"{hint}\n"


# Test printing a project
def test_print_project(capsys):
    keys = ["folder", "version", "project_id", "name", "authors", "created"]
    data = {k: uuid4().hex for k in keys}
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    auth_tool._print_project(data)
    out, _ = capsys.readouterr()
    assert f"* {data['folder']}" in out
    assert f"version: {data['version']}" in out
    assert f"id: {data['project_id']}" in out
    assert f"name: {data['name']}" in out
    assert f"authors: {data['authors']}" in out
    assert f"created: {data['created']}" in out


# Test printing a user with affiliation
def test_print_user_with_affiliation(client_auth, capsys):
    user = crud.create_user(DB, 1)
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    auth_tool._print_user(user)
    out, _ = capsys.readouterr()
    expected = f"{user.id} - {user.email} ({user.name}), {user.affiliation}"
    assert out.strip() == expected


# Test printing a user without affiliation
def test_print_user_without_affiliation(client_auth, capsys):
    user = crud.create_user(DB, 1)
    user.affiliation = None
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    auth_tool._print_user(user)
    out, _ = capsys.readouterr()
    expected = f"{user.id} - {user.email} ({user.name})"
    assert out.strip() == expected


# Testing _get_projects
def test_get_projects(client_no_auth, project):
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    result = auth_tool._get_projects()
    assert isinstance(result, list)
    assert len(result) == 1
    result = result[0]
    assert result["folder"] == project.config["id"]
    assert result["version"] == project.config["version"]
    assert result["project_id"] == project.config["id"]
    assert result["name"] == project.config["name"]
    assert result["created"] == project.config["created_at_unix"]
    assert result["owner_id"] == 0


# Test listing users
def test_list_users(client_auth, capsys):
    # create 2 users
    u1 = crud.create_user(DB, 1)
    u2 = crud.create_user(DB, 2)
    assert crud.count_users() == 2
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    auth_tool.list_users()
    out, _ = capsys.readouterr()
    exp1 = f"{u1.id} - {u1.email} ({u1.name}), {u1.affiliation}"
    exp2 = f"{u2.id} - {u2.email} ({u2.name}), {u2.affiliation}"
    assert exp1 in out
    assert exp2 in out


# Test list projects: no json data
def test_list_projects_no_json(client_no_auth, capsys):
    # create two projects
    r1 = au.create_project(client_no_auth, benchmark="synergy:van_der_Valk_2021")
    r2 = au.create_project(client_no_auth, benchmark="synergy:van_der_Valk_2021")
    # get auth_tool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function
    auth_tool.list_projects()
    out, _ = capsys.readouterr()
    # we have already tested _print_project, so I will keep
    # it short

    assert f"* {r1.json['id']}" in out
    assert f"* {r2.json['id']}" in out
    assert f"name: {r1.json['name']}" in out
    assert f"name: {r2.json['name']}" in out


# Test list projects: output is a json string
def test_list_projects_with_json(client_no_auth, capsys):
    with capsys.disabled():
        r1 = au.create_project(client_no_auth, benchmark="synergy:van_der_Valk_2021")
        r2 = au.create_project(client_no_auth, benchmark="synergy:van_der_Valk_2021")
        data = {r1.json.get("id"): r1.json, r2.json.get("id"): r2.json}
        # get auth_tool object
        auth_tool = get_auth_tool_object(Namespace(json=True))

    auth_tool.list_projects()
    out, _ = capsys.readouterr()
    # this loads the out json string into a list of dicts
    out = json.loads(json.loads(out))
    assert isinstance(out, list)
    assert len(out) == 2
    for proj in out:
        expected = data[proj["project_id"]]
        assert proj["folder"] == expected["id"]
        assert proj["version"] == expected["version"]
        assert proj["project_id"] == expected["id"]
        assert proj["name"] == expected["name"]
        assert proj["created"] == expected["created_at_unix"]
        assert proj["owner_id"] == 0


# Test linking projects to users with a json string
# Note: We can not simulate a conversion from an unauthenticated
# app into an authenticated one. To overcome this problem, 2 old
# project zip files (version 0.x) are copied from Github into the
# asreview folder and upgraded. This is done without the help of
# the API, ensuring they can't be linked to a User account.
def test_link_project_with_json_string(client_auth, capsys):
    with capsys.disabled():
        import_2_unauthenticated_projects()
        # create 2 users
        user1 = crud.create_user(DB, 1)
        user2 = crud.create_user(DB, 2)
        # check database
        assert crud.count_users() == 2
        assert crud.count_projects() == 0
        # check if we have 2 folders in asreview path
        assert len(misc.get_folders_in_asreview_path()) == 2
        # get from the auth tool a json string
        auth_tool = get_auth_tool_object(Namespace(json=True))

    auth_tool.list_projects()
    out, _ = capsys.readouterr()
    # we replace the owner ids with the ids of the users
    json_string = out.replace(": 0", f": {user1.id}", 1)
    json_string = json_string.replace(": 0", f": {user2.id}", 1)

    # use this string to run the function with a new AuthTool
    auth_tool = get_auth_tool_object(Namespace(json=json.loads(json_string)))
    auth_tool.link_projects()
    # check database and check if the users own the correct project
    assert crud.count_projects() == 2
    project_dict = {
        proj["owner_id"]: proj for proj in json.loads(json.loads(json_string))
    }
    for user in [user1, user2]:
        expected_proj = project_dict[user.id]
        assert len(user.projects) == 1
        assert user.projects[0].project_id == expected_proj["folder"]
        assert user.projects[0].project_id == expected_proj["project_id"]
        # check also on the file-system
        assert Path(asreview_path() / expected_proj["folder"]).exists()


# Test linking projects interactively
def test_link_projects_interactively(client_auth):
    # import projects
    proj1, proj2 = import_2_unauthenticated_projects()
    project_data = {p.config.get("id"): p for p in [proj1, proj2]}
    # create a user
    user = crud.create_user(DB, 1)
    # check the database
    assert crud.count_users() == 1
    assert crud.count_projects() == 0
    # create AuthTool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function with patched input
    with patch("builtins.input", side_effect=[user.id, user.id]):
        # link project to user
        auth_tool.link_projects()
    # check database again
    assert crud.count_projects() == 2
    # make sure the user has 2 different projects
    assert len([p.project_id for p in user.projects]) == 2
    # check user projects
    for project in user.projects:
        org_data = project_data[project.project_id]
        assert org_data.config.get("id") == project.project_id
        assert Path(asreview_path() / project.project_id).exists()


# Test linking projects with a typo
def test_link_projects_interactively_with_typo(client_auth):
    # import projects
    proj1, proj2 = import_2_unauthenticated_projects()
    # create a user
    user = crud.create_user(DB, 1)
    # check the database
    assert crud.count_users() == 1
    assert crud.count_projects() == 0
    # create AuthTool object
    auth_tool = get_auth_tool_object(Namespace(json=None))
    # run function with patched input (there is a wrong id in there)
    with patch("builtins.input", side_effect=[user.id, str(-5), user.id]):
        # link project to user
        auth_tool.link_projects()
    # check database again
    assert crud.count_projects() == 2


# Test failure of anything related to projects if a project is older
# than version 0.x.
@pytest.mark.parametrize(
    "method", ["_generate_project_links", "list_projects", "link_projects"]
)
def test_projects_with_0x_projects(client_auth, method):
    # import projects
    tests_folder = Path(__file__).parent.parent
    asreview_v0_18_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v0.18",
        "asreview-project-v0-18-startreview.asreview",
    )

    with pytest.raises(ValueError):
        asr.Project.load(
            open(asreview_v0_18_file, "rb"), asreview_path(), safe_import=True
        )
