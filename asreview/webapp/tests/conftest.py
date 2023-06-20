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
from pathlib import Path

import pytest
from sqlalchemy.orm import close_all_sessions

from asreview.webapp import DB
from asreview.webapp.start_flask import create_app
from asreview.webapp.tests.utils import crud
from asreview.webapp.tests.utils import misc

PROJECTS = [
    {
        "mode": "explore",
        "name": "demo project",
        "authors": "asreview team",
        "description": "hello world",
    },
    {
        "mode": "explore",
        "name": "another demo project",
        "authors": "asreview team",
        "description": "hello world",
    },
]


def _get_app(app_type="auth-basic", path=None):
    """Create and returns test flask app based on app_type"""
    # set asreview path
    os.environ.update({"ASREVIEW_PATH": path})
    # get path of appropriate flask config
    base_dir = Path(__file__).resolve().parent / "config"
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
    app = create_app(flask_configfile=config_path)
    # and return it
    return app


@pytest.fixture(scope="session", autouse=True)
def session_fixture(tmp_path_factory):
    """Fixture that creates and removes the ASReview test
    directory for the entire session."""
    # create an ASReview folder
    asreview_path = tmp_path_factory.mktemp("asreview-test")
    assert Path(asreview_path).exists()
    yield str(asreview_path.absolute())
    # Pytest handles removal of ASReview folder


# unauthenticated app
@pytest.fixture
def unauth_app(session_fixture):
    """Create an unauthenticated version of the app."""
    # create the app
    app = _get_app("no-auth", path=session_fixture)
    with app.app_context():
        yield app


# authenticated app
@pytest.fixture
def auth_app(session_fixture):
    """Create an authenticated app, account creation
    allowed."""
    # create app
    app = _get_app(path=session_fixture)
    with app.app_context():
        yield app


@pytest.fixture
def client_auth(session_fixture):
    """Flask client for basic authenticated app, account
    creation allowed."""
    app = _get_app("auth-basic", path=session_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()
        misc.clear_asreview_path(remove_files=False)


@pytest.fixture
def client_auth_no_creation(session_fixture):
    """Flask client for an authenticated app, account
    creation not allowed."""
    app = _get_app("auth-no-creation", path=session_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()
        misc.clear_asreview_path(remove_files=False)


@pytest.fixture
def client_auth_verified(session_fixture):
    """Flask client for an authenticated app, account
    creation allowed, user accounts needs account
    verification."""
    app = _get_app("auth-verified", path=session_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()
        misc.clear_asreview_path(remove_files=False)


@pytest.fixture
def client_no_auth(session_fixture):
    """Flask client for an unauthenticated app."""
    app = _get_app("no-auth", path=session_fixture)
    # make sure we have the asreview_path
    with app.app_context():
        yield app.test_client()
        misc.clear_asreview_path(remove_files=False)
