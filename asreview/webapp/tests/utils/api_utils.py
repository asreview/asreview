import asreview.webapp.tests.utils.crud as crud
from asreview.webapp.tests.utils.config_parser import get_user


def process_response(response):
    return (response.status_code, response.json)

def signin_user(client, user):
    """Signs in a user through the api"""
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


def create_and_signin_user(client):
    # signup user
    user = get_user(1)
    response = signup_user(client, user)
    # refresh user
    stored_user = crud.get_user_by_identifier(user.identifier)
    # signin user
    signin_user(client, user)
    # return the user
    return stored_user

