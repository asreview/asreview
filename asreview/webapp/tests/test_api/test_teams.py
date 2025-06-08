from inspect import getfullargspec

import pytest

import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp import DB

# NOTE: user 1 is signed in and has a single project, invites
# other users who accept and reject


def verify_user_summary(response_json, user):
    return all(
        k in response_json["user"] and response_json["user"][k] == v
        for k, v in user.summarize().items()
    )


# Test sending an invitation
def test_user1_sends_invitation(setup_auth):
    client, _, user2, _, project = setup_auth
    # invite
    r = au.invite(client, project, user2)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert verify_user_summary(r.json, user2)
    assert r.json["user"]["pending"]
    assert r.json["user"]["deletable"]
    assert not r.json["user"]["me"]
    assert not r.json["user"]["member"]
    assert not r.json["user"]["selectable"]
    assert not r.json["user"]["owner"]


# Testing listing invitations
def test_user2_list_invitations(setup_auth):
    client, user1, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # get all invitations
    r = au.list_invitations(client)
    invitations = r.json["invited_for_projects"]
    assert r.status_code == 200
    assert len(invitations) == 1
    assert invitations[0]["project_id"] == project.project_id
    assert invitations[0]["owner_id"] == user1.id


# Testing accepting an invitation
def test_user2_accept_invitation(setup_auth):
    client, _, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation
    r = au.accept_invitation(client, project)
    assert r.status_code == 200
    assert r.json["id"] == project.id


# Test rejecting invitation
def test_user2_rejects_invitation(setup_auth):
    client, _, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # reject invitation
    r = au.reject_invitation(client, project)
    assert r.status_code == 200
    assert r.json["id"] == project.id


# Test owner removes invitation
def test_owner_deletes_invitation(setup_auth):
    client, _, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # remove invitation
    r = au.delete_invitation(client, project, user2)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user2)
    assert not r.json["user"]["pending"]
    assert not r.json["user"]["deletable"]
    assert not r.json["user"]["me"]
    assert not r.json["user"]["member"]
    assert r.json["user"]["selectable"]
    assert not r.json["user"]["owner"]


# Test owner views collaboration team
def test_view_collaboration_team_with_pending_invitation(setup_auth):
    client, user1, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # checks team
    r = au.list_collaborators(client, project)
    assert r.status_code == 200
    assert [item["id"] for item in r.json if item["member"]] == [user1.id]
    assert [item["id"] for item in r.json if item["pending"]] == [user2.id]


# Test owner views collaboration team
def test_view_collaboration_team_with_accepted_invitation(setup_auth):
    client, user1, user2, _, project = setup_auth
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
    r = au.list_collaborators(client, project)
    assert r.status_code == 200
    assert {item["id"] for item in r.json if item["member"]} == {user1.id, user2.id}
    assert [item["id"] for item in r.json if item["pending"]] == []


# Test owner removes collaboration
def test_owner_deletes_collaboration(setup_auth):
    client, user1, user2, _, project = setup_auth
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
    r = au.delete_collaboration(client, project, user2)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user2)
    assert not r.json["user"]["pending"]
    assert not r.json["user"]["deletable"]
    assert not r.json["user"]["me"]
    assert not r.json["user"]["member"]
    assert r.json["user"]["selectable"]
    assert not r.json["user"]["owner"]


# Test collaborator withdraws from collaboration
def test_collaborator_withdrawal(setup_auth):
    client, _, user2, _, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 2
    au.signin_user(client, user2)
    # accept invitation and signs out
    au.accept_invitation(client, project)
    # withdrawal
    r = au.delete_collaboration(client, project, user2)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user2)
    assert not r.json["user"]["pending"]
    assert not r.json["user"]["deletable"]
    assert r.json["user"]["me"]
    assert not r.json["user"]["member"]
    assert r.json["user"]["selectable"]
    assert not r.json["user"]["owner"]


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
        au.delete_collaboration,
    ],
)
# Test login required for all api routes
def test_login_required(setup_auth, api_call):
    client, _, user2, _, project = setup_auth
    au.signout_user(client)
    number_of_params = len(getfullargspec(api_call).args)
    if number_of_params == 1:
        r = api_call(client)
    elif number_of_params == 2:
        r = api_call(client, project)
    elif number_of_params == 3:
        r = api_call(client, project, user2)
    # all calls must return a 401:
    assert r.status_code == 401


# ###################
# TEST NO PERMISSION
# ###################


# Test user3 can't see invite from user 1 to user 2
def test_user3_cant_see_other_invites(setup_auth):
    client, _, user2, user3, project = setup_auth
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # get all invitations
    r = au.list_invitations(client)
    assert r.status_code == 200
    assert r.json["invited_for_projects"] == []


# Test user3 can't accept invite to user 2
def test_user3_cant_reject_invite_of_user_2(setup_auth):
    client, _, user2, user3, project = setup_auth
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    r = au.accept_invitation(client, project)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# Test user3 can't reject invite to user 2
def test_user3_cant_accept_invite_of_user_2(setup_auth):
    client, _, user2, user3, project = setup_auth
    # invite to make sure we have an invitation (user1 is signed in)
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    r = au.reject_invitation(client, project)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# Test user3 can't delete invitation
def test_user3_cant_delete_invitation(setup_auth):
    client, _, user2, user3, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # remove invitation
    r = au.delete_invitation(client, project, user2)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# Test user3 can't see collaboration team of user 1
def test_user3_cant_see_collaboration_team(setup_auth):
    client, _, user2, user3, project = setup_auth
    # invite
    au.invite(client, project, user2)
    # signout user 1
    au.signout_user(client)
    # signin user 3 (not invited)
    au.signin_user(client, user3)
    # check team
    r = au.list_collaborators(client, project)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# Test user3 can't remove collaboration
def test_user3_cant_delete_collaboration(setup_auth):
    client, _, user2, user3, project = setup_auth
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
    r = au.delete_collaboration(client, project, user2)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# ###################
# TEST ADMIN FUNCTIONALITY
# ###################


# Test admin can delete invitation from another user's project
def test_admin_can_delete_invitation(setup_auth):
    """Test that an admin can delete a pending invitation from a project she don't owns"""
    client, user1, user2, _, project = setup_auth

    # User1 (project owner) invites user2
    r = au.invite(client, project, user2)
    assert r.status_code == 200
    assert r.json["user"]["pending"]

    # Verify invitation exists
    r = au.list_collaborators(client, project)
    assert r.status_code == 200
    pending_users = [item for item in r.json if item["pending"]]
    assert len(pending_users) == 1
    assert pending_users[0]["id"] == user2.id

    # Sign out user1
    au.signout_user(client)

    # Create admin user (user4) and sign in
    admin_user = au.create_and_signin_user(
        client, 4
    )  # Note: create_and_signin_user creates a new user
    admin_user.role = "admin"
    DB.session.commit()

    # Admin should be able to delete the invitation
    r = au.delete_invitation(client, project, user2)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user2)
    assert not r.json["user"]["pending"]
    assert not r.json["user"]["deletable"]  # No longer deletable since not pending
    assert r.json["user"]["selectable"]  # Should be selectable again


# Test admin can delete collaboration from another user's project
def test_admin_can_delete_collaboration(setup_auth):
    """Test that an admin can delete an active collaboration from a project she don't owns"""
    client, user1, user2, _, project = setup_auth

    # User1 (project owner) invites user2
    au.invite(client, project, user2)

    # User2 accepts invitation
    au.signout_user(client)
    au.signin_user(client, user2)
    au.accept_invitation(client, project)
    au.signout_user(client)

    # Sign back in as user1 to verify collaboration exists
    au.signin_user(client, user1)
    r = au.list_collaborators(client, project)
    assert r.status_code == 200
    members = [item for item in r.json if item["member"]]
    assert len(members) == 2  # user1 (owner) and user2 (collaborator)
    member_ids = {item["id"] for item in members}
    assert user1.id in member_ids
    assert user2.id in member_ids

    # Sign out user1
    au.signout_user(client)

    # Create admin user and sign in
    admin_user = au.create_and_signin_user(client, 4)  # Creates a new admin user
    admin_user.role = "admin"
    DB.session.commit()

    # Admin should be able to remove the collaboration
    r = au.delete_collaboration(client, project, user2)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user2)
    assert not r.json["user"]["pending"]
    assert not r.json["user"]["member"]
    assert not r.json["user"]["deletable"]  # No longer deletable since not a member
    assert r.json["user"]["selectable"]  # Should be selectable again


# Test admin can send invitations to projects they don't own
def test_admin_can_invite_to_any_project(setup_auth):
    """Test that an admin can send invitations to projects they don't own"""
    client, user1, user2, user3, project = setup_auth

    # Sign out project owner (user1)
    au.signout_user(client)

    # Create admin user and sign in (use user number 4 to avoid conflicts)
    admin_user = au.create_and_signin_user(client, 4)
    admin_user.role = "admin"
    DB.session.commit()

    # Admin should be able to invite user2 to user1's project
    r = au.invite(client, project, user2)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert verify_user_summary(r.json, user2)
    assert r.json["user"]["pending"]
    assert r.json["user"]["deletable"]
    assert not r.json["user"]["me"]
    assert not r.json["user"]["member"]
    assert not r.json["user"]["selectable"]
    assert not r.json["user"]["owner"]

    # Verify invitation was created by checking collaborators list
    r = au.list_collaborators(client, project)
    assert r.status_code == 200
    pending_users = [item for item in r.json if item["pending"]]
    assert len(pending_users) == 1
    assert pending_users[0]["id"] == user2.id


# Test admin invite permissions for non-admin users
def test_non_admin_cannot_invite_to_others_project(setup_auth):
    """Test that a non-admin user cannot send invitations to projects they don't own"""
    client, user1, user2, user3, project = setup_auth

    # Sign out project owner (user1)
    au.signout_user(client)

    # Sign in as user3 (not owner, not admin)
    au.signin_user(client, user3)

    # user3 should NOT be able to invite user2 to user1's project
    r = au.invite(client, project, user2)
    assert r.status_code == 404
    assert r.json["message"] == "Request can not made by current user."


# Test admin invite validation respects database constraints
def test_admin_invite_validation(setup_auth):
    """Test that admin invite functionality respects database constraints and business logic"""
    client, user1, user2, user3, project = setup_auth

    # User1 invites user2 first
    r = au.invite(client, project, user2)
    assert r.status_code == 200

    # Sign out user1
    au.signout_user(client)

    # Create admin user and sign in (use user number 4 to avoid conflicts)
    admin_user = au.create_and_signin_user(client, 4)
    admin_user.role = "admin"
    DB.session.commit()

    # Admin trying to invite user2 again should fail due to unique constraint
    # (user2 already has a pending invitation)
    r = au.invite(client, project, user2)
    assert r.status_code == 404  # Database constraint prevents duplicate invitations
    assert "not invited" in r.json["message"]

    # Admin should be able to invite user3 (who hasn't been invited yet)
    r = au.invite(client, project, user3)
    assert r.status_code == 200
    assert verify_user_summary(r.json, user3)
    assert r.json["user"]["pending"]
