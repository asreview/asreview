from datetime import datetime as dt
from datetime import timedelta

import pytest
from sqlalchemy.exc import IntegrityError

import asreview.webapp.tests.utils.config_parser as cp
import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp._authentication.models import User
from asreview.webapp._authentication.models import VALID_ROLES

# #############
# CREATE
# #############


# test identifier validation
def test_user_must_have_identifier(setup_teardown):
    user = crud.create_user(DB)
    with pytest.raises(ValueError):
        user.identifier = None

    with pytest.raises(ValueError):
        user.identifier = ""


# test uniqueness of identifier
def test_uniqueness_of_identifier(setup_teardown):
    user1 = crud.create_user(DB)
    assert crud.count_users() == 1
    # create second user with identical identifier
    user2 = cp.get_user(2)
    # set to an existing identifier
    user2.identifier = user1.identifier
    with pytest.raises(IntegrityError):
        crud.create_user(DB, user2)


# test origin validation
def test_user_must_have_origin(setup_teardown):
    user = crud.create_user(DB)
    with pytest.raises(ValueError):
        user.origin = None

    with pytest.raises(ValueError):
        user.origin = ""


# test name validation
def test_user_must_have_name(setup_teardown):
    user = crud.create_user(DB)
    with pytest.raises(ValueError, match="Name is required"):
        user.name = None

    with pytest.raises(ValueError, match="Name is required"):
        user.name = ""

    with pytest.raises(ValueError, match="Name must contain more than 2 characters"):
        user.name = "a"

    with pytest.raises(ValueError, match="Name must contain more than 2 characters"):
        user.name = "ab"


# test if email can not be blank if origin is "asreview"
def test_email_validation_1(setup_teardown):
    with pytest.raises(ValueError, match="Email is required when origin is 'asreview'"):
        User(
            identifier="identifier_1",
            email=None,
            name="Test User",
            origin="asreview",
            password="ABCd1234!",
        )


# test if email can not be empty if origin is "asreview"
def test_email_validation_2(setup_teardown):
    with pytest.raises(ValueError, match="Email is required when origin is 'asreview'"):
        User(
            identifier="identifier_1",
            email="",
            name="Test User",
            origin="asreview",
            password="ABCd1234!",
        )


# test if all fails when email is invalid
def test_email_validation_3(setup_teardown):
    invalid_email = "invalid"

    with pytest.raises(
        ValueError, match=f"Email address '{invalid_email}' is not valid"
    ):
        User(
            identifier="identifier_1",
            email=invalid_email,
            name="Test User",
            origin="asreview",
            password="ABCd1234!",
        )


# test uniqueness of email when origin is asreview
def test_uniqueness_of_email(setup_teardown):
    user1 = crud.create_user(DB)
    assert user1.origin == "asreview"
    assert crud.count_users() == 1
    # create second user with identical email
    user2 = cp.get_user(2)
    assert user2.origin == "asreview"
    # set to an existing identifier
    user2.email = user1.email
    with pytest.raises(IntegrityError):
        crud.create_user(DB, user2)


# test that a single externally created account can miss an
# email address
def test_ext_single_account_creation_no_email(setup_teardown):
    assert crud.count_users() == 0
    user1 = User(
        identifier="identifier_1",
        email=None,
        name="Test User",
        origin="orcid",
        password=None,
    )
    crud.create_user(DB, user1)
    assert crud.count_users() == 1


# verify we can have multiple accounts having no email,
# but with unique identifiers
def test_ext_multiple_account_creation_no_email(setup_teardown):
    assert crud.count_users() == 0
    user1 = User(
        identifier="identifier_1",
        email=None,
        name="Test User",
        origin="orcid",
        password=None,
    )
    crud.create_user(DB, user1)
    assert crud.count_users() == 1
    user2 = User(
        identifier="identifier_2",
        email=None,
        name="Test User",
        origin="orcid",
        password=None,
    )
    crud.create_user(DB, user2)
    assert crud.count_users() == 2


# verify that identifiers must be unique for externally
# created accounts
def test_ext_multiple_account_no_email_same_identifiers(setup_teardown):
    assert crud.count_users() == 0
    user1 = User(
        identifier="identifier_1",
        email=None,
        name="Test User",
        origin="orcid",
        password=None,
    )
    crud.create_user(DB, user1)
    assert crud.count_users() == 1
    user2 = User(
        identifier="identifier_1",
        email=None,
        name="Test User",
        origin="orcid",
        password=None,
    )
    with pytest.raises(IntegrityError):
        crud.create_user(DB, user2)


# test if all fails when password doesn't meet requirements
@pytest.mark.parametrize(
    "password", ["", None, "a1!", "aaaaaaaaaaaaa", "1111111111111"]
)
def test_password_validation(setup_teardown, password):
    with pytest.raises(
        ValueError, match=f'Password "{str(password)}" does not meet requirements'
    ):
        User(
            "admin@asreview.nl",
            email="admin@asreview.nl",
            name="Casper",
            origin="asreview",
            password=password,
        )


# Verify we can add a user record
def test_add_user_record(setup_teardown):
    user = crud.create_user(DB)
    # verify we have 1 record
    assert crud.count_users() == 1
    assert crud.last_user() == user


# Test default role
def test_default_role(setup_teardown):
    user = crud.create_user(DB)
    assert user.role == "member"


# #############
# UPDATE
# #############


# Verify we can update a user record
def test_update_user_record(setup_teardown):
    user = cp.get_user(1)
    db_user = crud.create_user(DB, user)
    old_hashed_password = db_user.hashed_password

    new_email = "new_email@asreview.nl"
    new_name = "New Name"
    new_affiliation = "New Affiliation"
    new_password = "NewPassword@123"
    new_public = False

    user.update_profile(
        email=new_email,
        name=new_name,
        affiliation=new_affiliation,
        old_password=user.password,
        new_password=new_password,
        public=new_public,
    )
    DB.session.commit()

    # verify we have 1 record
    assert crud.count_users() == 1
    updated_user = crud.last_user()
    # assert identifier remained the same
    assert updated_user.identifier != new_email
    # assert changes
    assert updated_user.email == new_email
    assert updated_user.affiliation == new_affiliation
    assert updated_user.hashed_password != old_hashed_password
    assert updated_user.public == new_public


# verify reset password
def test_update_password(setup_teardown):
    user = crud.create_user(DB)
    old_hashed_password = user.hashed_password

    new_password = "NewPassword@123"
    user.reset_password(new_password)
    DB.session.commit()

    # verify we have 1 record
    assert crud.count_users() == 1
    updated_user = crud.last_user()
    assert updated_user.hashed_password != old_hashed_password


# verify setting token and salt
def test_set_token(setup_teardown):
    user = crud.create_user(DB)

    assert user.token is None
    assert user.token_created_at is None

    user.set_token()
    DB.session.commit()

    # verify we have 1 record
    assert crud.count_users() == 1
    updated_user = crud.last_user()

    assert updated_user.token is not None
    assert updated_user.token_created_at is not None
    assert isinstance(updated_user.token_created_at, dt)


# verify token validity, by default token is valid for 20 minutes
@pytest.mark.parametrize(
    "subtract_time", [(0, 0, True), (0, 19, True), (0, 21, False), (1, 0, False)]
)
def test_token_validity(setup_teardown, subtract_time):
    #
    subtract_hours, subtract_mins, validity = subtract_time
    user = crud.create_user(DB)
    user.set_token()
    DB.session.commit()
    # verify we have 1 record
    assert crud.count_users() == 1

    # assert token is valid
    token = user.token
    token_created_at = user.token_created_at
    assert user.token_valid(token)

    # now subtract hours
    new_token_created_time = token_created_at - timedelta(
        hours=subtract_hours, minutes=subtract_mins
    )
    # update token_created_at
    user.token_created_at = new_token_created_time

    # assert token validity
    assert user.token_valid(token) == validity


# test confirming a user
def test_confirm_user(setup_teardown):
    user = crud.create_user(DB)
    # create a token for good measures
    user.set_token()

    assert user.confirmed is False
    assert bool(user.token)
    assert bool(user.token_created_at)

    # now lets confirm
    user.confirm_user()

    assert user.confirmed
    assert user.token is None
    assert user.token_created_at is None


# #############
# DELETE
# #############


# test deleting a user means deleting all projects
def test_deleting_user(setup_teardown):
    user, projects = crud.create_user1_with_2_projects(DB)
    assert crud.count_users() == 1
    assert crud.count_projects() == 2
    # remove the user
    DB.session.delete(user)
    DB.session.commit()
    assert crud.count_users() == 0
    # projects should be gone as well
    assert crud.count_projects() == 0


# #############
# PROPERTIES
# #############


# test projects
def test_projects_of_user(setup_teardown):
    crud.create_user1_with_2_projects(DB)
    assert crud.count_users() == 1
    assert crud.count_projects() == 2
    # get user
    user = crud.last_user()
    projects = crud.list_projects()
    assert set(user.projects) == set(projects)


# test pending invitations
def test_pending_invitations(setup_teardown):
    user1, _ = crud.create_user1_with_2_projects(DB)
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 2
    user1 = crud.get_user_by_id(user1.id)
    project = user1.projects[0]
    project.pending_invitations.append(user2)
    DB.session.commit()
    # fresh object
    user2 = crud.get_user_by_id(user2.id)
    assert project in user2.pending_invitations


# test collaborations
def test_collaboration(setup_teardown):
    user1, _ = crud.create_user1_with_2_projects(DB)
    user2 = crud.create_user(DB, user=2)
    assert crud.count_users() == 2
    assert crud.count_projects() == 2
    user1 = crud.get_user_by_id(user1.id)
    project = user1.projects[0]
    project.collaborators.append(user2)
    DB.session.commit()
    # fresh object
    user2 = crud.get_user_by_id(user2.id)
    assert project in user2.involved_in


# test setting admin role
def test_set_admin_role(setup_teardown):
    user = crud.create_user(DB)
    user.role = "admin"
    assert user.role == "admin"


# test setting unknown role
def test_set_unknown_role(setup_teardown):
    role = "unknown"
    assert role not in VALID_ROLES
    user = crud.create_user(DB)
    with pytest.raises(ValueError):
        user.role = role


# test is_member
def test_is_member(setup_teardown):
    user = crud.create_user(DB)
    assert user.is_member


# test is_admin
def test_is_admin(setup_teardown):
    user = crud.create_user(DB)
    user.role = "admin"
    assert user.is_admin
