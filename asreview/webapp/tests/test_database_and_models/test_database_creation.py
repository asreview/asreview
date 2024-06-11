import pytest
import sqlalchemy
from sqlalchemy import create_engine

from asreview.webapp.utils import asreview_path


def get_db_path():
    return asreview_path() / "asreview.test.sqlite"


# checks if asreview path does not contain a database if app
# is unauthenticated
def test_database_is_not_created_if_unauth_app(unauth_app):
    assert asreview_path().exists()
    assert get_db_path().exists() is False


# checks is asreview path contains database if app is
# authenticated
def test_database_exists_after_starting_auth_app(auth_app):
    assert asreview_path().exists()
    assert get_db_path().exists()


# checks if all tables were created
@pytest.mark.parametrize(
    "table", ["collaboration_invitations", "collaborations", "projects", "users"]
)
def test_if_db_table_exists(auth_app, table):
    engine = create_engine(f"sqlite:///{get_db_path()}")
    table_names = sqlalchemy.inspect(engine).get_table_names()
    assert table in table_names
