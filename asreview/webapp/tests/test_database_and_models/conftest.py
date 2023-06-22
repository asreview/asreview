import pytest

import asreview.webapp.tests.utils.crud as crud
from asreview.webapp import DB


@pytest.fixture()
def setup_teardown(auth_app):
    """A fixture for an authenticated app that ensures tests are
    started with no users and projects."""
    assert crud.count_users() == 0
    assert crud.count_projects() == 0
    yield
    crud.delete_everything(DB)


@pytest.fixture()
def test_data(auth_app):
    """A fixture for an authenticated app, creates 3 users, first user
    has created 2 projects."""
    user1, _ = crud.create_user1_with_2_projects(DB)
    user2 = crud.create_user(DB, user=2)
    user3 = crud.create_user(DB, user=3)
    assert crud.count_projects() == 2
    assert crud.count_users() == 3
    data = {"user1": user1, "user2": user2, "user3": user3}
    yield data
    crud.delete_everything(DB)


@pytest.fixture()
def user(auth_app):
    """A fixture for an authenticated app, creates a single user."""
    assert crud.count_projects() == 0
    user = crud.create_user(DB, 1)
    assert crud.count_users() == 1
    yield user
    crud.delete_everything(DB)
