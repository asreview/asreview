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
import time
from uuid import uuid5, NAMESPACE_URL

import pytest

from asreview.project import _create_project_id
from asreview.project import PATH_FEATURE_MATRICES
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import (
    Collaboration, CollaborationInvitation, Project, User
)
from conftest import signup_user

@pytest.fixture
def populate(setup_teardown_signed_in):
    _, client, current_user = setup_teardown_signed_in
    # create 2 other users
    signup_user(client, 'coll1@test.org')
    signup_user(client, 'coll2@test.org')
    # create project for users
    project = Project(
        project_id="1233",
        folder="1233",
        owner_id=current_user.id
    )
    DB.session.add(project)
    # return yield
    coll1 = User.query.filter(User.identifier=='coll1@test.org').first()
    coll2 = User.query.filter(User.identifier=='coll2@test.org').first()
    yield (client, current_user, coll1, coll2, project)
    try:
        # cleanup the database
        Collaboration.query.delete()
        CollaborationInvitation.query.delete()
        Project.query.delete()
        User.query.delete()
        DB.session.commit()
        # clean up project folders
        project_folders = [ 
            f for f in os.listdir(asreview_path())
            if not(f.endswith('.sqlite'))
        ]
        for f in project_folders:
            shutil.rmtree(f'{asreview_path()}/{f}')
        
    except Exception as e:
        # don't care
        print(e)


def test_if_fixtures_work(populate):
    """Test if my database is populated."""
    client, current_user, _, _, _ = populate

    # check if I have 3 users
    assert len(User.query.all()) == 3
    # check if we have a project from signed in user
    assert len(Project.query.all()) == 1
    project = Project.query.first()
    assert project.owner == current_user


# def test_invitations(populate):
#     """Test if current user can invite"""
#     client, current_user, coll1, coll2, project = populate
#     resp = client.post(f'/api/invitations?projects_id={project.id}&user_id={coll1.id}')
#     print(resp)

#     print(CollaborationInvitation.query.all())
#     # assert I have 2 invitations
#     assert len(CollaborationInvitation.query.all()) == 2


def test_invitations_2(populate):
    """Test if current user can invite"""
    client, current_user, coll1, coll2, project = populate
    with client as c:
        resp = c.get(f'/api/invitations')
        print(resp)

