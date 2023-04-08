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
import shutil
from pathlib import Path


import pytest

from asreview.project import _create_project_id
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.api.projects import _get_authenticated_folder_id
from asreview.webapp.authentication.models import Project, User
from asreview.webapp.scripts.auth_conversion import main as make_links
from asreview.webapp.start_flask import create_app
from asreview.webapp.tests.conftest import signin_user
from asreview.webapp.tests.conftest import signup_user

try:
    from .temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}

PROJECT_1 = {
    "mode": "explore",
    "name": "project_1",
    "authors": "authors",
    "description": "project 1",
}

PROJECT_2 = {
    "mode": "explore",
    "name": "project_2",
    "authors": "authors",
    "description": "project 2",
}


def create_the_app(config_file):
    os.environ.update(TMP_ENV_VARS)
    root_dir = str(Path(os.path.abspath(__file__)).parent)
    config_file_path = f"{root_dir}/configs/{config_file}"
    return create_app(flask_configfile=config_file_path)


@pytest.fixture(scope="class")
def no_auth_fixture(request):
    """This fixture starts a non-authenticated version of ASReview"""
    app = create_the_app("no_auth_config.json")
    client = app.test_client()
    request.cls.app = app
    request.cls.client = client
    request.cls.asreview_folder = Path(asreview_path())
    yield request.cls


@pytest.fixture(scope="class")
def no_auth_fixture_with_folder_removal(no_auth_fixture):
    init_fixture = no_auth_fixture()
    yield
    shutil.rmtree(init_fixture.asreview_folder)


@pytest.fixture(scope="class")
def auth_fixture(request):
    app = create_the_app("auth_config.json")
    with app.app_context():
        client = app.test_client()
        request.cls.app = app
        request.cls.client = client
        request.cls.asreview_folder = Path(asreview_path())
        yield request.cls


@pytest.mark.usefixtures("no_auth_fixture")
class TestNoAuthentication:
    """We start with an inital ASReview instance without authentication"""

    def test_existence_empty_test_folder(self):
        # check existence folder
        assert self.asreview_folder.exists() is True
        # check if folder is empty
        assert list(self.asreview_folder.glob("*")) == []

    def test_creating_2_projects(self):
        # create first project
        self.client.post(
            "/api/projects/info",
            data=PROJECT_1,
        )
        # create second project
        self.client.post(
            "/api/projects/info",
            data=PROJECT_2,
        )
        # check if asreview folder contain 2 projects
        assert len(list(self.asreview_folder.glob("*"))) == 2
        # check if projects are there
        folders = [f.name for f in self.asreview_folder.glob("*")]
        for p in [PROJECT_1, PROJECT_2]:
            project_id = _create_project_id(p["name"])
            assert project_id in folders


@pytest.mark.usefixtures("auth_fixture")
class TestConvertToAuthentication:
    """Now we move on and start the thing in authenticated mode"""

    def test_if_we_still_have_our_projects_and_a_sqlite_db(self):
        # check if asreview folder contain 2 projects
        assert len(list(self.asreview_folder.glob("*"))) == 3
        # check if projects are there
        folder_content = [f.name for f in self.asreview_folder.glob("*")]
        for p in [PROJECT_1, PROJECT_2]:
            project_id = _create_project_id(p["name"])
            assert project_id in folder_content
        # check for the database
        assert "asreview.development.sqlite" in folder_content

    def test_adding_users_into_the_users_table_and_convert(self):
        self.password = "A123Bb!!"
        for email in ["test1@uu.nl", "test2@uu.nl"]:
            signup_user(self.client, email, self.password)
        assert len(User.query.all()) == 2

        # we want to assign project 1 to user 1 and project 2 to user 2
        projects = [PROJECT_1, PROJECT_2]
        mapping = [
            {
                "user_id": user.id,
                "project_id": _create_project_id(projects[i]["name"])
            } for i, user in enumerate(
                User.query.order_by(User.id.asc()).all()
            )
        ]

        # execute converter with this mapping
        make_links(mapping)

        # check out folders in the asreview folder
        folders = [f.name for f in asreview_path().glob("*") if f.is_dir()]

        # check if we don't have the old folder names anymore
        for link in mapping:
            project_id = link["project_id"]
            assert project_id not in folders

        # check if we have the new folder names and if they exist
        # in the database with the correct user
        for link in mapping:
            user = DB.session.get(User, link["user_id"])
            project_id = link["project_id"]

            # check out if the folder exists
            new_project_id = _get_authenticated_folder_id(project_id, user)
            assert new_project_id in folders

            # check project in database and if it's linked to the user
            project = Project.query.filter(
                Project.project_id == new_project_id
            ).first()
            assert project.owner_id == user.id

            # check if we have the correct new project id in the data file
            # of the folder
            with open(asreview_path() / new_project_id / "project.json") as f:
                data = json.load(f)
                assert data["id"] == new_project_id

    def test_whate(self):
        assert 1 == 1


@pytest.mark.usefixtures("no_auth_fixture_with_folder_removal")
class TestBackToNoAuthentication:

    def test_query1(self):
        assert 1 == 1

    def test_whatever(self):
        assert 1 == 1

    def test_whate(self):
        assert 1 == 1
