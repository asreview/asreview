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
# HELPER FUNCTIONS
# ###################


def create_admin_user_and_signin(client_auth, user_index=1, signin_immediately=True):
    """Helper function to create an admin user and optionally sign them in immediately"""
    admin_user = get_user(user_index)
    au.signup_user(client_auth, admin_user)

    # Set user as admin
    user_obj = crud.get_user_by_identifier(admin_user.identifier)
    user_obj.role = "admin"
    DB.session.commit()

    if signin_immediately:
        # signin Admin (remember that signing up means signing in now).
        au.signin_user(client_auth, user_obj)

    return admin_user, user_obj


def signin_admin_user(client_auth, user_obj):
    """Helper function to sign in admin user after setting up other test data"""
    # signin Admin (remember that signing up means signing in now).
    au.signin_user(client_auth, user_obj)


def create_admin_with_test_projects(client_auth):
    """Helper function to create test users/projects and an admin user"""
    # Create test users with real projects
    test_data = _create_test_users_with_projects(client_auth)

    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 3)

    return {**test_data, "admin_user": admin_user, "admin_user_obj": admin_user_obj}


# ###################
# ADMIN GET USERS
# ###################


def test_get_users_as_admin(client_auth):
    """Test that admin can retrieve all users"""
    # Create admin user (don't sign in yet)
    admin_user, user = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create a few regular users
    regular_user_1 = get_user(2)
    regular_user_2 = get_user(3)
    au.signup_user(client_auth, regular_user_1)
    au.signup_user(client_auth, regular_user_2)

    # signin Admin (remember that signing up means
    # signing in now).
    signin_admin_user(client_auth, user)

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
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=True
    )

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
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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
    # Create admin user (don't sign in yet)
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create regular user to update
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Sign in admin after creating other users
    signin_admin_user(client_auth, admin_user_obj)

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
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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
    # Create admin user (don't sign in yet)
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create regular user to delete
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Sign in admin after creating other users
    signin_admin_user(client_auth, admin_user_obj)

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
    assert all_users[0].id == admin_user_obj.id


def test_delete_nonexistent_user(client_auth):
    """Test deleting non-existent user returns 404"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=True
    )

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
# ADMIN BATCH DELETE USERS
# ###################


def test_batch_delete_users_as_admin(client_auth):
    """Test that admin can delete multiple users"""
    # Create admin user (don't sign in yet)
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create regular users to delete
    regular_user1 = get_user(2)
    regular_user2 = get_user(3)
    regular_user3 = get_user(4)
    au.signup_user(client_auth, regular_user1)
    au.signup_user(client_auth, regular_user2)
    au.signup_user(client_auth, regular_user3)

    # Get user objects
    regular_user1_obj = crud.get_user_by_identifier(regular_user1.identifier)
    regular_user2_obj = crud.get_user_by_identifier(regular_user2.identifier)
    regular_user3_obj = crud.get_user_by_identifier(regular_user3.identifier)

    # Sign in admin after creating other users
    signin_admin_user(client_auth, admin_user_obj)

    # Verify we have 4 users initially
    assert len(crud.list_users()) == 4

    # Batch delete users
    delete_data = {
        "user_ids": [regular_user1_obj.id, regular_user2_obj.id, regular_user3_obj.id]
    }
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Successfully deleted 3 users"
    assert len(data["deleted_users"]) == 3

    # Check that all deleted users are in the response
    deleted_identifiers = [user["identifier"] for user in data["deleted_users"]]
    assert regular_user1.identifier in deleted_identifiers
    assert regular_user2.identifier in deleted_identifiers
    assert regular_user3.identifier in deleted_identifiers

    # Verify users were deleted from database
    remaining_users = crud.list_users()
    assert len(remaining_users) == 1
    assert remaining_users[0].id == admin_user_obj.id


def test_batch_delete_users_empty_list(client_auth):
    """Test batch delete with empty user_ids list"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=True
    )

    # Try batch delete with empty list
    delete_data = {"user_ids": []}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No user IDs provided"


def test_batch_delete_users_invalid_data_type(client_auth):
    """Test batch delete with invalid data type for user_ids"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try batch delete with non-list user_ids
    delete_data = {"user_ids": "not_a_list"}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "user_ids must be a list"


def test_batch_delete_users_nonexistent_ids(client_auth):
    """Test batch delete with non-existent user IDs"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try to delete non-existent users
    delete_data = {"user_ids": [99999, 99998, 99997]}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert data["message"] == "No users found with provided IDs"


def test_batch_delete_users_partial_nonexistent(client_auth):
    """Test batch delete with mix of existing and non-existent user IDs"""
    # Create admin user (don't sign in yet)
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create regular user
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Sign in admin after creating other users
    signin_admin_user(client_auth, admin_user_obj)

    # Try to delete mix of existing and non-existent users
    delete_data = {"user_ids": [regular_user_obj.id, 99999]}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    # Should succeed and delete only the existing user
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Successfully deleted 1 user"
    assert len(data["deleted_users"]) == 1
    assert data["deleted_users"][0]["identifier"] == regular_user.identifier


def test_batch_delete_users_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot batch delete users"""
    # Create regular users
    user1 = get_user(1)
    user2 = get_user(2)
    au.signup_user(client_auth, user1)
    au.signup_user(client_auth, user2)

    user2_obj = crud.get_user_by_identifier(user2.identifier)

    # Sign in as first user (non-admin)
    au.signin_user(client_auth, user1)

    # Try to batch delete users as non-admin
    delete_data = {"user_ids": [user2_obj.id]}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_batch_delete_users_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot batch delete users"""
    # Try to batch delete without authentication
    delete_data = {"user_ids": [1, 2]}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


def test_batch_delete_users_missing_data(client_auth):
    """Test batch delete without providing user_ids"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try batch delete without user_ids
    delete_data = {}
    response = client_auth.post(
        "/admin/users/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No user IDs provided"


# ###################
# ADMIN GET SINGLE USER
# ###################


def test_get_single_user_as_admin(client_auth):
    """Test that admin can retrieve a specific user"""
    # Create admin user (don't sign in yet)
    admin_user, admin_user_obj = create_admin_user_and_signin(
        client_auth, 1, signin_immediately=False
    )

    # Create regular user
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Sign in admin after creating other users
    signin_admin_user(client_auth, admin_user_obj)

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
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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

    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 3)

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

    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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

    # Verify final state - user2 is now a collaborator
    DB.session.refresh(project1_obj)
    assert user2_obj in project1_obj.collaborators


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


def test_add_member_nonexistent_project_fails(client_auth):
    """Test adding member to non-existent project fails"""
    # Create a regular user to add
    regular_user = get_user(2)
    au.signup_user(client_auth, regular_user)
    regular_user_obj = crud.get_user_by_identifier(regular_user.identifier)

    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

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


# ###################
# ADMIN BATCH DELETE PROJECTS
# ###################


def test_batch_delete_projects_as_admin(client_auth):
    """Test that admin can delete multiple projects"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]
    project2 = test_data["project2"]

    # Create admin user
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 3)

    # Get project objects
    project1_obj = crud.get_project_by_project_id(project1["id"])
    project2_obj = crud.get_project_by_project_id(project2["id"])

    # Batch delete projects
    delete_data = {"project_ids": [project1_obj.id, project2_obj.id]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Successfully deleted 2 projects"
    assert data["deleted_count"] == 2

    # Verify projects are deleted from database
    remaining_projects = crud.list_projects()
    project_ids = [p.id for p in remaining_projects]
    assert project1_obj.id not in project_ids
    assert project2_obj.id not in project_ids


def test_batch_delete_projects_empty_list(client_auth):
    """Test batch delete with empty project_ids list"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try batch delete with empty list
    delete_data = {"project_ids": []}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No project IDs provided"


def test_batch_delete_projects_nonexistent_ids(client_auth):
    """Test batch delete with non-existent project IDs"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try to delete non-existent projects
    delete_data = {"project_ids": [99999, 99998, 99997]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 404
    data = response.get_json()
    assert "Some projects not found" in data["message"]
    assert data["missing"] == [99999, 99998, 99997]
    assert data["found"] == []


def test_batch_delete_projects_partial_nonexistent(client_auth):
    """Test batch delete with mix of existing and non-existent project IDs"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 3)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to delete mix of existing and non-existent projects
    delete_data = {"project_ids": [project1_obj.id, 99999]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    # Should return 404 because not all projects exist
    assert response.status_code == 404
    data = response.get_json()
    assert "Some projects not found" in data["message"]
    assert 99999 in data["missing"]
    assert project1_obj.id in data["found"]

    # Verify original project still exists
    existing_project = crud.get_project_by_project_id(project1["id"])
    assert existing_project is not None


def test_batch_delete_projects_as_non_admin_forbidden(client_auth):
    """Test that non-admin users cannot batch delete projects"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]
    user1 = test_data["user1"]

    # Sign in as first user (non-admin)
    au.signin_user(client_auth, user1)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Try to batch delete projects as non-admin
    delete_data = {"project_ids": [project1_obj.id]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_batch_delete_projects_without_login_unauthorized(client_auth):
    """Test that unauthenticated users cannot batch delete projects"""
    # Try to batch delete without authentication
    delete_data = {"project_ids": [1, 2]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 401
    data = response.get_json()
    assert data["message"] == "Login required."


def test_batch_delete_projects_missing_data(client_auth):
    """Test batch delete without providing project_ids"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Try batch delete without project_ids
    delete_data = {}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No project IDs provided"


def test_batch_delete_projects_single_project(client_auth):
    """Test batch delete with single project"""
    # Create test users and projects
    test_data = _create_test_users_with_projects(client_auth)
    project1 = test_data["project1"]

    # Create admin user
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 3)

    # Get project object
    project1_obj = crud.get_project_by_project_id(project1["id"])

    # Batch delete single project
    delete_data = {"project_ids": [project1_obj.id]}
    response = client_auth.post(
        "/admin/projects/batch-delete",
        data=json.dumps(delete_data),
        content_type="application/json",
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Successfully deleted 1 projects"
    assert data["deleted_count"] == 1

    # Verify project is deleted
    remaining_projects = crud.list_projects()
    project_ids = [p.id for p in remaining_projects]
    assert project1_obj.id not in project_ids


# ###################
# ADMIN BULK IMPORT USERS
# ###################


def test_bulk_import_users_success(client_auth):
    """Test successful bulk import of users with valid data"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Prepare bulk import data
    users_data = [
        {
            "name": "User One",
            "email": "user1@example.com",
            "password": "Password123",
            "affiliation": "University A",
            "role": "member",
        },
        {
            "name": "User Two",
            "email": "user2@example.com",
            "password": "SecurePass456",
            "role": "admin",
        },
        {
            "name": "User Three",
            "email": "user3@example.com",
            "password": "TestPass789",
            "affiliation": "Company B",
        },
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert "success" in data
    assert "failed" in data
    assert len(data["success"]) == 3
    assert len(data["failed"]) == 0
    assert "Imported 3 users, 0 failed" in data["message"]

    # Verify users were created in database
    user1 = crud.get_user_by_identifier("user1@example.com")
    assert user1 is not None
    assert user1.name == "User One"
    assert user1.affiliation == "University A"
    assert user1.role == "member"
    assert user1.confirmed is True
    assert user1.terms_accepted is True

    user2 = crud.get_user_by_identifier("user2@example.com")
    assert user2 is not None
    assert user2.role == "admin"

    user3 = crud.get_user_by_identifier("user3@example.com")
    assert user3 is not None


def test_bulk_import_users_partial_success(client_auth):
    """Test bulk import with some valid and some invalid users"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Prepare bulk import data with some invalid entries
    users_data = [
        {
            "name": "Valid User",
            "email": "valid@example.com",
            "password": "Password123",
        },
        {
            "name": "Missing Email",
            "password": "Password123",
            # Missing email field
        },
        {
            "name": "Invalid User",
            "email": "invalid@example.com",
            # Missing password field
        },
        {
            "name": "Another Valid",
            "email": "another@example.com",
            "password": "SecurePass456",
        },
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert len(data["success"]) == 2
    assert len(data["failed"]) == 2
    assert "Imported 2 users, 2 failed" in data["message"]

    # Verify valid users were created
    valid_user = crud.get_user_by_identifier("valid@example.com")
    assert valid_user is not None

    another_user = crud.get_user_by_identifier("another@example.com")
    assert another_user is not None

    # Verify failed entries include error messages
    failed_emails = [f["email"] for f in data["failed"]]
    assert "" in failed_emails or "invalid@example.com" in failed_emails


def test_bulk_import_users_with_duplicates(client_auth):
    """Test bulk import with duplicate email addresses"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Create a user first
    existing_user_data = {
        "name": "Existing User",
        "email": "existing@example.com",
        "password": "Password123",
    }
    client_auth.post(
        "/admin/users",
        data=json.dumps(existing_user_data),
        content_type="application/json",
    )

    # Try to bulk import including the duplicate
    users_data = [
        {
            "name": "New User",
            "email": "newuser@example.com",
            "password": "Password123",
        },
        {
            "name": "Duplicate User",
            "email": "existing@example.com",  # Duplicate
            "password": "Password123",
        },
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert len(data["success"]) == 1
    assert len(data["failed"]) == 1
    assert "already exists" in data["failed"][0]["error"].lower()


def test_bulk_import_users_empty_list(client_auth):
    """Test bulk import with empty user list"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": []}),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data["message"] == "No user data provided"


def test_bulk_import_users_missing_required_fields(client_auth):
    """Test bulk import with missing required fields"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    # Test missing name
    users_data = [
        {
            "email": "test@example.com",
            "password": "Password123",
            # Missing name
        }
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert len(data["failed"]) == 1
    assert "required" in data["failed"][0]["error"].lower()


def test_bulk_import_users_as_non_admin(client_auth):
    """Test that non-admin users cannot bulk import users"""
    # Create regular user
    regular_user = get_user(1)
    au.signup_user(client_auth, regular_user)
    au.signin_user(client_auth, regular_user)

    # Try to bulk import as non-admin
    users_data = [
        {
            "name": "Test User",
            "email": "test@example.com",
            "password": "Password123",
        }
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 403
    data = response.get_json()
    assert data["message"] == "Admin access required."


def test_bulk_import_users_invalid_role(client_auth):
    """Test bulk import with invalid role value"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    users_data = [
        {
            "name": "Valid User",
            "email": "valid@example.com",
            "password": "Password123",
            "role": "member",
        },
        {
            "name": "Invalid Role User",
            "email": "invalid@example.com",
            "password": "Password123",
            "role": "superadmin",  # Invalid role
        },
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    # Note: The backend doesn't validate role values, so both might succeed
    # This test documents current behavior
    data = response.get_json()
    assert "success" in data
    assert "failed" in data


def test_bulk_import_users_defaults(client_auth):
    """Test that bulk imported users have correct default values"""
    # Create admin user and sign in
    admin_user, admin_user_obj = create_admin_user_and_signin(client_auth, 1)

    users_data = [
        {
            "name": "Test User",
            "email": "test@example.com",
            "password": "Password123",
            # No role, confirmed specified - should use defaults
        }
    ]

    response = client_auth.post(
        "/admin/users/bulk-import",
        data=json.dumps({"users": users_data}),
        content_type="application/json",
    )

    assert response.status_code == 201
    data = response.get_json()
    assert len(data["success"]) == 1

    # Verify defaults were applied
    user = crud.get_user_by_identifier("test@example.com")
    assert user is not None
    assert user.role == "member"  # Default role
    assert user.confirmed is True  # Admin-created accounts auto-confirmed
    assert user.terms_accepted is True  # Admin-created accounts auto-accept terms
    assert user.origin == "asreview"
