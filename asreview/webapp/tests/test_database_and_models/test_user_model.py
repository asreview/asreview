from datetime import datetime as dt
from datetime import timedelta

import pytest

import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB
from asreview.webapp.authentication.models import User


@pytest.fixture(autouse=True)
def setup_teardown(auth_app):
    assert len(User.query.all()) == 0
    yield
    crud.delete_users(DB)



# test identifier validation
def test_user_must_have_identifier():
    user = crud.create_user(DB)
    with pytest.raises(ValueError):
        user.identifier = None

    with pytest.raises(ValueError):
        user.identifier = ""


# test origin validation
def test_user_must_have_origin():
    user = crud.create_user(DB)
    with pytest.raises(ValueError):
        user.origin = None

    with pytest.raises(ValueError):
        user.origin = ""


# test name validation
def test_user_must_have_name():
    user = crud.create_user(DB)
    with pytest.raises(ValueError, match="Name is required"):
        user.name = None

    with pytest.raises(ValueError, match="Name is required"):
        user.name = ""

    with pytest.raises(
        ValueError,
        match="Name must contain more than 2 characters"
    ):
        user.name = "a"

    with pytest.raises(
        ValueError,
        match="Name must contain more than 2 characters"
    ):
        user.name = "ab"


# test if email is not blank if origin is "asreview"
def test_email_validation_1():
    user = crud.create_user(DB)
    user.origin = "asreview"
    with pytest.raises(
        ValueError,
        match="Email is required when origin is 'asreview'"
    ):
        user.email = None

    with pytest.raises(
        ValueError,
        match="Email is required when origin is 'asreview'"
    ):
        user.email = ""


# test if all fails when email is invalid
def test_email_validation_2():
    user_data = crud.create_user(DB)
    invalid_email = "invalid"

    with pytest.raises(
        ValueError,
        match=f"Email address '{invalid_email}' is not valid"
    ):
        User(
            invalid_email,
            email=invalid_email,
            name=user_data.name,
            origin="asreview",
            password="ABCd1234!"
        )


# test if all fails when password doesn't meet requirements
@pytest.mark.parametrize(
    "password",
    ["", None, "a1!", "aaaaaaaaaaaaa", "1111111111111"]
)
def test_password_validation(password):
    with pytest.raises(
        ValueError,
        match=f"Password \"{str(password)}\" does not meet requirements"
    ):
        User(
            "admin@asreview.nl",
            email="admin@asreview.nl",
            name="Casper",
            origin="asreview",
            password=password
        )


# Verify we can add a user record
def test_add_user_record():
    user = crud.create_user(DB)

    # verify we have 1 record
    assert len(User.query.all()) == 1
    assert User.query.one() == user


# Verify we can update a user record
def test_update_user_record():
    user = crud.create_user(DB)
    old_hashed_password = user.hashed_password

    new_email = "new_email@asreview.nl"
    new_name = "New Name"
    new_affiliation = "New Affiliation"
    new_password = "NewPassword@123"
    new_public = False

    user.update_profile(
        email=new_email,
        name=new_name,
        affiliation=new_affiliation,
        password=new_password,
        public=new_public
    )
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    updated_user = User.query.one()
    # assert identifier remained the same
    assert updated_user.identifier != new_email
    # assert changes
    assert updated_user.email == new_email
    assert updated_user.affiliation == new_affiliation
    assert updated_user.hashed_password != old_hashed_password
    assert updated_user.public == new_public

    
# verify reset password
def test_update_password():
    user = crud.create_user(DB)
    old_hashed_password = user.hashed_password

    new_password = "NewPassword@123"
    user.reset_password(new_password)
    DB.session.commit()

     # verify we have 1 record
    assert len(User.query.all()) == 1
    updated_user = User.query.one()
    assert updated_user.hashed_password != old_hashed_password


# verify setting token and salt
def test_set_token():
    user = crud.create_user(DB)

    assert user.token == None
    assert user.token_created_at == None

    user.set_token_data("secret", "salt")
    DB.session.commit()

     # verify we have 1 record
    assert len(User.query.all()) == 1
    updated_user = User.query.one()

    assert updated_user.token != None
    assert updated_user.token_created_at != None
    assert type(updated_user.token_created_at) == dt


# verify token validity, by default token is 24 hours valid
@pytest.mark.parametrize(
    'subtract_time',
    [(10, 0, True), (23, 59, True), (24, 1, False), (25, 0, False)]
)
def test_token_validity(subtract_time):
    subtract_hours, subtract_mins, validity = subtract_time
    user = crud.create_user(DB)
    user.set_token_data("secret", "salt")
    DB.session.commit()
    # verify we have 1 record
    assert len(User.query.all()) == 1

    # assert token is valid
    token = user.token
    token_created_at = user.token_created_at
    assert user.token_valid(token)

    # now subtract hours
    new_token_created_time = token_created_at - \
        timedelta(hours=subtract_hours, minutes=subtract_mins)
    # update token_created_at
    user.token_created_at = new_token_created_time

    # assert token is invalid now
    assert user.token_valid(token) == validity

