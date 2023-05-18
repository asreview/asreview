import pytest

from asreview.webapp import DB
import asreview.webapp.tests.utils.crud as crud
from asreview.webapp.authentication.models import User
from asreview.webapp.tests.utils.api_utils import signup_user
from asreview.webapp.tests.utils.config_parser import get_user


# ###################
# USER CREATION
# ###################

# test that creating a user when the app runs a no-creation
# policy, is impossible
def test_impossible_to_signup_when_not_allowed(client_auth_no_creation):
    # get user data
    user = get_user(1)
    # post form data
    response = signup_user(client_auth_no_creation, user)
    # check if we get a 400 status
    data = response.json
    assert response.status_code == 400
    assert data.get("message") == "The app is not configured to create accounts"


# Successful signup returns a 200 but with an unconfirmed user and 
# an email token
def test_successful_signup_confirmed(client_auth_verified):
    # get user data
    user = get_user(1)
    # post form data
    response = signup_user(client_auth_verified, user)
    # check if we get a 200 status
    data = response.json
    assert response.status_code == 201
    assert data.get("message") == f"An email has been sent to {user.email} to verify your account. Please follow instructions."


# test basic signing up
def test_successful_signup_no_confirmation(client_auth):
    # get user data
    user = get_user(1)
    # post form data
    response = signup_user(client_auth, user)
    # check if we get a 201 status
    data = response.json
    assert response.status_code == 201
    assert data.get("message") == f"User \"{user.email}\" created."

