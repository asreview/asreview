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
import asreview.webapp.tests.utils.crud as crud
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app

ASREVIEW_PATH=str(Path("~", ".asreview-test").expanduser())


def _get_app(app_type="auth-basic"):
    """Create test flask app"""
    # set asreview path
    os.environ.update({"ASREVIEW_PATH": ASREVIEW_PATH})
    # get path of appropriate flask config
    base_dir = Path(__file__).resolve().parent / "data"
    if app_type == "auth-basic":
        config_path = str(base_dir / "auth_basic_config.json")
    elif app_type == "auth-no-creation":
        config_path = str(base_dir / "auth_no_creation.json")
    elif app_type == "auth-verified":
        config_path = str(base_dir / "auth_verified_config.json")
    elif app_type == "no-auth":
        config_path = str(base_dir / "no_auth_config.json")
    else:
        raise ValueError(f"Unknown config {app_type}")
    # create app
    return create_app(flask_configfile=config_path)

# unauthenticated app
@pytest.fixture
def unauth_app():
    # create the app
    app = _get_app("no-auth")
    with app.app_context():
        yield app

# authenticated app
@pytest.fixture
def auth_app():
    # create app
    app = _get_app()
    with app.app_context():
        yield app
        

@pytest.fixture
def client_auth():
    app = _get_app("auth-basic")
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)


@pytest.fixture
def client_auth_no_creation():
    app = _get_app("auth-no-creation")
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)


@pytest.fixture
def client_auth_verified():
    app = _get_app("auth-verified")
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
    

@pytest.fixture
def client_no_auth():
    app = _get_app("no-auth")
    # make sure we have the asreview_path
    with app.app_context():
        yield unauth_app.test_client()


@pytest.fixture(scope="session", autouse=True)
def remove_test_asreview_path():
    pass
    yield
    if Path(ASREVIEW_PATH).exists():
        shutil.rmtree(ASREVIEW_PATH)
        print("\n...Removed asreview_path")
        
    


# =====================





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



