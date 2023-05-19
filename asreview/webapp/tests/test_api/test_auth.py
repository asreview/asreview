import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp.tests.utils.api_utils import signin_user
from asreview.webapp.tests.utils.api_utils import signout_user
from asreview.webapp.tests.utils.api_utils import signup_user
from asreview.webapp.tests.utils.config_parser import get_user

# ###################
# SIGNUP
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
    assert data["message"] == "The app is not configured to create accounts"


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
    assert data["message"] == \
        f"An email has been sent to {user.email} " + \
        "to verify your account. Please follow instructions."


# test basic signing up
def test_successful_signup_no_confirmation(client_auth):
    # get user data
    user = get_user(1)
    # post form data
    response = signup_user(client_auth, user)
    # check if we get a 201 status
    data = response.json
    assert response.status_code == 201
    assert data["message"] == f'User "{user.email}" created.'


# Adding an existing identifier must return a 404 status and
# appropriate message
def test_unique_identifier(client_auth):
    # get user data
    user = get_user(1)
    # insert this user
    crud.create_user(DB, user)
    # try to create the same user again with the api
    response = signup_user(client_auth, user)
    data = response.json
    assert response.status_code == 403
    assert data["message"] == f'User with email "{user.email}" already exists.'


# Adding an existing email must return a 404 status and
# appropriate message
def test_unique_email(client_auth):
    # get user data
    user1 = get_user(1)
    user2 = get_user(2)
    # insert user1
    crud.create_user(DB, user1)
    # try to create the user2 with the same email as user1 with the api
    user2.email = user1.email
    response = signup_user(client_auth, user2)
    data = response.json
    assert response.status_code == 403
    assert data["message"] == f'User with email "{user2.email}" already exists.'


# ###################
# SIGNIN
# ###################


# Verified user creation: user can not signin with unconfirmed account
def test_unsuccessful_signin_with_unconfirmed_account(client_auth_verified):
    # get user data
    user = get_user(1)
    # create user with signup
    response = signup_user(client_auth_verified, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # try to sign in
    response = signin_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"User account {user.email} is not confirmed."


# Successfully signing in a user must return a 200 response
def test_successful_signin(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # signin
    response = signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 200
    assert data["message"] == f"User {user.identifier} is logged in."


# Wrong password must return a 404 response with and an appropriate response
def test_unsuccessful_signin_wrong_password(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # change password
    user.password = "wrong_password"
    # signin
    response = signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"Incorrect password for user {user.identifier}."


# Wrong email must return a 404 response and with an appropriate response
def test_unsuccessful_signin_wrong_email(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # change email and identifier
    user.email = "wrong_email@asreview.nl"
    user.identifier = "wrong_email@asreview.nl"
    # signin
    response = signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"User account {user.identifier} does not exist."


# ###################
# SIGNOUT
# ###################

# User must be logged in, in order to signout,
# we expect an error if we sign out if not signed in
def test_must_be_signed_in_to_signout(client_auth):
    response = signout_user(client_auth)
    # asserts
    data = response.json
    assert response.status_code == 401
    assert data["message"] == "Login required."


# Signing out must return a 200 status and an appropriate message
def test_signout(client_auth):
    # create user
    user = get_user(1)
    # create user with signup
    response = signup_user(client_auth, user)
    # signin
    signin_user(client_auth, user)
    # signout
    response = signout_user(client_auth)
    # expect a 200
    data = response.json
    assert response.status_code == 200
    assert data["message"] == \
        f"User with identifier {user.identifier} has been signed out."
