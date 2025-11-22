from inspect import getfullargspec

import pytest

import asreview.webapp.tests.utils.api_utils as au

# NOTE: Team collaboration tests have been removed during the refactoring
# of the invitation system. Tests will be re-added when the new link-based
# invitation system is implemented.

# The following test functions were removed:
# - test_user1_sends_invitation
# - test_user2_list_invitations
# - test_user2_accept_invitation
# - test_user2_rejects_invitation
# - test_owner_deletes_invitation
# - test_view_collaboration_team_with_pending_invitation
# - test_view_collaboration_team_with_accepted_invitation
# - test_owner_deletes_collaboration
# - test_collaborator_withdrawal
# - test_login_required (parameterized tests)
# - test_user3_cant_see_other_invites
# - test_user3_cant_reject_invite_of_user_2
# - test_user3_cant_accept_invite_of_user_2
# - test_user3_cant_delete_invitation
# - test_user3_cant_see_collaboration_team
# - test_user3_cant_delete_collaboration
# - test_admin_can_delete_invitation
# - test_admin_can_delete_collaboration
# - test_admin_can_invite_to_any_project
# - test_non_admin_cannot_invite_to_others_project
# - test_admin_invite_validation

# TODO: Add new tests for link-based invitation system
