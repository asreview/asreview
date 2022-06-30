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
from pathlib import Path

from asreview.utils import asreview_path
from asreview.webapp import db
from asreview.webapp.authentication.models import User
from asreview.webapp.tests.conftest import signin_user, signup_user


def get_user(username):
    """Gets a user by username, only works in app context"""
    return db.session.query(User). \
        filter(User.username == username). \
        one_or_none()


def test_successful_signup(setup_teardown_standard):
    """Successful signup returns a 201"""
    app, client = setup_teardown_standard
    # post form data
    response, user = signup_user(client, 'test1')
    # check if we get a 201 status
    assert response.status_code == 201


def test_user_record_creation(setup_teardown_standard):
    """Successful signup creates a user record"""
    app, client = setup_teardown_standard
    with app.app_context():
        # count initial amount of records
        count = db.session.query(User).count()
        # signup user
        username = 'test2'
        response, user = signup_user(client, username)
        # recount
        new_count = db.session.query(User).count()
        assert new_count == (count + 1)
        # find it
        user = get_user(username)
        # check username
        assert user.username == username


def test_user_path_creation(setup_teardown_standard):
    """Successful signup creates a user subfolder in asreview path"""
    app, client = setup_teardown_standard
    username = 'test3'
    response, _ = signup_user(client, username)
    with app.app_context():
        # get this user
        user = get_user(username)
        # check if subfolder for this user exists
        assert Path(asreview_path(), str(user.id)).exists()


def test_unique_usernames_api(setup_teardown_standard):
    """Adding an existing username must return a 404 status and
    appropriate message"""
    app, client = setup_teardown_standard
    with app.app_context():
        username = 'test4'
        db.session.add(User(username, '123456!AbC'))
        db.session.commit()
        # try to create the same user again with the api
        response, _ = signup_user(client, username)
        assert response.status_code == 404
        assert f'"{username}" already exists' in \
            json.loads(response.data)['message']


def test_unique_usernames_db(setup_teardown_standard):
    """Trying to add an existing user must not create a user record"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        username = 'test5'
        db.session.add(User(username, '123456!AbC'))
        db.session.commit()
        # count initial amount of records
        count = db.session.query(User).count()
        # try to create the same user again with the api
        response, _ = signup_user(client, username)
        # recount
        new_count = db.session.query(User).count()
        assert new_count == count


def test_successful_signin_api(setup_teardown_standard):
    """Successfully signing in a user must return a 200 response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        username = 'test6'
        password = '123456Ab@'
        db.session.add(User(username, password))
        db.session.commit()
        response = signin_user(client, username, password)
        assert response.status_code == 200


def test_unsuccessful_signin_wrong_password_api(setup_teardown_standard):
    """Wrong password must return a 404 response
    and an appropriate response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        username = 'test7'
        password = '123456Ab@'
        db.session.add(User(username, password))
        db.session.commit()
        response = signin_user(client, username, 'wrong_password')
        assert response.status_code == 404
        assert 'Incorrect password' in \
            json.loads(response.data)['message']


def test_unsuccessful_signin_wrong_username_api(setup_teardown_standard):
    """Wrong username must return a 404 response
    and an appropriate response"""
    app, client = setup_teardown_standard
    with app.app_context():
        # create user
        username = 'test8'
        password = '123456Ab@'
        db.session.add(User(username, password))
        db.session.commit()
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
        username = 'test9'
        password = '123456Ab@'
        db.session.add(User(username, password))
        db.session.commit()
        # signin
        signin_user(client, username, password)
        # make sure any signed-in user is signed out
        response = client.delete('/auth/signout')
        # expect a 200
        assert response.status_code == 200
        assert 'signed out' in \
            json.loads(response.data)['message']
