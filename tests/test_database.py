import sqlite3
from pathlib import Path

import pytest

import asreview as asr
from asreview.database.database import CURRENT_DATABASE_VERSION
from asreview.database.sqlstate import REQUIRED_TABLES
from asreview.data.record import Record


def test_state_manual_close(tmpdir):
    """Test that calling close() explicitly works."""
    fp = Path(tmpdir, "test.db")
    db = asr.Database(fp)
    db.create_tables()
    conn = db.results._conn
    db.close()
    with pytest.raises(
        sqlite3.ProgrammingError, match="Cannot operate on a closed database"
    ):
        conn.execute("SELECT 1")


def test_state_close_before_conn_created(tmpdir):
    fp = Path(tmpdir, "test.db")
    db = asr.Database(fp)
    db.close()


def test_state_closes_connection_on_exit(tmpdir):
    """Test that state closes the SQLite connection when exiting context."""
    fp = Path(tmpdir, "test.db")
    with asr.Database(fp) as db:
        db.create_tables()
        conn = db.results._conn
    with pytest.raises(
        sqlite3.ProgrammingError, match="Cannot operate on a closed database"
    ):
        conn.execute("SELECT 1")


def test_state_closes_on_exception(tmpdir):
    """Test that Database closes connection even when exception occurs."""
    fp = Path(tmpdir, "test.db")

    with pytest.raises(ValueError):
        with asr.Database(fp) as db:
            db.create_tables()
            conn = db.results._conn
            raise ValueError("Something went wrong")
    with pytest.raises(
        sqlite3.ProgrammingError, match="Cannot operate on a closed database"
    ):
        conn.execute("SELECT 1")


def test_create_tables(tmpdir):
    """Test that all database tables are created and version is set."""
    fp = Path(tmpdir, "test.db")
    with asr.Database(fp) as db:
        db.create_tables()
        assert db.user_version == CURRENT_DATABASE_VERSION

    with sqlite3.connect(str(fp)) as conn:
        cur = conn.cursor()
        table_names = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()

    table_names = set(tup[0] for tup in table_names)
    assert set(REQUIRED_TABLES).issubset(set(table_names))
    assert Record.__tablename__ in table_names
