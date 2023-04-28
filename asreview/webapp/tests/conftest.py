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
import shutil
from pathlib import Path

import pytest

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app

try:
    from .temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}


def signup_user(client, identifier, password="!biuCrgfsiOOO6987"):
    """Signs up a user through the api"""
    response = client.post(
        "/auth/signup",
        data={
            "identifier": identifier,
            "email": identifier,
            "name": "Test Kees",
            "password": password,
            "origin": "asreview",
        },
    )
    return response


def signin_user(client, identifier, password):
    """Signs in a user through the api"""
    return client.post("/auth/signin", data={"email": identifier, "password": password})


def signout(client):
    return client.delete("/auth/signout")


# TODO@{Casper}:
# Something nasty happens when execute multiple test
# modules, if one stops it takes a while before
# the teardown is actually processed: that will cause
# a problem for the still running file (emptying the
# database, removing the asreview folder...)
@pytest.fixture(scope="module")
def setup_teardown_signed_in():
    """Setup and teardown with a signed in user."""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # load appropriate config file
    root_dir = str(Path(os.path.abspath(__file__)).parent)
    config_file_path = f"{root_dir}/configs/auth_config.json"
    # create app and client
    app = create_app(enable_auth=True, flask_configfile=config_file_path)
    with app.app_context():
        client = app.test_client()
        email, password = "c.s.kaandorp@uu.nl", "123456!AbC"
        # create user
        signup_user(client, email, password)
        # signin this user
        signin_user(client, email, password)
        user = DB.session.query(User).filter(User.identifier == email).one_or_none()
        yield app, client, user

        try:
            # remove the entire .asreview-test folder
            # which also removes the database
            shutil.rmtree(asreview_path())
        except Exception:
            # don't care
            pass


@pytest.fixture(scope="module")
def setup_teardown_unauthorized():
    """Standard setup and teardown, create the app without
    a database and create testclient"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # create app and client
    app = create_app(enable_auth=False)
    client = app.test_client()

    yield app, client
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
