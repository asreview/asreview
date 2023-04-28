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
from sqlalchemy.exc import IntegrityError

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Collaboration
from asreview.webapp.authentication.models import CollaborationInvitation
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
from asreview.webapp.start_flask import create_app

try:
    from .temp_env_var import TMP_ENV_VARS
except ImportError:
    TMP_ENV_VARS = {}


@pytest.fixture(scope="module", autouse=True)
def remove_test_folder():
    """This fixture ensures the destruction of the asreview
    test folder (which includes the database)"""
    yield
    shutil.rmtree(asreview_path())


@pytest.fixture(scope="function", autouse=True)
def setup_teardown_standard():
    """Standard setup and teardown, create the app and
    make sure the database is cleaned up after running
    each and every test"""
    # setup environment variables
    os.environ.update(TMP_ENV_VARS)

    root_dir = str(Path(os.path.abspath(__file__)).parent)
    config_file_path = f"{root_dir}/configs/auth_config.json"
    # create app and client
    app = create_app(enable_auth=True, flask_configfile=config_file_path)
    # clean database
    with app.app_context():
        yield app
        DB.session.query(Project).delete()
        DB.session.query(User).delete()
        DB.session.query(Collaboration).delete()
        DB.session.query(CollaborationInvitation).delete()
        DB.session.commit()


TEST_USER_IDENTIFIER = "c.s.kaandorp@uu.nl"


def create_test_user():
    return User(
        TEST_USER_IDENTIFIER,
        email=TEST_USER_IDENTIFIER,
        name="Casper Kaandorp",
        password="Onyx123!",
    )


def create_team_user(name):
    email = f"{name}@test.nl"
    return User(email, email=email, name=name, password="Onyx123!")


def test_add_user_record():
    """Verify if I can add a user account"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0

    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    # verify we have added a record
    user = User.query.filter(User.identifier == TEST_USER_IDENTIFIER).one()


def test_email_is_unique():
    """Verify we can not add two users with the same email"""
    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    user = User.query.filter(User.identifier == TEST_USER_IDENTIFIER).one()

    new_user = create_test_user()
    DB.session.add(new_user)
    with pytest.raises(IntegrityError):
        DB.session.commit()

    DB.session.rollback()
    # verify we have 1 record
    assert len(User.query.all()) == 1


def test_if_user_has_projects_property():
    """Make sure a User object has access to his/her projects"""
    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()
    user = User.query.filter(User.identifier == TEST_USER_IDENTIFIER).one()
    # check if user points to empty list
    assert user.projects == []


def test_creating_a_project_without_user():
    """Create a project without a user must be impossible"""
    # verify no records in projects and users tables
    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 0

    # create project with a non-existent user
    project = Project(project_id="my-project")
    DB.session.add(project)
    with pytest.raises(IntegrityError):
        DB.session.commit()

    DB.session.rollback()
    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 0


def test_creating_a_project_with_user():
    """Create a project with a valid user"""
    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()

    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 1

    user.projects.append(Project(project_id="my-project"))
    DB.session.commit()

    assert len(Project.query.all()) == 1
    assert len(User.query.all()) == 1


def test_uniqueness_of_project_id():
    """Create a project with a valid user"""
    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 0
    assert len(User.query.all()) == 1

    user.projects.append(Project(project_id="my-project"))
    DB.session.commit()
    assert len(Project.query.all()) == 1

    # add project with same id
    user.projects.append(Project(project_id="my-project"))
    with pytest.raises(IntegrityError):
        DB.session.commit()

    DB.session.rollback()
    assert len(Project.query.all()) == 1
    assert len(User.query.all()) == 1


def test_project_path_and_folder():
    """Test full path of project and project folder"""
    user = create_test_user()
    DB.session.add(user)
    DB.session.commit()

    id = "my-project"
    user.projects.append(Project(project_id=id))
    DB.session.commit()
    assert len(Project.query.all()) == 1
    assert user.projects[0].project_path == Path(asreview_path(), id)
    assert user.projects[0].folder == id


def test_updating_a_project():
    """Update a project, just see if it works and how it
    should be done. This is not a very valuable test."""
    user = create_test_user()
    user.projects.append(Project(project_id="my-project"))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 1
    assert len(User.query.all()) == 1

    new_project_id = "my-other-project"
    Project.query.filter(Project.owner_id == user.id).update(
        {"project_id": new_project_id}
    )
    DB.session.commit()

    # check if project_id has been changed
    project = Project.query.filter(Project.owner_id == user.id).one()
    assert project.project_id == new_project_id


def test_deleting_a_project_no_collaboration():
    """Delete a single project from a user. Again, not a valuable
    test, just seeing if it works and how it is done."""
    user = create_test_user()
    user.projects.append(Project(project_id="my-project"))
    user.projects.append(Project(project_id="my-other-project"))
    user.projects.append(Project(project_id="my-other-other-project"))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 3
    assert len(User.query.all()) == 1

    Project.query.filter(Project.project_id == "my-project").delete()
    DB.session.commit()
    assert len(Project.query.all()) == 2
    assert len(User.query.all()) == 1

    names = set([p.project_id for p in Project.query.all()])
    assert names == set(["my-other-project", "my-other-other-project"])


def test_deleting_a_user_with_projections_no_collaboration():
    """When I destroy a user, all projects have to be destroyed"""
    user = create_test_user()
    user.projects.append(Project(project_id="my-project"))
    user.projects.append(Project(project_id="my-other-project"))
    user.projects.append(Project(project_id="my-other-other-project"))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 3
    assert len(User.query.all()) == 1

    DB.session.delete(user)
    DB.session.commit()
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0


def test_deleting_a_project():
    """Destroy a project of a user, no rocket science here"""
    user = create_test_user()
    user.projects.append(Project(project_id="my-project"))
    user.projects.append(Project(project_id="my-other-project"))
    user.projects.append(Project(project_id="my-other-other-project"))
    DB.session.add(user)
    DB.session.commit()
    assert len(Project.query.all()) == 3
    assert len(User.query.all()) == 1

    project = Project.query.filter(Project.project_id == "my-project").one()
    DB.session.delete(project)
    DB.session.commit()
    assert len(Project.query.all()) == 2
    assert len(User.query.all()) == 1


def test_add_collaboration():
    """Verify if I can add a collaborator's user account to a project"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 3
    assert len(Project.query.all()) == 1

    # Now I want to add coll as a collaborator
    project = owner.projects[0]
    # assert there are no collaborators
    assert len(project.collaborators) == 0
    project.collaborators.append(coll1)
    project.collaborators.append(coll2)
    DB.session.commit()

    # assert there are collaborators
    assert len(project.collaborators) == 2
    assert coll1 in owner.projects[0].collaborators
    assert coll2 in owner.projects[0].collaborators


def test_list_projects_in_which_i_am_collaborating():
    """Verify I can list projects in which a user is collaborating"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0

    owner = create_test_user()
    coll1 = create_team_user("collabo1")

    owner.projects.append(Project(project_id="my-project"))
    coll1.projects.append(Project(project_id="other-project"))
    DB.session.add_all([owner, coll1])
    DB.session.commit()

    # verify we have 2 users and 2 projects
    assert len(User.query.all()) == 2
    assert len(Project.query.all()) == 2

    # add coll1 to my-project
    project = owner.projects[-1]
    project.collaborators.append(coll1)
    DB.session.commit()

    # check if coll1 can reach this project
    assert coll1.involved_in == [project]
    assert coll1.involved_in[0].project_id == "my-project"
    assert coll1.projects[0].project_id == "other-project"


def test_removing_a_collaborator():
    """Verify if I can remove a collaborator from a project"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0

    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 3
    assert len(Project.query.all()) == 1

    # assert there are no collaborators
    project = owner.projects[-1]
    assert len(project.collaborators) == 0
    # add collaborators
    project.collaborators.append(coll1)
    project.collaborators.append(coll2)
    DB.session.commit()

    # assert there are 2 collaborators
    assert len(project.collaborators) == 2

    # remove collaborator 2
    owner.projects[0].collaborators.remove(coll2)
    DB.session.commit()

    # assert one collaborator is gone
    assert len(project.collaborators) == 1
    # and the remaining collaborators is still there
    assert project.collaborators == [coll1]


def test_removing_project_removes_collaborations():
    """If a project is destroyed, all collaborator links should be removed"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0

    # create project and add collaborators
    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    owner.projects[-1].collaborators = [coll1, coll2]
    DB.session.commit()

    # assert we have to 2 collaborations
    assert len(owner.projects[-1].collaborators) == 2

    # now remove the project
    DB.session.delete(owner.projects[-1])

    # assert we still have 3 users
    assert len(User.query.all()) == 3
    # and no collaborations
    assert len(Collaboration.query.all()) == 0


def test_removing_project_removes_invites():
    """If a project is destroyed, all invitations links should be removed"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0

    # create project and add collaborators
    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    owner.projects[-1].pending_invitations = [coll1, coll2]
    DB.session.commit()

    # assert we have to 2 collaborations
    assert len(owner.projects[-1].pending_invitations) == 2

    # now remove the project
    DB.session.delete(owner.projects[-1])

    # assert we still have 3 users
    assert len(User.query.all()) == 3
    # and no collaborations
    assert len(CollaborationInvitation.query.all()) == 0


#######################
# COLLABO invitations #
#######################


def test_add_collaboration_invite():
    """Verify if I can add a collaboration invite user account to a project"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    DB.session.commit()

    assert len(User.query.all()) == 3
    assert len(Project.query.all()) == 1

    # Now I want to add coll as a collaborator
    project = owner.projects[0]
    # assert there are no collaborators
    assert len(project.collaborators) == 0
    project.pending_invitations.append(coll1)
    project.pending_invitations.append(coll2)
    DB.session.commit()

    # assert there are collaborators
    assert len(project.pending_invitations) == 2
    assert coll1 in owner.projects[0].pending_invitations
    assert coll2 in owner.projects[0].pending_invitations


def test_list_projects_in_which_i_am_invited():
    """Verify I can list projects in which a user is invited for"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0
    assert len(CollaborationInvitation.query.all()) == 0

    owner = create_test_user()
    coll1 = create_team_user("collabo1")

    owner.projects.append(Project(project_id="my-project"))
    coll1.projects.append(Project(project_id="other-project"))
    DB.session.add_all([owner, coll1])
    DB.session.commit()

    # verify we have 2 users and 2 projects
    assert len(User.query.all()) == 2
    assert len(Project.query.all()) == 2

    # invite coll1 to my-project
    project = owner.projects[-1]
    project.pending_invitations.append(coll1)
    DB.session.commit()

    # check if coll1 can reach this project
    assert coll1.pending_invitations == [project]
    assert coll1.pending_invitations[0].project_id == "my-project"
    assert coll1.projects[0].project_id == "other-project"


def test_removing_an_invitation():
    """Verify if I can remove an invitation from a project"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0
    assert len(CollaborationInvitation.query.all()) == 0

    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    DB.session.commit()

    # verify we have project 1 record
    assert len(User.query.all()) == 3
    assert len(Project.query.all()) == 1

    # assert there are no collaborators
    project = owner.projects[-1]
    assert len(project.pending_invitations) == 0
    # add collaborators
    project.pending_invitations.append(coll1)
    project.pending_invitations.append(coll2)
    DB.session.commit()

    # assert there are 2 collaborators
    assert len(project.pending_invitations) == 2

    # remove collaborator 2
    owner.projects[0].pending_invitations.remove(coll2)
    DB.session.commit()

    # assert one collaborator is gone
    assert len(project.pending_invitations) == 1
    # and the remaining collaborators is still there
    assert project.pending_invitations == [coll1]


def test_removing_project_removes_invitations():
    """If a project is destroyed, all invitations should be removed"""
    # verify we start with a clean database
    assert len(User.query.all()) == 0
    assert len(Project.query.all()) == 0
    assert len(Collaboration.query.all()) == 0
    assert len(CollaborationInvitation.query.all()) == 0

    # create project and add collaborators
    owner = create_test_user()
    coll1 = create_team_user("collabo1")
    coll2 = create_team_user("collabo2")
    owner.projects.append(Project(project_id="my-project"))
    DB.session.add_all([owner, coll1, coll2])
    owner.projects[-1].pending_invitations = [coll1, coll2]
    DB.session.commit()

    # assert we have to 2 collaborations
    assert len(owner.projects[-1].pending_invitations) == 2

    # now remove the project
    DB.session.delete(owner.projects[-1])

    # assert we still have 3 users
    assert len(User.query.all()) == 3
    # and no collaborations
    assert len(CollaborationInvitation.query.all()) == 0
