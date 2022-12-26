# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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
import os
from pathlib import Path

import pytest

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app
from asreview.webapp.tests.conftest import signin_user, signup_user

try:
    from.temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}

@pytest.fixture(
    scope='function',
    name='setup_teardown_standard',
    autouse=True
)
def setup_teardown_standard(request):
    """Standard setup and teardown, create the app and
    make sure the database is cleaned up after running
    each and every test"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)

    # find config file
    root_dir = str(Path(os.path.abspath(__file__)).parent)
    if hasattr(request, 'param') and \
        request.param == 'user_creation_not_allowed':
        # no user creation allowed
        config_file_path = f'{root_dir}/configs/auth_config_no_accounts.json'
    elif hasattr(request, 'param') and \
        request.param == 'verified_user_creation':
        # user creation WITH email verification
        config_file_path = f'{root_dir}/configs/auth_config_verification.json'
    else:
        # user creation WITHOUT email verification
        config_file_path = f'{root_dir}/configs/auth_config.json'

    # create app and client
    app = create_app(
        enable_auth=True,
        flask_config=config_file_path
    )
    client = app.test_client()
    # clean database
    with app.app_context():
        yield client
        DB.session.query(User).delete()
        DB.session.commit()

def create_user(identifier, email=None, confirmed=True, password=None):
    return User(
        identifier,
        email=(email if email != None else identifier),
        name='Whatever',
        confirmed=confirmed,
        password=(password if password != None else '127635uyguytAYUTUYT')
    )

def get_user(identifier):
    """Gets a user by email, only works in app context"""
    return DB.session.query(User). \
        filter(User.identifier == identifier). \
        one_or_none()


# ###################
# USER CREATION
# ###################

# force different config file that doesn't allow user
# creation
@pytest.mark.parametrize(
    'setup_teardown_standard',
    ['user_creation_not_allowed'],
    indirect=True
)
def test_impossible_to_signup_when_not_allowed(setup_teardown_standard):
    """UNSuccessful signup when account creation is not allowed"""
    client = setup_teardown_standard
    assert len(User.query.all()) == 0
    # post form data
    response = signup_user(client, 'test1@uu.nl', 'wdas32d!')
    # check if we get a 400 status
    assert response.status_code == 400
    assert len(User.query.all()) == 0


@pytest.mark.parametrize(
    'setup_teardown_standard',
    ['verified_user_creation'],
    indirect=True
)
def test_successful_signup_confirmed(setup_teardown_standard):
    """Successful signup returns a 201 but with an unconfirmed
    user and a email token"""
    client = setup_teardown_standard
    assert len(User.query.all()) == 0
    # post form data
    response = signup_user(client, 'test1@uu.nl', 'wdas32d!')
    # check if we get a 201 status
    assert response.status_code == 201
    # get user
    user = User.query.first()
    assert user.confirmed == False
    assert bool(user.token) == True
    assert bool(user.token_created_at) == True 


def test_successful_signup_no_confirmation(setup_teardown_standard):
    """Successful signup returns a 201"""
    client = setup_teardown_standard
    assert len(User.query.all()) == 0
    # post form data
    response = signup_user(client, 'test1@uu.nl', 'wdas32d!')
    # check if we get a 201 status
    assert response.status_code == 201
    # get user
    user = User.query.first()
    assert user.confirmed == True
    assert bool(user.token) == False
    assert bool(user.token_created_at) == False


def test_unique_identifier_api(setup_teardown_standard):
    """Adding an existing identifier must return a 404 status and
    appropriate message"""
    client = setup_teardown_standard
    identifier = 'test4@uu.nl'
    DB.session.add(create_user(identifier))
    DB.session.commit()
    # try to create the same user again with the api
    response = signup_user(client, identifier, '3434rwq')
    assert response.status_code == 403
    assert f'"{identifier}" already exists' in \
        json.loads(response.data)['message']


def test_unique_email_api(setup_teardown_standard):
    """Adding an existing email must return a 404 status and
    appropriate message"""
    client = setup_teardown_standard
    email = 'test4@uu.nl'
    DB.session.add(
        create_user(email+'001', email)
    )
    DB.session.commit()
    # try to create the same user again with the api
    response = signup_user(client, email, '3434rwq')
    assert response.status_code == 403
    assert f'"{email}" already exists' in \
        json.loads(response.data)['message']


def test_unique_emails_db(setup_teardown_standard):
    """Trying to add an existing user must not create a user record"""
    client = setup_teardown_standard
    # create user
    identifier = 'test5@uu.nl'
    DB.session.add(create_user(identifier))
    DB.session.commit()
    # count initial amount of records
    count = DB.session.query(User).count()
    # try to create the same user again with the api
    signup_user(client, identifier, '123456!AbC')
    # recount
    new_count = DB.session.query(User).count()
    assert new_count == count


# ###################
# SIGNIN
# ###################

@pytest.mark.parametrize(
    'setup_teardown_standard',
    ['verified_user_creation'],
    indirect=True
)
def test_unsuccessful_signin_with_unconfirmed_account(
    setup_teardown_standard):
    """User can not sign in with uncomfirmed account"""
    client = setup_teardown_standard
    assert len(User.query.all()) == 0
    # post form data
    email, password = 'test1@uu.nl', 'wdas32d!'
    response = signup_user(client, email, password)
    # check if we get a 201 status
    assert response.status_code == 201
    # get user
    user = User.query.first()
    assert user.confirmed == False
    # try to sign in
    response = signin_user(client, email, password)
    assert response.status_code == 404
    assert f'User account {email} is not confirmed' in response.text


def test_successful_signin_api(setup_teardown_standard):
    """Successfully signing in a user must return a 200 response"""
    client = setup_teardown_standard
    # create user
    email = 'test6@uu.nl'
    password = '123456Ab@'
    DB.session.add(create_user(email, password=password))
    DB.session.commit()
    response = signin_user(client, email, password)
    assert response.status_code == 200


def test_unsuccessful_signin_wrong_password_api(setup_teardown_standard):
    """Wrong password must return a 404 response
    and an appropriate response"""
    client = setup_teardown_standard
    # create user
    email = 'test7@uu.nl'
    password = '123456Ab@'
    DB.session.add(create_user(email, password=password))
    DB.session.commit()
    response = signin_user(client, email, 'wrong_password')
    assert response.status_code == 404
    assert 'Incorrect password' in \
        json.loads(response.data)['message']


def test_unsuccessful_signin_wrong_email_api(setup_teardown_standard):
    """Wrong email must return a 404 response
    and an appropriate response"""
    client = setup_teardown_standard
    # create user
    email = 'test8@uu.nl'
    password = '123456Ab@'
    DB.session.add(create_user(email, password=password))
    DB.session.commit()
    response = signin_user(client, 'TedjevanEs', password)
    assert response.status_code == 404
    assert 'does not exist' in \
        json.loads(response.data)['message']





# ###################
# SIGNOUT
# ###################

def test_must_be_signed_in_to_signout(setup_teardown_standard):
    """User must be logged in, in order to signout,
    we expect an error if we sign out if not signed in"""
    client = setup_teardown_standard
    # make sure any signed-in user is signed out
    client.delete('/auth/signout')
    # and do it again
    response = client.delete('/auth/signout')
    assert response.status_code == 401

def test_signout(setup_teardown_standard):
    """Signing out must return a 200 status and an
    appropriate message"""
    client = setup_teardown_standard
    # create user
    email = 'test9@uu.nl'
    password = '123456Ab@'
    DB.session.add(create_user(email, password=password))
    DB.session.commit()
    # signin
    signin_user(client, email, password)
    # make sure any signed-in user is signed out
    response = client.delete('/auth/signout')
    # expect a 200
    assert response.status_code == 200
    assert 'signed out' in \
        json.loads(response.data)['message']


# ###################
# CONFIRMATION
# ###################

@pytest.mark.parametrize(
    'setup_teardown_standard',
    ['verified_user_creation'],
    indirect=True
)
def test_token_creation_if_forgot_password(setup_teardown_standard):
    """A new token is created when forgot password is requested"""
    client = setup_teardown_standard
    assert len(User.query.all()) == 0
    # post form data
    response = signup_user(client, 'test1@uu.nl', 'wdas32d!')
    # check if we get a 201 status
    assert response.status_code == 201
    # get user
    user = User.query.first()
    assert user.confirmed == False
    assert bool(user.token) == True
    assert bool(user.token_created_at) == True 
    # now we confirm this user
    response = client.get(
        f'/auth/confirm?user_id={user.id}&token={user.token}',
    )
    assert response.status_code == 200
    # get user again
    user = User.query.first()
    assert user.confirmed == True
    assert bool(user.token) == False
    assert bool(user.token_created_at) == False

def test_expired_token(setup_teardown_standard):
    pass

def test_if_this_route_returns_404_when_not_verified(setup_teardown_standard):
    """If we are not doing verification this route should return a 404"""
    pass


# ###################
# FORGOT PASSWORD
# ###################

# @pytest.mark.parametrize(
#     'setup_teardown_standard',
#     ['verified_user_creation'],
#     indirect=True
# )
# def test_token_creation_if_forgot_password(setup_teardown_standard):
#     """A new token is created when forgot password is requested"""
#     client = setup_teardown_standard
#     assert len(User.query.all()) == 0
#     # post form data
#     response = signup_user(client, 'test1@uu.nl', 'wdas32d!')
#     # check if we get a 201 status
#     assert response.status_code == 201
#     # get user
#     user = User.query.first()
#     assert user.confirmed == False
#     assert bool(user.token) == True
#     assert bool(user.token_created_at) == True 
