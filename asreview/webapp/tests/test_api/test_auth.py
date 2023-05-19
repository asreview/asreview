import datetime as dt

import pytest

import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp import DB
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
    response = au.signup_user(client_auth_no_creation, user)
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
    response = au.signup_user(client_auth_verified, user)
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
    response = au.signup_user(client_auth, user)
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
    response = au.signup_user(client_auth, user)
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
    response = au.signup_user(client_auth, user2)
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
    response = au.signup_user(client_auth_verified, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # try to sign in
    response = au.signin_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"User account {user.email} is not confirmed."


# Successfully signing in a user must return a 200 response
def test_successful_signin(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = au.signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # signin
    response = au.signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 200
    assert data["message"] == f"User {user.identifier} is logged in."


# Wrong password must return a 404 response with and an appropriate response
def test_unsuccessful_signin_wrong_password(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = au.signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # change password
    user.password = "wrong_password"
    # signin
    response = au.signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"Incorrect password for user {user.identifier}."


# Wrong email must return a 404 response and with an appropriate response
def test_unsuccessful_signin_wrong_email(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    response = au.signup_user(client_auth, user)
    # check if we get a 201 status
    assert response.status_code == 201
    # change email and identifier
    user.email = "wrong_email@asreview.nl"
    user.identifier = "wrong_email@asreview.nl"
    # signin
    response = au.signin_user(client_auth, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"User account {user.identifier} does not exist."


# ###################
# SIGNOUT
# ###################

# User must be logged in, in order to signout,
# we expect an error if we sign out if not signed in
def test_must_be_signed_in_to_signout(client_auth):
    response = au.signout_user(client_auth)
    # asserts
    data = response.json
    assert response.status_code == 401
    assert data["message"] == "Login required."


# Signing out must return a 200 status and an appropriate message
def test_signout(client_auth):
    # create user
    user = au.create_and_signin_user(client_auth)
    # signout
    response = au.signout_user(client_auth)
    # expect a 200
    data = response.json
    assert response.status_code == 200
    assert data["message"] == \
        f"User with identifier {user.identifier} has been signed out."


# ###################
# CONFIRMATION
# ###################

# A new token is created on signup, that token is can be confirmed
# by the confirm route
def test_token_confirmation_after_signup(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # refresh user
    user = crud.get_user_by_identifier(user.identifier)
    # now we confirm this user
    response = au.confirm_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 200
    assert data["message"] == f"User {user.identifier} confirmed."


# A token expires in 24 hours, test confirmation response after 
# 24 hours
def test_expired_token(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # refresh user
    user = crud.get_user_by_identifier(user.identifier)
    # manipulate token_created_at
    new_created_at = user.token_created_at - dt.timedelta(hours=28)
    user.token_created_at = new_created_at
    DB.session.commit()
    # now we try to confirm this user
    response = au.confirm_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 403
    assert "token has expired" in data["message"]


# Confirmation user: if the user can't be found, this route should 
# return a 404
def test_if_this_route_returns_404_user_not_found(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # make sure the user account is created
    assert crud.count_users() == 1
    # we keep the user model as is, not retrieving it from the DB
    # which ensures an id-less object that can be manipulated
    user.id = 100
    # now we try to confirm this user
    response = au.confirm_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == "No user account / correct token found."


# If the token cant be found, this route should return a 404
def test_if_this_route_returns_404_token_not_found(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # make sure the user account is created
    assert crud.count_users() == 1
    # we keep the user model as is, not retrieving it from the DB
    # which ensures an id-less object that can be manipulated
    user.token = "wrong_token"
    # now we try to confirm this user
    response = au.confirm_user(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == "No user account / correct token found."


# If we are not doing verification this route should return a 400
def test_confirm_route_returns_400_if_app_not_verified(client_auth):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth, user)
    # refresh user object
    user = crud.get_user_by_identifier(user.identifier)
    # now we try to confirm this user
    response = au.confirm_user(client_auth, user)
    data = response.json
    assert response.status_code == 400
    assert data["message"] == "The app is not configured to verify accounts."


# ###################
# PROFILE
# ###################

# Test user data if we request is
@pytest.mark.parametrize(
    "attribute",
    ["email", "identifier", "name", "origin", "affiliation"]
)
def test_get_profile(client_auth, attribute):
    user = au.create_and_signin_user(client_auth)
    # get profile
    response = au.get_profile(client_auth)
    data = response.json
    assert response.status_code == 200
    # assert if none is blank
    assert data["message"][attribute] != ""
    # compare with user
    assert data["message"][attribute] == getattr(user, attribute)


# Test profile data not returned when user id does not exists
def test_get_profile_if_user_id_does_not_exist(client_auth):
    user = au.create_and_signin_user(client_auth)
    # remove this user from the database
    crud.delete_users(DB)
    # get profile
    response = au.get_profile(client_auth)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == "No user found."


# ###################
# FORGOT PASSWORD
# ###################

# Test forgot_password can't be called if we don't run an
# email config
def test_forgot_password_not_used(client_auth):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth, user)
    # forgot password
    response = au.forgot_password(client_auth, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == "Forgot-password feature is not used in this app."


# Test forgot_password works under normal circumstances
def test_forgot_password_works(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # forgot password
    response = au.forgot_password(client_auth_verified, user)
    data = response.json
    assert response.status_code == 200
    assert data["message"] == f"An email has been sent to {user.email}"


# Test forgot_password: user not found
def test_forgot_password_no_user(client_auth_verified):
    # get user, no signup
    user = get_user(1)
    # forgot password
    response = au.forgot_password(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f'User with email "{user.email}" not found.'


# Test forgot_password: origin is not "asreview"
def test_forgot_password_wrong_origin(client_auth_verified):
    # signup user
    user = get_user(1)
    response = au.signup_user(client_auth_verified, user)
    # get fresh user object and change origin
    user = crud.update_user(DB, user, "origin", "github")
    # forgot password
    response = au.forgot_password(client_auth_verified, user)
    data = response.json
    assert response.status_code == 404
    assert data["message"] == f"Your account has been created with {user.origin}."


        # email = request.form.get("email", "").strip()
        # name = request.form.get("name", "").strip()
        # affiliation = request.form.get("affiliation", "").strip()
        # password = request.form.get("password", None)
        # public = bool(int(request.form.get("public", "1")))


# ###################
# UPDATE USER PROFILE
# ###################


# test updating normal attributes from user profile
def test_update_user_profile_simple_attributes(client_auth):
    # create and signin user
    user = au.create_and_signin_user(client_auth)
    # prep data
    data = {
        "email": "new_email@asreview.nl",
        "name": "new_name",
        "affiliation": "new_affiliation",
        "public": 0 if user.public == 1 else 0
    }
    # call update
    response = au.update_user(client_auth, data)
    data = response.json
    assert response.status_code == 200
    assert data["message"] == "User profile updated."


# test updating the password
def test_update_password(client_auth):
    pass


# test updating wrong new attribute values
# paramterize!!!!!
def test_update_user_with_wrong_values(client_auth):
    pass


# ###################
# TEST LOGIN REQUIRED
# ###################



