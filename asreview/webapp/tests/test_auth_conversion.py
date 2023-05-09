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

from asreview.entry_points.auth_tool import insert_project
from asreview.project import _create_project_id
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.api.projects import _get_authenticated_folder_id
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app
from asreview.webapp.tests.conftest import signin_user
from asreview.webapp.tests.conftest import signout
from asreview.webapp.tests.conftest import signup_user

try:
    from .temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}

PROJECTS = [
    {
        "mode": "explore",
        "name": "project_1",
        "authors": "user 1",
        "description": "project 1",
    },
    {
        "mode": "explore",
        "name": "project_2",
        "authors": "user 2",
        "description": "project 2",
    },
]


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
        request.cls.emails = ["test1@uu.nl", "test2@uu.nl"]
        request.cls.password = "A123Bb!!"
        yield request.cls


@pytest.mark.usefixtures("no_auth_fixture")
class TestNoAuthentication:
    """We start with an inital ASReview instance without authentication."""

    def test_existence_empty_test_folder(self):
        # make sure we start with a clean slate
        for path in Path(asreview_path()).glob("**/*"):
            if path.is_file():
                path.unlink()
            elif path.is_dir():
                shutil.rmtree(path)
        # check existence folder
        assert self.asreview_folder.exists() is True
        # check if folder is empty
        assert list(self.asreview_folder.glob("*")) == []

    def test_creating_2_projects(self):
        # create first project
        self.client.post(
            "/api/projects/info",
            data=PROJECTS[0],
        )
        # create second project
        self.client.post(
            "/api/projects/info",
            data=PROJECTS[1],
        )
        # check if asreview folder contain 2 projects
        assert len(list(self.asreview_folder.glob("*"))) == 2
        # check if projects are there
        folders = [f.name for f in self.asreview_folder.glob("*")]
        for p in PROJECTS:
            project_id = _create_project_id(p["name"])
            assert project_id in folders

    def test_listing_the_projects(self):
        # use api to get all projects
        response = self.client.get("/api/projects")
        json_data = response.get_json()
        assert response.status_code == 200
        assert len(json_data["result"]) == 2
        names = [p["name"] for p in PROJECTS]
        for p in json_data["result"]:
            assert p["name"] in names

    def test_accessing_projects(self):
        for p in PROJECTS:
            project_id = _create_project_id(p["name"])
            response = self.client.get(f"/api/projects/{project_id}/info")
            json_data = response.get_json()
            assert response.status_code == 200
            assert json_data["name"] == p["name"]


# ------------------------------------------
# NOW WE CONVERT TO AN AUTHENTICATED VERSION
# ------------------------------------------


@pytest.mark.usefixtures("auth_fixture")
class TestConvertToAuthentication:
    """Now we move on and start the thing in authenticated mode."""

    def test_if_we_still_have_our_projects_and_a_sqlite_db(self):
        """Start the app with authentication, we still have the
        folder structure of the unauthenticated app."""
        # check if asreview folder contain 2 projects
        assert len(list(self.asreview_folder.glob("*"))) == 3
        # check if projects are there
        folder_content = [f.name for f in self.asreview_folder.glob("*")]
        for p in PROJECTS:
            project_id = _create_project_id(p["name"])
            assert project_id in folder_content
        # check for the database
        assert "asreview.test.sqlite" in folder_content

    def test_adding_users_into_the_users_table_and_convert(self):
        """Convert to authenticated folder structure."""
        self.password = "A123Bb!!"
        self.emails = ["test1@uu.nl", "test2@uu.nl"]
        # create users
        for email in self.emails:
            signup_user(self.client, email, self.password)
        assert len(User.query.all()) == 2

        # we want to assign project 1 to user 1 and project 2 to user 2
        mapping = [
            {"owner_id": user.id, "project_id": _create_project_id(PROJECTS[i]["name"])}
            for i, user in enumerate(User.query.order_by(User.id.asc()).all())
        ]

        # execute converter with this mapping
        for project in mapping:
            insert_project(DB.session, project)

        # check out folders in the asreview folder
        folders = [f.name for f in asreview_path().glob("*") if f.is_dir()]

        # check if we don't have the old folder names anymore
        for link in mapping:
            project_id = link["project_id"]
            assert project_id not in folders

        # check if we have the new folder names and if they exist
        # in the database with the correct user
        for link in mapping:
            user = DB.session.get(User, link["owner_id"])
            project_id = link["project_id"]

            # check out if the folder exists
            new_project_id = _get_authenticated_folder_id(project_id, user)
            assert new_project_id in folders

            # check project in database and if it's linked to the user
            project = Project.query.filter(Project.project_id == new_project_id).first()
            assert project.owner_id == user.id

            # check if we have the correct new project id in the data file
            # of the folder
            with open(asreview_path() / new_project_id / "project.json") as f:
                data = json.load(f)
                assert data["id"] == new_project_id

    def test_projects_of_user_1(self):
        """Checkout projects of user 1."""
        # get user 1
        user_1 = DB.session.get(User, 1)
        # signin user
        signin_user(self.client, user_1.identifier, self.password)
        # check projects of user_1
        response = self.client.get("/api/projects")
        json_data = response.get_json()
        # get the result data
        projects = json_data.get("result", [])
        # there should be 1 project, and it has to be the first
        assert len(projects) == 1
        project = projects[0]
        assert project["name"] == PROJECTS[0]["name"]
        assert project["authors"] == PROJECTS[0]["authors"]
        assert project["description"] == PROJECTS[0]["description"]
        # access project
        project = user_1.projects[0]
        response = self.client.get(f"/api/projects/{project.project_id}/info")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["name"] == PROJECTS[0]["name"]
        # signout
        signout(self.client)

    def test_projects_of_user_2(self):
        """Checkout projects of user 2."""
        # get user 2
        user_2 = DB.session.get(User, 2)
        # signin user
        signin_user(self.client, user_2.identifier, self.password)
        # check projects of user_2
        response = self.client.get("/api/projects")
        json_data = response.get_json()
        # get the result data
        projects = json_data.get("result", [])
        # there should be 1 project, and it has to be the first
        assert len(projects) == 1
        project = projects[0]
        assert project["name"] == PROJECTS[1]["name"]
        assert project["authors"] == PROJECTS[1]["authors"]
        assert project["description"] == PROJECTS[1]["description"]
        # access project
        project = user_2.projects[0]
        response = self.client.get(f"/api/projects/{project.project_id}/info")
        json_data = response.get_json()
        assert response.status_code == 200
        assert json_data["name"] == PROJECTS[1]["name"]
        # signout
        signout(self.client)

    def test_if_user_1_cant_see_project_2(self):
        """Check if user_1 cant see project 2."""
        # get user 1
        user_1 = DB.session.get(User, 1)
        # signin user
        signin_user(self.client, user_1.identifier, self.password)
        # try to get project 2, we need the id first
        project_2_id = _create_project_id(PROJECTS[1]["name"])
        project_2_id = _get_authenticated_folder_id(
            project_2_id, DB.session.get(User, 2)
        )
        # user_1 tries to see project 2
        response = self.client.get(f"/api/projects/{project_2_id}/info")
        json_data = response.get_json()
        assert response.status_code == 403
        assert json_data["message"] == "no permission"
        # signout
        signout(self.client)

    def test_if_user_2_cant_see_project_1(self):
        """Check if user_1 cant see project 2."""
        # get user 1
        user_2 = DB.session.get(User, 2)
        # signin user
        signin_user(self.client, user_2.identifier, self.password)
        # try to get project 2, we need the id first
        project_1_id = _create_project_id(PROJECTS[0]["name"])
        project_1_id = _get_authenticated_folder_id(
            project_1_id, DB.session.get(User, 1)
        )
        # user_2 tries to see project 1
        response = self.client.get(f"/api/projects/{project_1_id}/info")
        json_data = response.get_json()
        assert response.status_code == 403
        assert json_data["message"] == "no permission"
        # signout
        signout(self.client)


# ------------------------------------------
# NOW WE CONVERT TO AN AUTHENTICATED VERSION
# ------------------------------------------


@pytest.mark.usefixtures("no_auth_fixture_with_folder_removal")
class TestBackToNoAuthentication:
    def test_projects_after_unauthentication(self):
        # test listing the projects throught the api
        response = self.client.get("/api/projects")
        json_data = response.get_json()
        assert response.status_code == 200
        assert len(json_data["result"]) == 2
        names = [p["name"] for p in PROJECTS]
        for p in json_data["result"]:
            assert p["name"] in names

        # check what's in the asreview-folder to get ids
        ids = [f.name for f in asreview_path().glob("*") if f.is_dir()]
        for id in ids:
            # accessing the projects!!!
            response = self.client.get(f"/api/projects/{id}/info")
            json_data = response.get_json()
            assert response.status_code == 200
            assert json_data["name"] in names
