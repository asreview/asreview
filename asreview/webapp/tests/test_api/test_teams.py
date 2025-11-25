import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp import DB
from asreview.webapp._authentication.models import Project
from asreview.webapp.tests.utils.config_parser import get_user


def test_join_project_with_valid_token(setup_auth):
    """Test that a user can join a project with a valid invitation token"""
    client, user1, user2, user3, project = setup_auth

    # Ensure user1 (owner) is signed in to generate token
    au.signin_user(client, user1)

    # Generate invitation link as project owner (user1)
    r_gen = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen.status_code == 200
    encoded_token = r_gen.json["encoded_token"]

    # Refresh database session to ensure token is committed
    DB.session.expire_all()

    # Switch to user2 and join the project
    au.signin_user(client, user2)
    r_join = client.post(
        "/api/team/join",
        json={"encoded_token": encoded_token},
        content_type="application/json",
    )
    assert r_join.status_code == 200
    assert "Successfully joined the project" in r_join.json["message"]
    assert r_join.json["project_id"] == project.project_id

    # Verify user2 is now a collaborator
    project_db = Project.query.filter(
        Project.project_id == project.project_id
    ).one_or_none()
    assert user2 in project_db.collaborators


def test_join_project_already_member(setup_auth):
    """Test that joining when already a member returns appropriate message"""
    client, user1, user2, user3, project = setup_auth

    # Ensure user1 (owner) is signed in to generate token
    au.signin_user(client, user1)

    # Generate invitation link and add user2 as collaborator
    r_gen = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen.status_code == 200
    encoded_token = r_gen.json["encoded_token"]

    # Refresh database session to ensure token is committed
    DB.session.expire_all()

    # Add user2 as collaborator manually
    project_db = Project.query.filter(
        Project.project_id == project.project_id
    ).one_or_none()
    project_db.collaborators.append(user2)
    DB.session.commit()

    # Refresh database session
    DB.session.expire_all()

    # Try to join again as user2
    au.signin_user(client, user2)
    r_join = client.post(
        "/api/team/join",
        json={"encoded_token": encoded_token},
        content_type="application/json",
    )
    assert r_join.status_code == 200
    assert "already a member" in r_join.json["message"].lower()
    assert r_join.json["already_member"] is True


def test_join_project_as_owner(setup_auth):
    """Test that the project owner cannot join their own project"""
    client, user1, user2, user3, project = setup_auth

    # Ensure user1 (owner) is signed in
    au.signin_user(client, user1)

    # Generate invitation link as project owner (user1)
    r_gen = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen.status_code == 200
    encoded_token = r_gen.json["encoded_token"]

    # Refresh database session to ensure token is committed
    DB.session.expire_all()

    # Try to join as owner (user1 is signed in)
    r_join = client.post(
        "/api/team/join",
        json={"encoded_token": encoded_token},
        content_type="application/json",
    )
    assert r_join.status_code == 200
    assert "already the owner" in r_join.json["message"].lower()
    assert r_join.json["already_member"] is True


def test_join_project_with_invalid_token(setup_auth):
    """Test that joining with an invalid token fails"""
    client, user1, user2, user3, project = setup_auth

    # Switch to user2
    au.signin_user(client, get_user(2))

    # Try to join with invalid token
    r_join = client.post(
        "/api/team/join",
        json={"encoded_token": "invalid_token_xyz"},
        content_type="application/json",
    )
    assert r_join.status_code == 400
    assert "Token is not valid" in r_join.json["message"]


def test_join_project_with_revoked_token(setup_auth):
    """Test that joining with a revoked token fails"""
    client, user1, user2, user3, project = setup_auth

    # Ensure user1 (owner) is signed in to generate token
    au.signin_user(client, user1)

    # Generate invitation link as project owner (user1)
    r_gen = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen.status_code == 200
    encoded_token = r_gen.json["encoded_token"]

    # Refresh database session to ensure token is committed
    DB.session.expire_all()

    # Revoke the invitation link
    r_revoke = client.delete(f"/api/projects/{project.project_id}/invitation-link")
    assert r_revoke.status_code == 200

    # Try to join with revoked token as user2
    au.signin_user(client, user2)
    r_join = client.post(
        "/api/team/join",
        json={"encoded_token": encoded_token},
        content_type="application/json",
    )
    assert r_join.status_code == 400
    assert "is not valid" in r_join.json["message"].lower()


def test_join_project_with_regenerated_token(setup_auth):
    """Test that old token becomes invalid after regeneration"""
    client, user1, user2, user3, project = setup_auth

    # Ensure user1 (owner) is signed in
    au.signin_user(client, user1)

    # Generate first invitation link
    r_gen1 = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen1.status_code == 200
    old_token = r_gen1.json["encoded_token"]

    # Regenerate invitation link
    r_gen2 = client.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r_gen2.status_code == 200
    new_token = r_gen2.json["encoded_token"]

    # Refresh database session to ensure new token is committed
    DB.session.expire_all()

    # Try to join with old token as user2
    au.signin_user(client, user2)
    r_join_old = client.post(
        "/api/team/join",
        json={"encoded_token": old_token},
        content_type="application/json",
    )
    assert r_join_old.status_code == 400
    assert "is not valid" in r_join_old.json["message"].lower()

    # Join with new token should work
    r_join_new = client.post(
        "/api/team/join",
        json={"encoded_token": new_token},
        content_type="application/json",
    )
    assert r_join_new.status_code == 200
    assert "Successfully joined" in r_join_new.json["message"]


def test_join_project_without_token(setup_auth):
    """Test that joining without providing a token fails"""
    client, user1, user2, user3, project = setup_auth

    # Switch to user2
    au.signin_user(client, get_user(2))

    # Try to join without token
    r_join = client.post(
        "/api/team/join",
        json={},
        content_type="application/json",
    )
    assert r_join.status_code == 400
    assert "No invitation token provided" in r_join.json["message"]
