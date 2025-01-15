import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp._authentication.models import Collaboration
from asreview.webapp._authentication.models import CollaborationInvitation


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

        assert crud.count_invitations() == 1
        # get fresh object
        invite = crud.last_invitation()
        # asserts Invitations
        assert invite.project_id == project.id
        assert invite.user_id == test_data["user2"].id

    # test uniqueness of invitations
    def test_uniqueness_of_invitations(self, test_data):
        user1 = test_data["user1"]
        user2 = test_data["user2"]
        project = user1.projects[0]
        crud.create_invitation(DB, project, user2)
        assert crud.count_invitations() == 1

        # create identical invitation
        with pytest.raises(IntegrityError):
            crud.create_invitation(DB, project, user2)
        # if all is well, we can't add the same invitation
        assert crud.count_invitations() == 1

    # test missing user is not permitted
    def test_missing_user_in_invitation(self, test_data):
        project = test_data["user1"].projects[0]
        invite = CollaborationInvitation(project_id=project.id, user_id=None)
        DB.session.add(invite)
        with pytest.raises(IntegrityError):
            DB.session.commit()
        DB.session.rollback()
        assert crud.count_invitations() == 0

    # test missing project is not permitted
    def test_missing_project_in_invitation(self, test_data):
        user = test_data["user1"]
        invite = CollaborationInvitation(project_id=None, user_id=user.id)
        DB.session.add(invite)
        with pytest.raises(IntegrityError):
            DB.session.commit()
        DB.session.rollback()
        assert crud.count_invitations() == 0


class TestCollaborations:
    """Testing collaboration on database level."""

    # #############
    # CREATE
    # #############

    # test adding a collaboration
    def test_create_collaboration(self, test_data):
        # get project
        project = test_data["user1"].projects[0]
        # collaboration user 2
        project.collaborators.append(test_data["user2"])
        DB.session.commit()
        assert crud.count_collaborations() == 1
        # get fresh objects
        collab = crud.last_collaboration()
        # asserts collaboration
        assert collab.project_id == project.id
        assert collab.user_id == test_data["user2"].id

    # test uniqueness of collaboration
    def test_uniqueness_of_collaboration(self, test_data):
        user1 = test_data["user1"]
        user2 = test_data["user2"]
        project = user1.projects[0]
        crud.create_collaboration(DB, project, user2)
        assert crud.count_collaborations() == 1

        # create identical invitation
        with pytest.raises(IntegrityError):
            crud.create_collaboration(DB, project, user2)
        # if all is well, we can't add the same invitation
        assert crud.count_collaborations() == 1

    # test missing user is not permitted
    def test_missing_user_in_collaboration(self, test_data):
        project = test_data["user1"].projects[0]
        invite = Collaboration(project_id=project.id, user_id=None)
        DB.session.add(invite)
        with pytest.raises(IntegrityError):
            DB.session.commit()
        DB.session.rollback()
        assert crud.count_collaborations() == 0

    # test missing project is not permitted
    def test_missing_project_in_collaboration(self, test_data):
        user = test_data["user1"]
        invite = Collaboration(project_id=None, user_id=user.id)
        DB.session.add(invite)
        with pytest.raises(IntegrityError):
            DB.session.commit()
        DB.session.rollback()
        assert crud.count_collaborations() == 0
