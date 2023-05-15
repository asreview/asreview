import pytest

import asreview.webapp.tests.utils.config_parser as cp
from asreview.webapp import DB
from asreview.webapp.authentication.models import User


@pytest.fixture(autouse=True)
def check_user_table_is_empty(auth_app):
    assert len(User.query.all()) == 0


# test identifier validation
def test_user_must_have_identifier():
    user = cp.get_user(1)
    with pytest.raises(ValueError):
        user.identifier = None

    with pytest.raises(ValueError):
        user.identifier = ""


# test origin validation
def test_user_must_have_origin():
    user = cp.get_user(1)
    with pytest.raises(ValueError):
        user.origin = None

    with pytest.raises(ValueError):
        user.origin = ""


# test name validation
def test_user_must_have_name():
    user = cp.get_user(1)
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
    user = cp.get_user(1)
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
    user_data = cp.get_user(1)
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
@pytest.mark.parametrize("password", ["", None, "a1!", "aaaaaaaaaaaaa", "1111111111111"])
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
    # verify we start with a clean database
    assert len(User.query.all()) == 0

    user = cp.get_user(1)
    DB.session.add(user)
    DB.session.commit()

    # verify we have 1 record
    assert len(User.query.all()) == 1
    # verify we have added a record
    assert User.query.filter(User.identifier == user.identifier).one() == user
