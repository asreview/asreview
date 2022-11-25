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

@pytest.fixture(scope='function', autouse=True)
def setup_teardown_standard():
    """Standard setup and teardown, create the app and
    make sure the database is cleaned up after running
    each and every test"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # create app and client
    app = create_app(enable_auth=True)
    # clean database
    with app.app_context():
        yield app
        DB.session.query(User).delete()
        DB.session.commit()

def get_user(email):
    """Gets a user by email, only works in app context"""
    return DB.session.query(User). \
        filter(User.email == email). \
        one_or_none()


def test_successful_signup(setup_teardown_standard):
    """Successful signup returns a 201"""
    _, client = setup_teardown_standard
    # post form data
    response, _ = signup_user(client, 'test1')
    # check if we get a 201 status
    assert response.status_code == 201


def test_user_record_creation(setup_teardown_standard):
    """Successful signup creates a user record"""
    app, client = setup_teardown_standard
    with app.app_context():
        # count initial amount of records
        count = DB.session.query(User).count()
        # signup user
        email = 'test2@uu.nl'
        _, user = signup_user(client, email)
        # recount
        new_count = DB.session.query(User).count()
        assert new_count == (count + 1)
        # find it
        user = get_user(email)
        # check email
        assert user.email == email


def test_user_path_creation(setup_teardown_standard):
    """Successful signup creates a user subfolder in asreview path"""
    app, client = setup_teardown_standard
    email = 'test3@uu.nl'
    signup_user(client, email)
    with app.app_context():
        # get this user
        user = get_user(email)
        # check if subfolder for this user exists
        assert Path(asreview_path(), str(user.id)).exists()


def test_unique_emails_api(setup_teardown_standard):
    """Adding an existing email must return a 404 status and
    appropriate message"""
    app, client = setup_teardown_standard
    with app.app_context():
        email = 'test4@uu.nl'
        DB.session.add(User(email, '123456!AbC'))
        DB.session.commit()
        # try to create the same user again with the api
        response, _ = signup_user(client, email)
        assert response.status_code == 404
        assert f'"{email}" already exists' in \
            json.loads(response.data)['message']


def test_unique_emails_db(setup_teardown_standard):
    """Trying to add an existing user must not create a user record"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        email = 'test5@uu.nl'
        DB.session.add(User(email, '123456!AbC'))
        DB.session.commit()
        # count initial amount of records
        count = DB.session.query(User).count()
        # try to create the same user again with the api
        signup_user(client, email)
        # recount
        new_count = DB.session.query(User).count()
        assert new_count == count


def test_successful_signin_api(setup_teardown_standard):
    """Successfully signing in a user must return a 200 response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        email = 'test6@uu.nl'
        password = '123456Ab@'
        DB.session.add(User(email, password))
        DB.session.commit()
        response = signin_user(client, email, password)
        assert response.status_code == 200


def test_unsuccessful_signin_wrong_password_api(setup_teardown_standard):
    """Wrong password must return a 404 response
    and an appropriate response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        email = 'test7@uu.nl'
        password = '123456Ab@'
        DB.session.add(User(email, password))
        DB.session.commit()
        response = signin_user(client, email, 'wrong_password')
        assert response.status_code == 404
        assert 'Incorrect password' in \
            json.loads(response.data)['message']


def test_unsuccessful_signin_wrong_email_api(setup_teardown_standard):
    """Wrong email must return a 404 response
    and an appropriate response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        email = 'test8@uu.nl'
        password = '123456Ab@'
        DB.session.add(User(email, password))
        DB.session.commit()
        response = signin_user(client, 'TedjevanEs', password)
        assert response.status_code == 404
        assert 'does not exist' in \
            json.loads(response.data)['message']


def test_must_be_signed_in_to_signout(setup_teardown_standard):
    """User must be logged in, in order to signout,
    we expect an error if we sign out if not signed in"""
    app, client = setup_teardown_standard
    with app.app_context():
        # make sure any signed-in user is signed out
        client.delete('/auth/signout')
        # and do it again
        response = client.delete('/auth/signout')
        assert response.status_code == 401


def test_singout(setup_teardown_standard):
    """Signing out must return a 200 status and an
    appropriate message"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        email = 'test9@uu.nl'
        password = '123456Ab@'
        DB.session.add(User(email, password))
        DB.session.commit()
        # signin
        signin_user(client, email, password)
        # make sure any signed-in user is signed out
        response = client.delete('/auth/signout')
        # expect a 200
        assert response.status_code == 200
        assert 'signed out' in \
            json.loads(response.data)['message']
