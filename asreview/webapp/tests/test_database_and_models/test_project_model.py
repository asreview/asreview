from pathlib import Path

import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.crud as crud
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User


# fixture that creates a user and makes sure there
# are no projects
@pytest.fixture(autouse=True)
def user(auth_app):
    assert len(Project.query.all()) == 0
    user = crud.create_user(DB, 1)
    assert len(User.query.all()) == 1
    yield user
    crud.delete_users(DB)
    crud.delete_projects(DB)


# NOTE: projects are created from a user account

# #############
# CREATE
# #############

# test uniqueness of project id
def test_uniqueness_of_project_id(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert len(Project.query.all()) == 1
    with pytest.raises(IntegrityError):
        crud.create_project(DB, user, Project(project_id=project_id))


# insert a project successfully
def test_inserting_project(user):
    project_id = "my-project"
    project = Project(project_id=project_id)
    crud.create_project(DB, user, project)
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    assert project.project_id == project_id
    assert project.owner_id == user.id


# #############
# DELETE
# #############

# deleting a project won't delete its owner
def test_not_delete_user_after_deletion_project(user):
    crud.create_project(DB, user, Project(project_id="project"))
    assert len(User.query.all()) == 1
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    # delete
    DB.session.delete(project)
    DB.session.commit()
    assert len(User.query.all()) == 1
    assert len(Project.query.all()) == 0


# deleting a project will remove invitations
def test_project_removal_invitaions():
    assert False


# deleting a project will remove collaboration links
def test_project_removal_collaborations():
    assert False


# #############
# PROPERTIES
# #############

# test getting a user from project
def test_getting_user_from_project(user):
    project_id = "my-project"
    project = Project(project_id=project_id)
    crud.create_project(DB, user, project)
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    assert project.owner == user


# test project_folder
def test_project_folder(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    assert project.folder == project_id


# test project_path
def test_project_path(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    assert project.project_path == Path(asreview_path() / project_id)


# test pending invites
def test_pending_invites(user):
    project = crud.create_project(DB, user, Project(project_id="my-project"))
    user2 = crud.create_user(DB, user=2)
    assert len(User.query.all()) == 2
    assert len(Project.query.all()) == 1
    # invite
    project.pending_invitations.append(user2)
    DB.session.commit()
    # fresh object
    project = Project.query.filter_by(project_id=project.project_id).one()
    # asserts
    assert user2 in project.pending_invitations
