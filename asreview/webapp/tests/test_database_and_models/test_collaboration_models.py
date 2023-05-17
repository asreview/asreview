import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp.authentication.models import Collaboration
from asreview.webapp.authentication.models import CollaborationInvitation
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User


@pytest.fixture(autouse=True)
def test_data(auth_app):
    user1, _ = crud.create_user1_with_2_projects(DB)
    user2 = crud.create_user(DB, user=2)
    user3 = crud.create_user(DB, user=3)
    assert len(Project.query.all()) == 2
    assert len(User.query.all()) == 3
    data = {
        'user1': user1,
        'user2': user2,
        'user3': user3
    }
    yield data
    crud.delete_users(DB)
    crud.delete_projects(DB)


class TestInvitations:
    """Testing invitations on database level."""

    # #############
    # CREATE
    # #############
    
    # test adding an invitation
    def test_adding_an_invitation(self, test_data):
        # get project
        project = test_data["user1"].projects[0]
        # invite user 2
        project.pending_invitations.append(test_data["user2"])
        DB.session.commit()
        assert len(CollaborationInvitation.query.all()) == 1

        # get fresh objects
        project = Project.query.filter_by(id=project.id).one()
        invite = CollaborationInvitation.query.one()
        # asserts Invitations
        assert invite.project_id == project.id
        assert invite.user_id == test_data["user2"].id


    # test uniqueness of invitations
    def test_uniqueness_of_invitations(self, test_data):
        assert True


class TestCollaborations:
    """Testing collaboration on database level."""

    # #############
    # CREATE
    # #############


    assert True