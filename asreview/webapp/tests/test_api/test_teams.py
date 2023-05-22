from inspect import getfullargspec

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


# NOTE: user 1 is signed in and has a single project, invites
# other users who accept and reject


# Test sending an invitation
def test_user1_sends_invitation(setup):
    client, _, user2, _, project = setup
    # invite
    status_code, resp_data = au.invite(client, project, user2)
    assert status_code == 200
    assert resp_data["message"] == 'User "user2@asreview.nl" invited.'


# Testing listing invitations
def test_user2_list_invitations(setup):
    client, user1, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # get all invitations
    status_code, resp_data = au.list_invitations(client)
    invitations = resp_data["invited_for_projects"]
    assert status_code == 200
    assert len(invitations) == 1
    assert invitations[0]["project_id"] == project.project_id
    assert invitations[0]["owner_id"] == user1.id


# Testing accepting an invitation
def test_user2_accept_invitation(setup):
    client, _, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation
    status_code, resp_data = au.accept_invitation(client, project)
    assert status_code == 200
    assert resp_data["message"] == "User accepted invitation for project."


# Test rejecting invitation
def test_user2_rejects_invitation(setup):
    client, _, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # reject invitation
    status_code, resp_data = au.reject_invitation(client, project)
    assert status_code == 200
    assert resp_data["message"] == "User rejected invitation for project."


# Test owner removes invitation
def test_owner_deletes_invitation(setup):
    client, _, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # remove invitation
    status_code, resp_data = au.delete_invitation(client, project, user2)
    assert status_code == 200
    assert resp_data["message"] == "Owner deleted invitation."


# Test owner views collaboration team
def test_view_collaboration_team_with_pending_invitation(setup):
    client, _, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # checks team
    status_code, resp_data = au.list_collaborators(client, project)
    assert status_code == 200
    assert resp_data["collaborators"] == []
    assert resp_data["invitations"] == [user2.id]


# Test owner views collaboration team
def test_view_collaboration_team_with_accepted_invitation(setup):
    client, user1, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation and signs out
    au.accept_invitation(client, project)
    au.signout_user(client)
    # user 1 signs up
    au.signin_user(client, user1)
    # checks team
    status_code, resp_data = au.list_collaborators(client, project)
    assert status_code == 200
    assert resp_data["collaborators"] == [user2.id]
    assert resp_data["invitations"] == []


# Test owner removes collaboration
def test_owner_deletes_collaboration(setup):
    client, user1, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation and signs out
    au.accept_invitation(client, project)
    au.signout_user(client)
    # user 1 signs up
    au.signin_user(client, user1)
    # remove from team
    status_code, resp_data = au.delete_collaboration(client, project, user2)
    assert status_code == 200
    assert resp_data["message"] == "Collaborator removed from project."


# Test collaborator withdraws from collaboration
def test_collaborator_withdrawal(setup):
    client, _, user2, _, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation and signs out
    au.accept_invitation(client, project)
    # withdrawal
    status_code, resp_data = au.delete_collaboration(client, project, user2)
    assert status_code == 200
    assert resp_data["message"] == "Collaborator removed from project."


# ###################
# TEST LOGIN REQUIRED
# ###################

@pytest.mark.parametrize(
    "api_call",
    [
        au.invite,
        au.list_invitations,
        au.list_collaborators,
        au.accept_invitation,
        au.reject_invitation,
        au.delete_invitation,
        au.delete_collaboration
    ]
)
# Test login required for all api routes
def test_login_required(setup, api_call):
    client, _, user2, _, project = setup
    au.signout_user(client)
    number_of_params = len(getfullargspec(api_call).args)
    if number_of_params == 1:
        status_code, resp_data = api_call(client)
    elif number_of_params == 2:
        status_code, resp_data = api_call(client, project)
    elif number_of_params == 3:
        status_code, resp_data = api_call(client, project, user2)
    # all calls must return a 401:
    assert status_code == 401
    assert resp_data["message"] == "Login required."


# ###################
# TEST NO PERMISSION
# ###################


# Test user3 can't see invite from user 1 to user 2
def test_user3_cant_see_other_invites(setup):
    client, _, user2, user3, project = setup
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # get all invitations
    status_code, resp_data = au.list_invitations(client)
    assert status_code == 200
    assert resp_data["invited_for_projects"] == []


# Test user3 can't accept invite to user 2
def test_user3_cant_reject_invite_of_user_2(setup):
    client, _, user2, user3, project = setup
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    status_code, resp_data = au.accept_invitation(client, project)
    assert status_code == 404
    assert resp_data["message"] == "Request can not made by current user."


# Test user3 can't reject invite to user 2
def test_user3_cant_accept_invite_of_user_2(setup):
    client, _, user2, user3, project = setup
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    status_code, resp_data = au.reject_invitation(client, project)
    assert status_code == 404
    assert resp_data["message"] == "Request can not made by current user."


# Test user3 can't delete invitation
def test_user3_cant_delete_invitation(setup):
    client, _, user2, user3, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # remove invitation
    status_code, resp_data = au.delete_invitation(client, project, user2)
    assert status_code == 404
    assert resp_data["message"] == "Request can not made by current user."


# Test user3 can't see collaboration team of user 1
def test_user3_cant_see_collaboration_team(setup):
    client, _, user2, user3, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # check team
    status_code, resp_data = au.list_collaborators(client, project)
    assert status_code == 404
    assert resp_data["message"] == "Request can not made by current user."


# Test user3 can't remove collaboration
def test_user3_cant_delete_collaboration(setup):
    client, _, user2, user3, project = setup
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation and signs out
    au.accept_invitation(client, project)
    au.signout_user(client)
    # user 3 signs up
    au.signin_user(client, user3)
    # remove from team
    status_code, resp_data = au.delete_collaboration(client, project, user2)
    assert status_code == 404
    assert resp_data["message"] == "Request can not made by current user."
