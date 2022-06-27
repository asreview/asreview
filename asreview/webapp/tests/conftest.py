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

import os
import pytest
import shutil

from .. import db
from asreview.utils import asreview_path
from asreview.webapp.start_flask import create_app
from asreview.webapp.authentication.models import User

try:
    from.temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}


def signup_user(client, username, password='!biuCrgfsiOOO6987'):
    """Signs up a user through the api"""
    response = client.post(
        '/auth/signup',
        data = {
            'username': username,
            'password': password
        }
    )
    return response, User(username, password)


def signin_user(client, username, password):
    """Signs in a user through the api"""
    return client.post(
        '/auth/signin',
        data = {
            'username': username,
            'password': password
        }
    )


@pytest.fixture()
def setup_teardown_standard():
    """Standard setup and teardown, create the app and 
    testclient, make sure the database is cleaned up
    after running the last test"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # create app and client
    app = create_app()
    client = app.test_client()

    with app.app_context():
        yield app, client
        # cleanup the database
        db.session.query(User).delete()
        db.session.commit()
        # remove the entire .asreview-test folder
        shutil.rmtree(asreview_path())

# TODO@{Casper}:
# Something nasty happens when execute multiple test
# modules, if one stops it takes a while before
# the teardown is actually processed: that will cause
# a problem for the still running file (emptying the
# database, removing the asreview folder...)
@pytest.fixture(scope='session')
def setup_teardown_signed_in():
    """Setup and teardown with a signed in user."""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # create app and client
    app = create_app()
    client = app.test_client()
    username, password = 'cskaandorp', '123456!AbC'
    signup_user(client, username, password)

    # inject testuser
    with app.app_context():
        # signin this user
        signin_user(client, username, password)

        yield app, client
        # cleanup the database
        User.query.delete()
        db.session.commit()
        # remove the entire .asreview-test folder
        shutil.rmtree(asreview_path())


@pytest.fixture
def app():
    app = create_app()
    return app


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()
