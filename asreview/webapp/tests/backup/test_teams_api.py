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

import pytest

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Collaboration
from asreview.webapp.authentication.models import CollaborationInvitation
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
from asreview.webapp.tests.conftest import signin_user
from asreview.webapp.tests.conftest import signout
from asreview.webapp.tests.conftest import signup_user

password_main_user = "A12bcdefg!!"
password_coll1 = "B12345*6"
password_coll2 = "C1@2a3456"


@pytest.fixture
def populate(setup_teardown_signed_in):
    # we are not going to use the user created in setup_....
    # since it will be created only once and removed after
    # the first test
    app, client, _ = setup_teardown_signed_in
    with app.app_context():
        # create other users
        signup_user(client, "main@test.org", password_main_user)
        signup_user(client, "coll1@test.org", password_coll1)
        signup_user(client, "coll2@test.org", password_coll2)

        # signin main user
        signin_user(client, "main@test.org", password_main_user)

        # create project for users
        client.post(
            "/api/projects/info",
            data={
                "mode": "oracle",
                "name": "Test Project",
                "description": "blabla",
                "authors": "bunch",
            },
        )
        # get project
        assert len(Project.query.all()) == 1
        project = Project.query.first()
        # return yield
        owner = User.query.filter(User.identifier == "main@test.org").first()
        coll1 = User.query.filter(User.identifier == "coll1@test.org").first()
        coll2 = User.query.filter(User.identifier == "coll2@test.org").first()
        yield (client, owner, coll1, coll2, project)

        try:
            # cleanup the database
            for model in [Collaboration, CollaborationInvitation, Project, User]:
                DB.session.query(model).delete()
            DB.session.commit()
            # clean up project folders
            project_folders = [
                f for f in os.listdir(asreview_path()) if not (f.endswith(".sqlite"))
            ]
            # remove subfolders
            for f in project_folders:
                shutil.rmtree(f"{asreview_path()}/{f}")

        except Exception:
            # don't care
            pass


def test_if_fixtures_work(populate):
    """Test if my database is populated."""
    _, owner, _, _, _ = populate

    # check if we have a project from signed in user
    assert len(Project.query.all()) == 1
    project = Project.query.first()
    assert project.owner == owner


def test_get_team(populate):
    """Test if owner can get a user overview of his/her team"""
    client, _, coll1, coll2, project = populate

    # assert I have 0 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 0

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0

    # invite 2
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"
    url = f"/api/invitations/projects/{project.project_id}/users/{coll2.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)
    # coll1 accepts invitation
    url = f"/api/invitations/projects/{project.project_id}/accept"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # back to owner
    signout(client)
    resp = signin_user(client, "main@test.org", password_main_user)

    # owner wants overview
    url = f"/api/projects/{project.project_id}/users"
    resp = client.get(url)
    assert resp.status == "200 OK"

    data = json.loads(resp.text)
    assert sorted(list(data.keys())) == ["all_users", "collaborators", "invitations"]
    assert data["collaborators"] == [coll1.id]
    assert data["invitations"] == [coll2.id]
    assert sorted([d["id"] for d in data["all_users"]]) == [2, 3]


def test_owner_removes_collaborator(populate):
    """Test owner removes a collaborator"""
    client, _, coll1, _, project = populate

    # invite
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)
    # coll1 accepts invitation
    url = f"/api/invitations/projects/{project.project_id}/accept"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # back to owner
    signout(client)
    resp = signin_user(client, "main@test.org", password_main_user)

    # assert we have a collaboration
    collabs = Collaboration.query.all()
    assert len(collabs) == 1

    # remove collaborator
    url = f"/api/projects/{project.project_id}/users/{coll1.id}"
    resp = client.delete(url)
    assert resp.status == "200 OK"

    # assert we have 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0


def test_collaborator_ends_collaboration(populate):
    """Test collaborator ends collaboration"""
    client, _, coll1, _, project = populate

    # invite
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)
    # coll1 accepts invitation
    url = f"/api/invitations/projects/{project.project_id}/accept"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # assert we have a collaboration
    collabs = Collaboration.query.all()
    assert len(collabs) == 1

    # remove collaborator
    url = f"/api/projects/{project.project_id}/users/{coll1.id}"
    resp = client.delete(url)
    assert resp.status == "200 OK"

    # assert we have 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0


def test_invitation_overview(populate):
    """Test if invitee sees invitation"""
    client, _, coll1, _, project = populate

    # invite
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)

    # coll1 wants to see invitations
    url = "/api/invitations"
    resp = client.get(url)
    assert resp.status == "200 OK"

    data = json.loads(resp.text)
    assert "invited_for_projects" in data.keys()
    assert len(data["invited_for_projects"]) == 1
    assert data["invited_for_projects"][0]["id"] == project.id


def test_owner_send_invitation(populate):
    """Test if owner can invite"""
    client, _, coll1, _, project = populate
    # assert I have 0 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 0

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # assert I have 1 invitation
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 1
    invite = invites[0]
    assert invite.user_id == coll1.id
    assert invite.project_id == project.id


def test_accept_team_invitation(populate):
    """Test collaborator accepts invitation"""
    client, owner, coll1, _, project = populate

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)
    # accept invitation
    url = f"/api/invitations/projects/{project.project_id}/accept"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # assert system has 0 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 0

    # assert system has 1 collaboration
    collabs = Collaboration.query.all()
    assert len(collabs) == 1
    assert collabs[0].user_id == coll1.id
    assert collabs[0].project_id == project.id


def test_reject_team_invitation(populate):
    """Test collaborator rejects invitation"""
    client, _, coll1, _, project = populate

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # assert system has 1 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 1

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)
    # reject invitation
    url = f"/api/invitations/projects/{project.project_id}/reject"
    resp = client.delete(url)
    assert resp.status == "200 OK"

    # assert system has 0 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 0

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0


def test_owner_deletes_invitation(populate):
    """Test owner retracts invitation"""
    client, _, coll1, _, project = populate

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # assert system has 1 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 1

    # remove invitation
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.delete(url)
    assert resp.status == "200 OK"

    # assert system has 0 invitations
    invites = CollaborationInvitation.query.all()
    assert len(invites) == 0

    # assert system has 0 collaborations
    collabs = Collaboration.query.all()
    assert len(collabs) == 0


#
# TEST IMPROPER USE OF TEAMS API
#


def test_improper_get_team(populate):
    """Test if owner can get a user overview of his/her team"""
    client, _, coll1, _, project = populate

    # signout owner, signin coll1
    signout(client)
    signin_user(client, "coll1@test.org", password_coll1)

    # owner wants overview
    url = f"/api/projects/{project.project_id}/users"
    resp = client.get(url)
    assert resp.status == "404 NOT FOUND"


def outsider_can_not_remove_collaborator(populate):
    """Test owner removes a collaborator"""
    client, _, coll1, _, project = populate

    # invite
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll2
    signout(client)
    signin_user(client, "coll2@test.org", password_coll2)

    # coll1 tries to remove collaborator
    url = f"/api/projects/{project.project_id}/users/{coll1.id}"
    resp = client.delete(url)
    assert resp.status == "404 NOT FOUND"


def test_improper_owner_send_invitation(populate):
    """Test if outsider can not invite"""
    client, _, coll1, _, project = populate

    # signout owner, signin coll2
    signout(client)
    signin_user(client, "coll2@test.org", password_coll2)

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "404 NOT FOUND"


def test_improper_accept_team_invitation(populate):
    """Test outsider can not accept invitation"""
    client, _, coll1, _, project = populate

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll2
    signout(client)
    signin_user(client, "coll2@test.org", password_coll2)
    # accept invitation
    url = f"/api/invitations/projects/{project.project_id}/accept"
    resp = client.post(url)
    assert resp.status == "404 NOT FOUND"


def test_improper_reject_team_invitation(populate):
    """Test outsider can not reject invitation"""
    client, _, coll1, _, project = populate

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll2
    signout(client)
    signin_user(client, "coll2@test.org", password_coll2)
    # accept invitation
    url = f"/api/invitations/projects/{project.project_id}/reject"
    resp = client.delete(url)
    assert resp.status == "404 NOT FOUND"


def test_improper_owner_deletes_invitation(populate):
    """Test owner retracts invitation"""
    client, _, coll1, _, project = populate

    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.post(url)
    assert resp.status == "200 OK"

    # signout owner, signin coll2
    signout(client)
    signin_user(client, "coll2@test.org", password_coll2)

    # remove invitation
    url = f"/api/invitations/projects/{project.project_id}/users/{coll1.id}"
    resp = client.delete(url)
    assert resp.status == "404 NOT FOUND"
