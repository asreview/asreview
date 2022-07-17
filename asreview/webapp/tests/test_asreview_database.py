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

import shutil
import os
from unittest.case import _AssertRaisesContext

import pytest
from sqlalchemy.exc import IntegrityError

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import (
    User, Project
)
from asreview.webapp.start_flask import create_app

try:
    from.temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}

@pytest.fixture(scope='module', autouse=True)
def remove_test_folder():
    """This fixture ensures the destruction of the asreview
    test folder (which includes the database)"""
    yield
    shutil.rmtree(asreview_path())

@pytest.fixture(scope='function', autouse=True)
def setup_teardown_standard():
    """Standard setup and teardown, create the app and
    make sure the database is cleaned up after running
    each and every test"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)
    # create app and client
    app = create_app(enable_auth=True)
    # clean database
    with app.app_context():
        yield app
        DB.session.query(Project).delete()
        DB.session.query(User).delete()
        DB.session.commit()


def test_add_user_record():
    """Verify if I can add a user account"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0

    user = User('cskaandorp', 'Onyx')
    DB.session.add(user)
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    # verify we have added a record
    user = User.query.filter(User.username == 'cskaandorp').one()

def test_username_is_unique():
    """Verify we can not add two users with the same username"""
    user = User('cskaandorp', 'Onyx')
    DB.session.add(user)
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    user = User.query.filter(User.username == 'cskaandorp').one()

    new_user = User('cskaandorp', 'Onyx')
    DB.session.add(new_user)
    with pytest.raises(IntegrityError):
        DB.session.commit()

    DB.session.rollback()
    # verify we have 1 record
    assert len(User.query.all()) == 1

def test_if_user_has_projects_property():
    """Make sure a User object has access to his/her projects"""
    user = User('cskaandorp', 'Onyx')
    DB.session.add(user)
    DB.session.commit()
    user = User.query.filter(User.username == 'cskaandorp').one()
    # check if user points to empty list
    assert user.projects == []

def test_creating_a_project_without_user():
    """Create a project without a user must be impossible"""
    # verify no records in projects and users tables
    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 0

    # create project with a non-existent user
    project = Project(project_id='my-project')
    DB.session.add(project)
    with pytest.raises(IntegrityError):
        DB.session.commit()

    DB.session.rollback()
    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 0

def test_creating_a_project_with_user():
    """Create a project with a valid user"""
    user = User('cskaandorp', 'Onyx')
    DB.session.add(user)
    DB.session.commit()

    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 1

    user.projects.append(Project(project_id='my-project'))
    DB.session.commit()

    assert len(Project.query.all()) == 1
    assert len(User.query.all()) == 1

def test_updating_a_project():
    """Update a project, just see if it works and how it
    should be done. This is not a very valuable test."""
    user = User('cskaandorp', 'Onyx')
    user.projects.append(Project(project_id='my-project'))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 1
    assert len(User.query.all()) == 1

    new_project_id = 'my-other-project'
    Project. \
        query. \
        filter(Project.owner_id==user.id). \
        update({'project_id': new_project_id})
    DB.session.commit()

    # check if project_id has been changed
    project = Project.query.filter(Project.owner_id==user.id).one()
    assert project.project_id == new_project_id

def test_deleting_a_project_no_collaboration():
    """Delete a single project from a user. Again, not a valuable
    test, just seeing if it works and how it is done."""
    user = User('cskaandorp', 'Onyx')
    user.projects.append(Project(project_id='my-project'))
    user.projects.append(Project(project_id='my-other-project'))
    user.projects.append(Project(project_id='my-other-other-project'))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 3
    assert len(User.query.all()) == 1

    Project.query.filter(Project.project_id=='my-project').delete()
    DB.session.commit()
    assert len(Project.query.all()) == 2
    assert len(User.query.all()) == 1

    names = set([p.project_id for p in Project.query.all()])
    assert names == set(['my-other-project', 'my-other-other-project'])

def test_deleting_a_user_with_projections_no_collaboration():
    """When I destroy a user, all projects have to be destroyed"""
    user = User('cskaandorp', 'Onyx')
    user.projects.append(Project(project_id='my-project'))
    user.projects.append(Project(project_id='my-other-project'))
    user.projects.append(Project(project_id='my-other-other-project'))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 3
    assert len(User.query.all()) == 1

    User.query.filter(User.id==1).delete()
    DB.session.commit()
    assert len(User.query.all()) == 0

    print(Project.query.all())

    assert len(Project.query.all()) == 0









def test_deleting_a_user():
    pass

def test_deleting_a_project():
    pass










