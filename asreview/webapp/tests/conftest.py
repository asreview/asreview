# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

import asreview.webapp.tests.utils.api_utils as au
from asreview.webapp import DB
from asreview.webapp.app import create_app
from asreview.webapp.tests.utils import crud
from asreview.webapp.utils import get_projects

PROJECTS = [
    {
        "mode": "oracle",
        "name": "demo project",
        "authors": "asreview team",
        "description": "hello world",
    },
    {
        "mode": "oracle",
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
        config_path = str(base_dir / "auth_basic_config.toml")
    elif app_type == "auth-no-creation":
        config_path = str(base_dir / "auth_no_creation.toml")
    elif app_type == "auth-verified":
        config_path = str(base_dir / "auth_verified_config.toml")
    elif app_type == "auth-remote":
        config_path = str(base_dir / "auth_remote_config.toml")
    elif app_type == "no-auth":
        config_path = str(base_dir / "no_auth_config.toml")
    elif app_type == "implicit-auth":
        config_path = str(base_dir / "implicit_auth_config.toml")
    elif app_type == "oauth":
        config_path = str(base_dir / "auth_with_oauth.toml")
    elif app_type == "oauth-with-allowed-account-creation":
        config_path = str(
            base_dir / "auth_with_oauth_and_allowed_account_creation.toml"
        )
    else:
        raise ValueError(f"Unknown config {app_type}")
    # create app
    app = create_app(config_path=config_path)
    app.config["TESTING"] = True
    # and return it
    return app


@pytest.fixture(scope="function", autouse=True)
def asreview_path_fixture(tmp_path_factory):
    """Fixture that creates and removes the ASReview test
    directory for the entire session."""
    # create an ASReview folder
    asreview_path = tmp_path_factory.mktemp("asreview-test")
    assert Path(asreview_path).exists()
    assert len(list(Path(asreview_path).glob("*"))) == 0
    yield str(asreview_path.absolute())
    # Pytest handles removal of ASReview folder


# unauthenticated app
@pytest.fixture
def unauth_app(asreview_path_fixture):
    """Create an unauthenticated version of the app."""
    # create the app
    app = _get_app("no-auth", path=asreview_path_fixture)
    with app.app_context():
        yield app


# authenticated app
@pytest.fixture
def auth_app(asreview_path_fixture):
    """Create an authenticated app, account creation
    allowed."""
    # create app
    app = _get_app(path=asreview_path_fixture)
    with app.app_context():
        yield app


@pytest.fixture
def client_auth(asreview_path_fixture):
    """Flask client for basic authenticated app, account
    creation allowed."""
    app = _get_app("auth-basic", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_implicit_auth(asreview_path_fixture):
    """Flask client to check if the app is authenticated when
    authentication configuration is missing."""
    app = _get_app("implicit-auth", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_auth_no_creation(asreview_path_fixture):
    """Flask client for an authenticated app, account
    creation not allowed."""
    app = _get_app("auth-no-creation", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_auth_verified(asreview_path_fixture):
    """Flask client for an authenticated app, account
    creation allowed, user accounts needs account
    verification."""
    app = _get_app("auth-verified", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_no_auth(asreview_path_fixture):
    """Flask client for an unauthenticated app."""
    app = _get_app("no-auth", path=asreview_path_fixture)
    # make sure we have the asreview_path
    with app.app_context():
        yield app.test_client()


@pytest.fixture
def client_remote_auth(asreview_path_fixture):
    """Flask client for remotely authenticated app, account
    creation not allowed."""
    app = _get_app("auth-remote", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_oauth(asreview_path_fixture):
    """Flask client for oauth authenticated app, account
    creation not allowed."""
    app = _get_app("oauth", path=asreview_path_fixture)
    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture
def client_oauth_with_account_creation(asreview_path_fixture):
    """Flask client for oauth authenticated app, account
    creation has been configured."""
    app = _get_app("oauth-with-allowed-account-creation", path=asreview_path_fixture)

    with app.app_context():
        yield app.test_client()
        crud.delete_everything(DB)
        close_all_sessions()
        DB.engine.raw_connection().close()


@pytest.fixture(params=["client_auth", "client_implicit_auth", "client_no_auth"])
def client(request):
    """This fixture provides different Flask client (authenticated
    and unauthenticated) for every test that uses it."""
    client = request.getfixturevalue(request.param)
    yield client
    if request.param == "client_auth":
        # cleanup database and asreview_path
        crud.delete_everything(DB)


@pytest.fixture()
def user(client):
    if not client.application.config["AUTHENTICATION"]:
        user = None
    else:
        user = au.create_and_signin_user(client, 1)

    yield user
    if client.application.config["AUTHENTICATION"]:
        crud.delete_everything(DB)


@pytest.fixture()
def project(request):
    client = None
    for name in request.fixturenames:
        if name.startswith("client"):
            client = request.getfixturevalue(name)
            break

    if client is None:
        raise ValueError("No client found in fixturenames")

    if "user" in request.fixturenames:
        user = request.getfixturevalue("user")
    elif client.application.config["AUTHENTICATION"]:
        user = au.create_and_signin_user(client, 1)
    else:
        user = None

    au.create_project(client, benchmark="synergy:van_der_Valk_2021")
    yield user.projects[0] if user is not None else get_projects()[0]

    if client.application.config["AUTHENTICATION"]:
        crud.delete_everything(DB)
