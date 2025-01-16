from pathlib import Path

import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp._authentication.models import Project
from asreview.webapp.utils import asreview_path

# NOTE: projects are created from a user account

# #############
# CREATE
# #############


# test uniqueness of project id
def test_uniqueness_of_project_id(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert crud.count_projects() == 1
    with pytest.raises(IntegrityError):
        crud.create_project(DB, user, Project(project_id=project_id))


# insert a project successfully
def test_inserting_project(user):
    project_id = "my-project"
    project = Project(project_id=project_id)
    crud.create_project(DB, user, project)
    assert crud.count_projects() == 1
    # get project
    project = crud.last_project()
    assert project.project_id == project_id
    assert project.owner_id == user.id


# #############
# DELETE
# #############


# deleting a project won't delete its owner
def test_not_delete_user_after_deletion_project(user):
    crud.create_project(DB, user, Project(project_id="project"))
    assert crud.count_users() == 1
    assert crud.count_projects() == 1
    # get project
    project = crud.last_project()
    # delete
    DB.session.delete(project)
    DB.session.commit()
    assert crud.count_users() == 1
    assert crud.count_projects() == 0


# deleting a project will remove invitations
def test_project_removal_invitations(user):
    project = crud.create_project(DB, user, Project(project_id="my-project"))
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 1
    assert crud.count_invitations() == 0
    # invite
    project.pending_invitations.append(user2)
    DB.session.commit()
    assert crud.count_invitations() == 1
    DB.session.delete(project)
    DB.session.commit()
    assert crud.count_projects() == 0
    assert crud.count_invitations() == 0


# deleting a project will remove collaboration links
def test_project_removal_collaborations(user):
    project = crud.create_project(DB, user, Project(project_id="my-project"))
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 1
    assert crud.count_collaborations() == 0
    # invite
    project.collaborators.append(user2)
    DB.session.commit()
    assert crud.count_collaborations() == 1
    DB.session.delete(project)
    DB.session.commit()
    assert crud.count_projects() == 0
    assert crud.count_collaborations() == 0


# #############
# PROPERTIES
# #############


# test getting a user from project
def test_getting_user_from_project(user):
    project_id = "my-project"
    project = Project(project_id=project_id)
    crud.create_project(DB, user, project)
    assert crud.count_projects() == 1
    # get project
    project = crud.last_project()
    assert project.owner == user


# test project_folder
def test_project_folder(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert crud.count_projects() == 1
    # get project
    project = crud.last_project()
    assert project.folder == project_id


# test project_path
def test_project_path(user):
    project_id = "my-project"
    crud.create_project(DB, user, Project(project_id=project_id))
    assert crud.count_projects() == 1
    # get project
    project = crud.last_project()
    assert project.project_path == Path(asreview_path() / project_id)


# test pending invites
def test_pending_invites(user):
    project = crud.create_project(DB, user, Project(project_id="my-project"))
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 1
    # invite
    project.pending_invitations.append(user2)
    DB.session.commit()
    # fresh object
    project = crud.last_project()
    # asserts
    assert user2 in project.pending_invitations


# test collaboration
def test_collaboration(user):
    project = crud.create_project(DB, user, Project(project_id="my-project"))
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 1
    assert crud.count_collaborations() == 0
    # invite
    project.collaborators.append(user2)
    DB.session.commit()
    assert crud.count_collaborations() == 1
    # start with a fresh object
    project = crud.last_project()
    assert user2 in project.collaborators
