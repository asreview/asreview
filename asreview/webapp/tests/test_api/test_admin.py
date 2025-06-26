# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json

from asreview.webapp import DB
import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp.tests.utils.config_parser import get_user
import asreview.webapp.tests.utils.crud as crud


# ###################
# ADMIN GET USERS
# ###################


def test_get_users_as_admin(client_auth):
    """Test that admin can retrieve all users"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()

    # Create a few regular users
    regular_user_1 = get_user(2)
    regular_user_2 = get_user(3)
    au.signup_user(client_auth, regular_user_1)
    au.signup_user(client_auth, regular_user_2)

    # signin Admin (remember that signing up means
    # signing in now).
    au.signin_user(client_auth, user)

    # Test get all users
    response = client_auth.get("/admin/users")

    assert response.status_code == 200
    data = response.get_json()
    assert "users" in data
    assert len(data["users"]) == 3  # admin + 2 regular users

    # Check if admin user is in the list
    admin_found = False
    for user_data in data["users"]:
        if user_data["identifier"] == admin_user.identifier:
            assert user_data["role"] == "admin"
            admin_found = True
            break
    assert admin_found


def test_get_users_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot retrieve all users"""
    # Create regular user
    regular_user = get_user(1)
    au.signup_user(client_auth, regular_user)
    au.signin_user(client_auth, regular_user)

    # Test get all users as non-admin
    response = client_auth.get("/admin/users")

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_get_users_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot retrieve all users"""
    response = client_auth.get("/admin/users")

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


# ###################
# ADMIN CREATE USER
# ###################


def test_create_user_as_admin(client_auth):
    """Test that admin can create new users"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Create new user via API
    new_user_data = {
        "identifier": "newuser@example.com",
        "origin": "asreview",
        "email": "newuser@example.com",
        "name": "New User",
        "affiliation": "Test University",
        "password": "TestPassword123",
        "role": "member",
    }

    response = client_auth.post(
        "/admin/users", data=json.dumps(new_user_data), content_type="application/json"
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "User created successfully"
    assert data["user"]["identifier"] == new_user_data["identifier"]
    assert data["user"]["role"] == "member"

    # Verify user was created in database
    created_user = crud.get_user_by_identifier(new_user_data["identifier"])
    assert created_user is not None
    assert created_user.email == new_user_data["email"]
    assert created_user.name == new_user_data["name"]


def test_create_user_as_admin_with_admin_role(client_auth):
    """Test that admin can create other admin users"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Create new admin user via API
    new_admin_data = {
        "identifier": "newadmin@example.com",
        "email": "newadmin@example.com",
        "name": "New Admin",
        "password": "AdminPassword123",
        "role": "admin",
    }

    response = client_auth.post(
        "/admin/users", data=json.dumps(new_admin_data), content_type="application/json"
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["user"]["role"] == "admin"

    # Verify user was created with admin role
    created_user = crud.get_user_by_identifier(new_admin_data["identifier"])
    assert created_user.role == "admin"


def test_create_user_duplicate_identifier(client_auth):
    """Test creating user with duplicate identifier fails"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to create user with same identifier as admin
    duplicate_user_data = {
        "identifier": admin_user.identifier,
        "email": admin_user.identifier,
        "name": "Different User",
        "password": "TestPassword123",
    }

    response = client_auth.post(
        "/admin/users",
        data=json.dumps(duplicate_user_data),
        content_type="application/json",
    )

    assert response.status_code == 409
    data = response.get_json()
    assert "already exists" in data["message"]


def test_create_user_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot create users"""
    # Create regular user
    regular_user = get_user(1)
    au.signup_user(client_auth, regular_user)
    au.signin_user(client_auth, regular_user)

    # Try to create user as non-admin
    new_user_data = {
        "identifier": "newuser@example.com",
        "email": "newuser@example.com",
        "name": "New User",
        "password": "TestPassword123",
    }

    response = client_auth.post(
        "/admin/users", data=json.dumps(new_user_data), content_type="application/json"
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


# ###################
# ADMIN UPDATE USER
# ###################


def test_update_user_as_admin(client_auth):
    """Test that admin can update users"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Create regular user to update
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Update user data
    update_data = {
        "name": "Updated Name",
        "affiliation": "Updated University",
        "role": "admin",
    }

    response = client_auth.put(
        f"/admin/users/{regular_user_obj.id}",
        data=json.dumps(update_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "User updated successfully"
    assert data["user"]["name"] == "Updated Name"
    assert data["user"]["role"] == "admin"

    # Verify updates in database
    updated_user = crud.get_user_by_identifier(regular_user.identifier)
    assert updated_user.name == "Updated Name"
    assert updated_user.affiliation == "Updated University"
    assert updated_user.role == "admin"


def test_update_nonexistent_user(client_auth):
    """Test updating non-existent user returns 404"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to update non-existent user
    update_data = {"name": "Updated Name"}

    response = client_auth.put(
        "/admin/users/99999",
        data=json.dumps(update_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "User not found"


def test_update_user_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot update users"""
    # Create two regular users
    user1 = get_user(1)
    user2 = get_user(2)
    au.signup_user(client_auth, user1)
    au.signup_user(client_auth, user2)

    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Sign in as first user (non-admin)
    au.signin_user(client_auth, user1)

    # Try to update second user
    update_data = {"name": "Updated Name"}

    response = client_auth.put(
        f"/admin/users/{user2_obj.id}",
        data=json.dumps(update_data),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


# ###################
# ADMIN DELETE USER
# ###################


def test_delete_user_as_admin(client_auth):
    """Test that admin can delete users"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Create regular user to delete
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Set user as admin and sign in
    admin_user = crud.get_user_by_identifier(admin_user.identifier)
    admin_user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # verify we have 2 users
    assert len(crud.list_users()) == 2

    # Delete user
    response = client_auth.delete(f"/admin/users/{regular_user_obj.id}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "User deleted successfully"
    assert data["deleted_user"]["identifier"] == regular_user.identifier

    # Verify user was deleted from database
    all_users = crud.list_users()
    assert len(all_users) == 1
    assert all_users[0].id == admin_user.id


def test_delete_nonexistent_user(client_auth):
    """Test deleting non-existent user returns 404"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to delete non-existent user
    response = client_auth.delete("/admin/users/99999")

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "User not found"


def test_delete_user_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot delete users"""
    # Create two regular users
    user1 = get_user(1)
    user2 = get_user(2)
    au.signup_user(client_auth, user1)
    au.signup_user(client_auth, user2)

    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Sign in as first user (non-admin)
    au.signin_user(client_auth, user1)

    # Try to delete second user
    response = client_auth.delete(f"/admin/users/{user2_obj.id}")

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


# ###################
# ADMIN GET SINGLE USER
# ###################


def test_get_single_user_as_admin(client_auth):
    """Test that admin can retrieve a specific user"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Create regular user
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get specific user
    response = client_auth.get(f"/admin/users/{regular_user_obj.id}")

    assert response.status_code == 200
    data = response.get_json()
    assert "user" in data
    assert data["user"]["identifier"] == regular_user.identifier
    assert data["user"]["email"] == regular_user.email
    assert data["user"]["name"] == regular_user.name


def test_get_single_nonexistent_user(client_auth):
    """Test getting non-existent user returns 404"""
    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to get non-existent user
    response = client_auth.get("/admin/users/99999")

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "User not found"


def test_get_single_user_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot retrieve specific users"""
    # Create two regular users
    user1 = get_user(1)
    user2 = get_user(2)
    au.signup_user(client_auth, user1)
    au.signup_user(client_auth, user2)

    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Sign in as first user (non-admin)
    au.signin_user(client_auth, user1)

    # Try to get second user
    response = client_auth.get(f"/admin/users/{user2_obj.id}")

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


# ###################
# ADMIN GET PROJECTS
# ###################


def _create_test_users_with_projects(client_auth):
    """Helper function to create real users and projects for testing"""
    # Create first user and project
    user1 = get_user(1)
    au.signup_user(client_auth, user1)
    au.signin_user(client_auth, user1)

    # Create project for user1
    response1 = au.create_project(
        client_auth, mode="oracle", benchmark="synergy:van_der_Valk_2021"
    )
    assert response1.status_code == 201
    project1_data = response1.get_json()

    # Sign out user1
    au.signout_user(client_auth)

    # Create second user and project
    user2 = get_user(2)
    au.signup_user(client_auth, user2)
    au.signin_user(client_auth, user2)

    # Create project for user2
    response2 = au.create_project(
        client_auth, mode="oracle", benchmark="synergy:van_der_Valk_2021"
    )
    assert response2.status_code == 201
    project2_data = response2.get_json()

    # Sign out user2
    au.signout_user(client_auth)

    return {
        "user1": user1,
        "user2": user2,
        "project1": project1_data,
        "project2": project2_data,
    }


def test_get_projects_as_admin(client_auth):
    """Test that admin can retrieve all projects"""
    # Create test users with real projects
    _create_test_users_with_projects(client_auth)

    # Create admin user
    admin_user = get_user(3)  # Use user 3 since 1 and 2 are already used
    au.signup_user(client_auth, admin_user)

    # Set user as admin and sign in
    user = crud.get_user_by_identifier(admin_user.identifier)
    user.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Test get all projects
    response = client_auth.get("/admin/projects")

    assert response.status_code == 200
    data = response.get_json()
    assert "projects" in data
    assert "total_count" in data
    assert isinstance(data["projects"], list)
    assert isinstance(data["total_count"], int)
    assert data["total_count"] == 2  # Should see both projects from users 1 and 2


def test_get_projects_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot retrieve all projects"""
    # Create test users with real projects
    _create_test_users_with_projects(client_auth)

    # Create regular (non-admin) user
    regular_user = get_user(3)  # Use user 3 since 1 and 2 are already used
    au.signup_user(client_auth, regular_user)
    au.signin_user(client_auth, regular_user)

    # Test get all projects as non-admin - should be forbidden regardless
    # of existing projects
    response = client_auth.get("/admin/projects")

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_get_projects_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot retrieve all projects"""
    response = client_auth.get("/admin/projects")

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


# ###################
# ADMIN PROJECT OWNERSHIP TRANSFER
# ###################


def test_transfer_ownership_to_non_member(client_auth):
    """Test transferring project ownership to a user who is not a collaborator"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Verify initial state - user1 is owner, user2 is not collaborator
    assert project1_obj.owner_id == crud.get_user_by_identifier(user1.identifier).id
    assert user2_obj not in project1_obj.collaborators
    assert user2_obj not in project1_obj.pending_invitations

    # Transfer ownership from user1 to user2
    transfer_data = {"new_owner_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Project ownership transferred successfully"
    assert data["project"]["new_owner"]["id"] == user2_obj.id
    assert data["project"]["new_owner"]["name"] == user2_obj.name

    # Verify final state - user2 is now owner, user1 is completely removed
    DB.session.refresh(project1_obj)
    assert project1_obj.owner_id == user2_obj.id
    assert (
        crud.get_user_by_identifier(user1.identifier) not in project1_obj.collaborators
    )
    assert (
        user2_obj not in project1_obj.collaborators
    )  # New owner shouldn't be in collaborators


def test_transfer_ownership_to_existing_collaborator(client_auth):
    """Test transferring project ownership to an existing collaborator"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Add user2 as a collaborator to project1
    crud.create_collaboration(DB, project1_obj, user2_obj)

    # Verify initial state - user1 is owner, user2 is collaborator
    assert project1_obj.owner_id == user1_obj.id
    assert user2_obj in project1_obj.collaborators

    # Transfer ownership from user1 to user2 (existing collaborator)
    transfer_data = {"new_owner_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Project ownership transferred successfully"
    assert data["project"]["new_owner"]["id"] == user2_obj.id

    # Verify final state - user2 is owner and removed from collaborators, user1 is completely removed
    DB.session.refresh(project1_obj)
    assert project1_obj.owner_id == user2_obj.id
    assert (
        user2_obj not in project1_obj.collaborators
    )  # New owner removed from collaborators
    assert (
        user1_obj not in project1_obj.collaborators
    )  # Old owner not added as collaborator


def test_transfer_ownership_to_user_with_pending_invitation(client_auth):
    """Test transferring project ownership to a user with a pending invitation"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Add user2 as a pending invitation to project1
    crud.create_invitation(DB, project1_obj, user2_obj)

    # Verify initial state - user1 is owner, user2 has pending invitation
    assert project1_obj.owner_id == user1_obj.id
    assert user2_obj in project1_obj.pending_invitations
    assert user2_obj not in project1_obj.collaborators

    # Transfer ownership from user1 to user2 (who has pending invitation)
    transfer_data = {"new_owner_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Project ownership transferred successfully"
    assert data["project"]["new_owner"]["id"] == user2_obj.id

    # Verify final state - user2 is owner and removed from pending invitations, user1 is completely removed
    DB.session.refresh(project1_obj)
    assert project1_obj.owner_id == user2_obj.id
    assert (
        user2_obj not in project1_obj.pending_invitations
    )  # New owner removed from pending invitations
    assert user2_obj not in project1_obj.collaborators  # New owner not in collaborators
    assert (
        user1_obj not in project1_obj.collaborators
    )  # Old owner not added as collaborator


def test_transfer_ownership_to_current_owner_fails(client_auth):
    """Test that transferring ownership to the current owner fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)

    # Try to transfer ownership to the current owner (should fail)
    transfer_data = {"new_owner_id": user1_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "User is already the owner of this project"


def test_transfer_ownership_nonexistent_project(client_auth):
    """Test transferring ownership of non-existent project fails"""
    # Create a regular user to transfer to
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to transfer ownership of non-existent project
    transfer_data = {"new_owner_id": regular_user_obj.id}
    response = client_auth.post(
        "/admin/projects/99999/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "Project not found"


def test_transfer_ownership_nonexistent_user(client_auth):
    """Test transferring ownership to non-existent user fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to transfer ownership to non-existent user
    transfer_data = {"new_owner_id": 99999}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "New owner not found"


def test_transfer_ownership_missing_new_owner_id(client_auth):
    """Test transferring ownership without providing new_owner_id fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to transfer ownership without new_owner_id
    transfer_data = {}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "new_owner_id is required"


def test_transfer_ownership_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot transfer project ownership"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    project = test_data["project2"]

    # Sign in as regular user (user1, who owns the project)
    au.signin_user(client_auth, user1)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)

    # Try to transfer ownership as non-admin
    transfer_data = {"new_owner_id": user1_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_transfer_ownership_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot transfer project ownership"""
    # Don't sign in any user

    # Try to transfer ownership without authentication
    transfer_data = {"new_owner_id": 1}
    response = client_auth.post(
        "/admin/projects/1/transfer-ownership",
        data=json.dumps(transfer_data),
        content_type="application/json",
    )

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


# ###################
# ADMIN ADD PROJECT MEMBER
# ###################


def test_add_member_to_project_as_admin(client_auth):
    """Test that admin can add a member directly to any project"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Verify initial state - user1 is owner, user2 is not involved
    assert project1_obj.owner_id == user1_obj.id
    assert user2_obj not in project1_obj.collaborators
    assert user2_obj not in project1_obj.pending_invitations

    # Add user2 as member to project1
    add_member_data = {"user_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Member added successfully"
    assert data["user"]["id"] == user2_obj.id
    assert data["user"]["member"] is True
    assert data["user"]["owner"] is False
    assert data["user"]["pending"] is False

    # Verify final state - user2 is now a collaborator
    DB.session.refresh(project1_obj)
    assert user2_obj in project1_obj.collaborators
    assert user2_obj not in project1_obj.pending_invitations


def test_add_member_to_project_already_owner_fails(client_auth):
    """Test that trying to add project owner as member fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user1_obj = crud.get_user_by_identifier(user1.identifier)

    # Try to add project owner as member (should fail)
    add_member_data = {"user_id": user1_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "Cannot add project owner as member"


def test_add_member_to_project_already_member_fails(client_auth):
    """Test that trying to add existing member fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Add user2 as collaborator first
    crud.create_collaboration(DB, project1_obj, user2_obj)

    # Try to add user2 again (should fail)
    add_member_data = {"user_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "User is already a member"


def test_add_member_to_project_with_pending_invitation_fails(client_auth):
    """Test that trying to add user with pending invitation fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Add user2 as pending invitation first
    crud.create_invitation(DB, project1_obj, user2_obj)

    # Try to add user2 as member directly (should fail)
    add_member_data = {"user_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "User already has a pending invitation"


def test_add_member_nonexistent_project_fails(client_auth):
    """Test adding member to non-existent project fails"""
    # Create a regular user to add
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Create admin user
    admin_user = get_user(1)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Try to add member to non-existent project
    add_member_data = {"user_id": regular_user_obj.id}
    response = client_auth.post(
        "/admin/projects/99999/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "Project not found"


def test_add_member_nonexistent_user_fails(client_auth):
    """Test adding non-existent user as member fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to add non-existent user as member
    add_member_data = {"user_id": 99999}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "User not found"


def test_add_member_missing_user_id_fails(client_auth):
    """Test adding member without providing user_id fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to add member without user_id
    add_member_data = {}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "User ID is required"


def test_add_member_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot add members to projects"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    user1 = test_data["user1"]
    user2 = test_data["user2"]
    project1 = test_data["project1"]

    # Sign in as regular user (user1, who owns the project)
    au.signin_user(client_auth, user1)

    # Get project and user objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Try to add member as non-admin (even if project owner)
    add_member_data = {"user_id": user2_obj.id}
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_add_member_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot add members to projects"""
    # Don't sign in any user

    # Try to add member without authentication
    add_member_data = {"user_id": 1}
    response = client_auth.post(
        "/admin/projects/1/add-member",
        data=json.dumps(add_member_data),
        content_type="application/json",
    )

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


def test_add_member_invalid_json_fails(client_auth):
    """Test adding member with malformed JSON data fails"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user = get_user(3)
    au.signup_user(client_auth, admin_user)
    admin_user_obj = crud.get_user_by_identifier(admin_user.identifier)
    admin_user_obj.role = "admin"
    DB.session.commit()
    au.signin_user(client_auth, admin_user)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to add member with malformed JSON (this will cause Flask to return 400 for bad JSON)
    response = client_auth.post(
        f"/admin/projects/{project1_obj.id}/add-member",
        data="{invalid json syntax",
        content_type="application/json",
    )

    # Flask route should return 500 status code
    assert response.status_code == 500
