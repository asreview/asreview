import asreview.webapp.tests.utils.crud as crud
from asreview.webapp.tests.utils.config_parser import all_users
from asreview.webapp.tests.utils.config_parser import get_user


def process_response(response):
    return (response.status_code, response.json)


def signin_user(client, user):
    """Signs in a user through the api"""
    # If a password is not set, we need to get it
    if not hasattr(user, 'password'):
        users = all_users()
        user.password = users[user.identifier].password
    # request
    response = client.post(
        "/auth/signin",
        data={
            "email": user.identifier,
            "password": user.password
        }
    )
    return process_response(response)


def signup_user(client, user):
    """Signs up a user through the api"""
    response = client.post(
        "/auth/signup",
        data={
            "identifier": user.email,
            "email": user.email,
            "name": user.name,
            "password": user.password,
            "affiliation": user.affiliation,
            "origin": "asreview",
        },
    )
    return process_response(response)


def signout_user(client):
    """Sign out user"""
    response = client.delete("/auth/signout")
    return process_response(response)


def confirm_user(client, user):
    response = client.post(
        "/auth/confirm_account",
        data = {
            "user_id": user.id,
            "token": user.token
        }
    )
    return process_response(response)


def forgot_password(client, user):
    response = client.post(
        "/auth/forgot_password",
        data = {
            "email": user.email
        }
    )
    return process_response(response)


def reset_password(client, user):
    response = client.post(
        "/auth/reset_password",
        data = {
            "password": user.password,
            "token": user.token,
            "user_id": user.id
        }
    )
    return process_response(response)


def update_user(client, data):
    response = client.post(
        "/auth/update_profile",
        data = data
    )
    return process_response(response)


def refresh(client):
    response = client.get("/auth/refresh")
    return process_response(response)


def get_profile(client):
    response = client.get("/auth/get_profile")
    return process_response(response)


def create_project(
    client,
    project_name,
    mode="explore",
    authors="authors",
    description="description"):
        
    response = client.post(
        "/api/projects/info",
        data={
            "mode": mode,
            "name": project_name,
            "authors": authors,
            "description": description,
        },
    )
    return process_response(response)
    

def invite(client, project, user):
    url = f"/api/invitations/projects/{project.project_id}/users/{user.id}"
    response = client.post(url)
    return process_response(response)


def list_invitations(client):
    response = client.get("/api/invitations")
    return process_response(response)


def list_collaborators(client, project):
    response = client.get(f"/api/projects/{project.project_id}/users")
    return process_response(response)


def accept_invitation(client, project):
    response = client.post(
        f"/api/invitations/projects/{project.project_id}/accept",
        data={}
    )
    return process_response(response)


def reject_invitation(client, project):
    response = client.delete(
        f"/api/invitations/projects/{project.project_id}/reject",
        data={}
    )
    return process_response(response)


def delete_invitation(client, project, user):
    response = client.delete(
        f"/api/invitations/projects/{project.project_id}/users/{user.id}",
        data={}
    )
    return process_response(response)


def delete_collaboration(client, project, user):
    response = client.delete(
        f"/api/projects/{project.project_id}/users/{user.id}",
        data={}
    )
    return process_response(response)


def get_all_projects(client):
    response = client.get("/api/projects")
    return process_response(response)


def create_project(
    client,
    project_name,
    mode="explore",
    authors="authors",
    description="description"):
        
    response = client.post(
        "/api/projects/info",
        data={
            "mode": mode,
            "name": project_name,
            "authors": authors,
            "description": description,
        },
    )
    return process_response(response)


def upgrade_project(client, project):
    response = client.get(f"/api/projects/{project.project_id}/upgrade_if_old")
    return process_response(response)


def create_and_signin_user(client, test_user_id=1):
    # signup user
    user = get_user(test_user_id)
    response = signup_user(client, user)
    # refresh user
    stored_user = crud.get_user_by_identifier(user.identifier)
    # signin user
    signin_user(client, user)
    # return the user
    return stored_user
