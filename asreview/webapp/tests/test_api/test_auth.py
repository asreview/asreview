import datetime as dt
import json
from inspect import getfullargspec
import re

import pytest

from asreview.webapp import DB
from asreview.webapp.tests.conftest import _get_app
import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp.tests.utils.config_parser import get_user
import asreview.webapp.tests.utils.crud as crud


# ###################
# SIGNUP
# ###################


# test that creating a user when the app runs a no-creation
# policy, is impossible. This happens when explicitly
# ALLOW_ACCOUNT_CREATION is set to False or oAuth is configured.
@pytest.mark.parametrize("client_fixture", ["client_auth_no_creation", "client_oauth"])
def test_deny_signup_when_not_allowed(request, client_fixture):
    # get client
    client = request.getfixturevalue(client_fixture)
    # get user data
    user = get_user(1)
    # post form data
    r = au.signup_user(client, user)

    assert r.status_code == 404
    assert r.json["message"] == "The app is not configured to create accounts"


# test Exception when allow account creation and oAuth are explicitly
# configured
def test_raise_error_when_both_oauth_and_signup_is_allowed(asreview_path_fixture):
    with pytest.raises(ValueError):
        _get_app(
            app_type="oauth-with-allowed-account-creation", path=asreview_path_fixture
        )


# Successful signup returns a 200 but with an unconfirmed user and
# an email token
def test_successful_signup_confirmed(client_auth_verified):
    # get user data
    user = get_user(1)
    # post form data
    r = au.signup_user(client_auth_verified, user)
    # check if we get a 200 status
    assert r.status_code == 201
    assert f"An email has been sent to {user.email}" in r.json["message"]


# test basic signing up, no email verification, user is
# logged in after signup
def test_successful_signup_no_confirmation(client_auth):
    # get user data
    user = get_user(1)
    # post form data
    response = au.signup_user(client_auth, user)
    # check if user is confirmed
    user = crud.get_user_by_identifier(user.identifier)
    assert user.confirmed
    # check if we get a 201 status
    payload = json.loads(response.text)
    assert response.status_code == 201
    assert isinstance(payload, dict)
    assert payload["logged_in"]


# test basic signing up with email verification
def test_successful_signup_with_confirmation(client_auth_verified):
    # get user data
    user = get_user(1)
    # post form data
    response = au.signup_user(client_auth_verified, user)
    # check if we get a 201 status
    payload = json.loads(response.text)
    assert response.status_code == 201
    assert "An email has been sent" in payload["message"]
    user = crud.get_user_by_identifier(user.identifier)
    assert not user.confirmed
    assert bool(re.fullmatch(r"^\d+$", user.token))


# Test user data if we request is
@pytest.mark.parametrize(
    "password",
    [
        "short",
        "lowercapsonly",
        "HIGHCAPSONLY",
        "123456789",
        "short12334",
        "SHORT123234",
    ],
)
def test_unsuccessful_signup_invalid_password(client_auth, password):
    # get user data
    user = get_user(1)
    user.password = password
    r = au.signup_user(client_auth, user)
    # check if we get a 400 status
    assert r.status_code == 400
    expected_message = f'Password "{password}" does not meet requirements'
    assert expected_message in r.json["message"]


# Adding an existing identifier must return a 404 status and
# appropriate message
def test_unique_identifier(client_auth):
    # get user data
    user = get_user(1)
    # insert this user
    crud.create_user(DB, user)
    # try to create the same user again with the api
    r = au.signup_user(client_auth, user)
    assert r.status_code == 403
    assert r.json["message"] == f'User with email "{user.email}" already exists.'


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
    r = au.signup_user(client_auth, user2)
    assert r.status_code == 403
    assert r.json["message"] == f'User with email "{user2.email}" already exists.'


# ###################
# SIGNIN
# ###################


# Verified user creation: user can not signin with unconfirmed account
def test_unsuccessful_signin_with_unconfirmed_account(client_auth_verified):
    # get user data
    user = get_user(1)
    # create user with signup
    r = au.signup_user(client_auth_verified, user)
    # check if we get a 201 status
    assert r.status_code == 201
    # try to sign in
    r = au.signin_user(client_auth_verified, user)
    assert r.status_code == 404
    assert r.json["message"] == f"User account {user.email} is not confirmed."


# Successfully signing in a user must return a 200 response
@pytest.mark.parametrize("client_fixture", ["client_auth", "client_implicit_auth"])
def test_successful_signin(request, client_fixture):
    # get client
    client = request.getfixturevalue(client_fixture)
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    r = au.signup_user(client, user)
    # check if we get a 201 status
    assert r.status_code == 201
    # signin
    r = au.signin_user(client, user)
    assert r.status_code == 200
    assert r.json["message"] == f"User {user.identifier} is logged in."


# Wrong password must return a 404 response with and an appropriate response
def test_unsuccessful_signin_wrong_password(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    r = au.signup_user(client_auth, user)
    # check if we get a 201 status
    assert r.status_code == 201
    # change password
    user.password = "wrong_password"
    # signin
    r = au.signin_user(client_auth, user)
    assert r.status_code == 404
    assert r.json["message"] == f"Incorrect password for user {user.identifier}."


# Wrong email must return a 404 response and with an appropriate response
def test_unsuccessful_signin_wrong_email(client_auth):
    # get user data
    user = get_user(1)
    # create user with signup, no confirmation
    r = au.signup_user(client_auth, user)
    # check if we get a 201 status
    assert r.status_code == 201
    # change email and identifier
    user.email = "wrong_email@asreview.nl"
    user.identifier = "wrong_email@asreview.nl"
    # signin
    r = au.signin_user(client_auth, user)
    assert r.status_code == 404
    assert r.json["message"] == f"User account {user.identifier} does not exist."


# ###################
# SIGNOUT
# ###################


# Signing out must return a 200 status and an appropriate message
@pytest.mark.parametrize("client_fixture", ["client_auth", "client_implicit_auth"])
def test_signout(request, client_fixture):
    # get client
    client = request.getfixturevalue(client_fixture)
    # create user
    user = au.create_and_signin_user(client)
    # signout
    r = au.signout_user(client)
    # expect a 200
    assert r.status_code == 200
    assert (
        r.json["message"]
        == f"User with identifier {user.identifier} has been signed out."
    )


# ###################
# CONFIRMATION
# ###################


# A new token is created on signup, that token can be confirmed
# by the confirm route
def test_token_confirmation_after_signup(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # refresh user
    user = crud.get_user_by_identifier(user.identifier)
    # now we confirm this user
    r = au.confirm_user(client_auth_verified, user)
    payload = json.loads(r.text)
    assert r.status_code == 200
    assert isinstance(payload, dict)
    assert payload["logged_in"]


# A token expires in 24 hours, test confirmation response after
# 24 hours
def test_expired_token(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # refresh user
    user = crud.get_user_by_identifier(user.identifier)
    # manipulate token_created_at
    new_created_at = user.token_created_at - dt.timedelta(hours=28)
    user.token_created_at = new_created_at
    DB.session.commit()
    # now we try to confirm this user
    r = au.confirm_user(client_auth_verified, user)
    assert r.status_code == 403
    assert "token has expired" in r.text


# Confirmation user: if the user can't be found, this route should
# return a 404
def test_if_this_route_returns_404_user_not_found(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # make sure the user account is created
    assert crud.count_users() == 1
    # we keep the user model as is, not retrieving it from the DB
    # which ensures an id-less object that can be manipulated
    user.id = 100
    # now we try to confirm this user
    r = au.confirm_user(client_auth_verified, user)
    payload = json.loads(r.text)
    assert r.status_code == 404
    assert payload["message"] == "No user account / correct token found."


# If the token cant be found, this route should return a 404
def test_if_this_route_returns_404_token_not_found(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # make sure the user account is created
    assert crud.count_users() == 1
    # we keep the user model as is, not retrieving it from the DB
    # which ensures an id-less object that can be manipulated
    user.token = "wrong_token"
    # now we try to confirm this user
    r = au.confirm_user(client_auth_verified, user)
    payload = json.loads(r.text)
    assert r.status_code == 404
    assert payload["message"] == "No user account / correct token found."


# If we are not doing verification this route should return a 400
def test_confirm_route_returns_400_if_app_not_verified(client_auth):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth, user)
    # refresh user object
    user = crud.get_user_by_identifier(user.identifier)
    # now we try to confirm this user
    r = au.confirm_user(client_auth, user)
    assert r.status_code == 400
    assert r.text == "Email verification is not enabled"


# ###################
# GET PROFILE
# ###################


# Test user data if we request is
@pytest.mark.parametrize(
    "attribute", ["email", "identifier", "name", "origin", "affiliation"]
)
@pytest.mark.parametrize("client_fixture", ["client_auth", "client_implicit_auth"])
def test_get_profile(request, client_fixture, attribute):
    # get client
    client = request.getfixturevalue(client_fixture)
    # get user
    user = au.create_and_signin_user(client)
    # get profile
    r = au.get_profile(client)
    assert r.status_code == 200
    # assert if none is blank
    assert r.json["message"][attribute] != ""
    # compare with user
    assert r.json["message"][attribute] == getattr(user, attribute)


# Test profile data not returned when user id does not exists
def test_get_profile_if_user_id_does_not_exist(client_auth):
    au.create_and_signin_user(client_auth)
    # remove this user from the database
    crud.delete_users(DB)
    # get profile
    r = au.get_profile(client_auth)
    assert r.status_code == 404
    assert r.json["message"] == "No user found."


# #####################
# FORGOT/RESET PASSWORD
# #####################


# Test forgot_password can't be called if we don't run an
# email config
def test_forgot_password_no_email_config(client_auth):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth, user)
    # forgot password
    r = au.forgot_password(client_auth, user)
    assert r.status_code == 404
    assert r.json["message"] == "Forgot-password feature is not used in this app."


# Test forgot_password works under normal circumstances
def test_forgot_password_works(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # forgot password
    r = au.forgot_password(client_auth_verified, user)
    assert r.status_code == 200
    assert r.json["message"] == f"An email has been sent to {user.email}"


# Test forgot_password: user not found
def test_forgot_password_no_user(client_auth_verified):
    # get user, no signup
    user = get_user(1)
    # forgot password
    r = au.forgot_password(client_auth_verified, user)
    assert r.status_code == 404
    assert r.json["message"] == f'User with email "{user.email}" not found.'


# Test forgot_password: origin is not "asreview"
def test_forgot_password_wrong_origin(client_auth_verified):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth_verified, user)
    # get fresh user object and change origin
    user = crud.update_user(DB, user, "origin", "github")
    # forgot password
    r = au.forgot_password(client_auth_verified, user)
    assert r.status_code == 404
    assert r.json["message"] == f"Your account has been created with {user.origin}."


# Test resetting password when not configured
def test_reset_password_no_email_config(client_auth):
    # signup user
    user = get_user(1)
    r = au.signup_user(client_auth, user)
    # get user
    user = crud.get_user_by_identifier(user.identifier)
    user.password = "NewPassword123!"
    # forgot password
    r = au.reset_password(client_auth, user)
    assert r.status_code == 404
    assert r.json["message"] == "Reset-password feature is not used in this app."


# Test resetting password
def test_reset_password(client_auth_verified):
    # signup user
    user = get_user(1)
    au.signup_user(client_auth_verified, user)
    # forgot password
    au.forgot_password(client_auth_verified, user)
    # get user and provide new password
    user = crud.get_user_by_identifier(user.identifier)
    user.password = "NewPassword123!"
    # reset it
    r = au.reset_password(client_auth_verified, user)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["logged_in"]


# Test reset password: id not found
def test_reset_password_with_wrong_user_id(client_auth_verified):
    # signup user
    user = get_user(1)
    au.signup_user(client_auth_verified, user)
    # forgot password
    au.forgot_password(client_auth_verified, user)
    # get user and provide new password
    user = crud.get_user_by_identifier(user.identifier)
    user.password = "NewPassword123!"
    # and remove from database to manipulate user-not-found
    crud.delete_users(DB)
    # reset it
    r = au.reset_password(client_auth_verified, user)
    assert r.status_code == 404
    assert (
        r.json["message"]
        == "User not found, try restarting the forgot-password procedure."
    )


# Test reset password: token is stale
def test_reset_password_with_stale_token(client_auth_verified):
    # signup user
    user = get_user(1)
    au.signup_user(client_auth_verified, user)
    # forgot password
    au.forgot_password(client_auth_verified, user)
    # get user and provide new password
    user = crud.get_user_by_identifier(user.identifier)
    user.password = "NewPassword123!"
    new_created_at = user.token_created_at - dt.timedelta(hours=28)
    user.token_created_at = new_created_at
    DB.session.commit()
    # reset password
    r = au.reset_password(client_auth_verified, user)
    assert r.status_code == 404
    assert (
        r.json["message"]
        == "Token is invalid or too old, restart the forgot-password procedure."
    )

    # Test reset password: invalid password
    # signup user
    user = get_user(1)
    au.signup_user(client_auth_verified, user)
    # forgot password
    au.forgot_password(client_auth_verified, user)
    # get user and provide new password
    user = crud.get_user_by_identifier(user.identifier)
    user.password = "123"
    # reset password
    r = au.reset_password(client_auth_verified, user)
    assert r.status_code == 500
    assert "Unable to reset your password!" in r.json["message"]
    assert "does not meet requirements" in r.json["message"]


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
        "public": int(not user.public),
    }
    # call update
    r = au.update_user(client_auth, data)
    assert r.status_code == 200
    assert r.json["message"] == "User profile updated."


# test correctly updating the password
def test_correctly_update_password(client_auth):
    # create and signin user
    user_id = 1
    user = au.get_user(user_id)
    db_user = au.create_and_signin_user(client_auth, user_id)
    # prep data
    new_password = "NewPassword123#"
    data = {
        "email": user.email,
        "name": user.name,
        "affiliation": user.affiliation,
        "public": int(user.public),
        "old_password": user.password,
        "new_password": new_password,
    }
    # call update
    r = au.update_user(client_auth, data)
    assert r.status_code == 200
    assert r.json["message"] == "User profile updated."
    # Checking if new password works: signout first
    au.signout_user(client_auth)
    # signin with new password
    db_user.password = new_password
    r = au.signin_user(client_auth, db_user)
    assert r.status_code == 200


# test updating the password with faulty old password
def test_incorrectly_update_password_wrong_old_password(client_auth):
    # create and signin user
    user_id = 1
    user = au.get_user(user_id)
    au.create_and_signin_user(client_auth, user_id)
    # prep data
    new_password = "NewPassword123#"
    data = {
        "email": user.email,
        "name": user.name,
        "affiliation": user.affiliation,
        "public": int(user.public),
        "old_password": user.password + "WRONG",  # wrong old password
        "new_password": new_password,
    }
    # call update
    r = au.update_user(client_auth, data)
    assert r.status_code == 400
    assert "Provided old password is incorrect." in r.json["message"]


# test updating the password with faulty new password
def test_incorrectly_update_password_wrong_new_password(client_auth):
    # create and signin user
    user_id = 1
    user = au.get_user(user_id)
    au.create_and_signin_user(client_auth, user_id)
    # prep data
    new_password = "abc"  # wrong new password
    data = {
        "email": user.email,
        "name": user.name,
        "affiliation": user.affiliation,
        "public": int(user.public),
        "old_password": user.password,
        "new_password": new_password,
    }
    # call update
    r = au.update_user(client_auth, data)
    assert r.status_code == 400
    expected_message = f'Password "{new_password}" does not meet requirements'
    assert expected_message in r.json["message"]


# test updating wrong new attribute values
@pytest.mark.parametrize(
    "attribute_data",
    [
        ("email", "email"),
        ("email", "user2@asreview.nl"),
        ("name", ""),
    ],
)
def test_update_user_with_wrong_values(client_auth, attribute_data):
    # make sure I have another user to test email duplication
    user = crud.create_user(DB, 2)
    # get attribute and value from parametrize
    attr, wrong_value = attribute_data
    # create user and signin user
    user = au.create_and_signin_user(client_auth)
    user_data = {
        "email": user.email,
        "name": user.name,
        "affiliation": user.affiliation,
        "public": int(user.public),
    }
    # manipulate attribute
    user_data[attr] = wrong_value
    # update
    r = au.update_user(client_auth, user_data)
    assert r.status_code in [400, 500]
    assert "Unable to update your profile" in r.json["message"]
    assert (attr.capitalize() in r.json["message"]) or attr in r.json["message"]


# ###################
# REFRESH
# ###################


# Test refresh: user signed in
def test_refresh_with_signed_in_user(client_auth):
    # create and signin user
    user = au.create_and_signin_user(client_auth)
    # refresh
    r = au.user(client_auth)
    assert r.status_code == 200
    assert r.json["id"] == user.id
    assert r.json["name"] == user.name


# Test refresh: user NOT signed in
def test_refresh_with_signed_out_user(client_auth):
    # create and signin user
    au.create_and_signin_user(client_auth)
    # signout
    au.signout_user(client_auth)
    # refresh
    r = au.user(client_auth)
    assert r.status_code == 401


# ###################
# TEST LOGIN REQUIRED
# ###################


# User must be logged in, in order to signout,
# we expect an error if we sign out if not signed in
@pytest.mark.parametrize("api_call", [au.signout_user, au.get_profile, au.update_user])
def test_must_be_signed_in_to_signout(client_auth, api_call):
    if len(getfullargspec(api_call).args) == 1:
        r = api_call(client_auth)
    else:
        r = api_call(client_auth, {})
    # asserts
    assert r.status_code == 401
