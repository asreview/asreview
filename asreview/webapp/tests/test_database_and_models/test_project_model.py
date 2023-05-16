from pathlib import Path

import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.crud as crud
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User


@pytest.fixture(autouse=True)
def user(auth_app):
    assert len(Project.query.all()) == 0
    user = crud.create_user(DB, 1)
    assert len(User.query.all()) == 1
    yield user
    crud.delete_users(DB)
    crud.delete_projects(DB)


# NOTE: projects are created from a user account

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


# test getting a user from project
def test_getting_user_from_project(user):
    project_id = "my-project"
    project = Project(project_id=project_id)
    crud.create_project(DB, user, project)
    assert len(Project.query.all()) == 1
    # get project
    project = Project.query.one()
    assert project.owner == user


# test uniqueness of project id
def test_uniqueness_of_project_id(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert len(Project.query.all()) == 1
    with pytest.raises(IntegrityError):
        crud.create_project(DB, user, Project(project_id=project_id))


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
