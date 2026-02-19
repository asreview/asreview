import sqlite3
from pathlib import Path

import pandas as pd
import pytest

import asreview as asr
from asreview.data.loader import load_records
from asreview.database.database import CURRENT_DATABASE_VERSION
from asreview.database.sqlstate import REQUIRED_TABLES
from asreview.data.record import Record


@pytest.fixture
def db(tmpdir):
    with asr.Database(Path(tmpdir, "test.db")) as db:
        db.create_tables()
        yield db


def test_results_manual_close(tmpdir):
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


def test_results_close_before_conn_created(tmpdir):
    fp = Path(tmpdir, "test.db")
    db = asr.Database(fp)
    db.close()


def test_results_closes_connection_on_exit(tmpdir):
    """Test that results closes the SQLite connection when exiting context."""
    fp = Path(tmpdir, "test.db")
    with asr.Database(fp) as db:
        db.create_tables()
        conn = db.results._conn
    with pytest.raises(
        sqlite3.ProgrammingError, match="Cannot operate on a closed database"
    ):
        conn.execute("SELECT 1")


def test_results_closes_on_exception(tmpdir):
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


def test_read_only(tmpdir, asreview_test_project):
    fp = Path(tmpdir, "test.db")
    with asr.Database(fp, read_only=True) as db:
        with pytest.raises(sqlite3.OperationalError):
            db.create_tables()
        with pytest.raises(sqlite3.OperationalError):
            db.user_version = 16843
    assert not fp.is_file()

    data_fp = Path("tests", "demo_data", "generic.csv")
    records = load_records(data_fp, dataset_id="foo")
    with asr.Database(asreview_test_project.db_path, read_only=True) as db:
        with pytest.raises(sqlite3.OperationalError):
            db.results.query_top_ranked()
        with pytest.raises(sqlite3.OperationalError):
            db.input.add_records(records)
        db.results.get_last_ranking_table()
        db.input.get_records([0, 1])
        db.user_version


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


def test_in_memory():
    with asr.Database(":memory:") as db:
        db.create_tables()
        assert db.input.is_empty()
        db.input.add_records(
            [
                Record(dataset_row=0, dataset_id="foo"),
                Record(dataset_row=1, dataset_id="foo"),
            ]
        )
        assert len(db.input) == 2
        db.results.add_labeling_data([1, 2, 3], [0, 1, 0])
        assert len(db.results.get_results_table()) == 3


def test_open_db_missing_file_ro(tmpdir):
    project_path = Path(tmpdir, "dir", "test.db")
    with pytest.raises(FileNotFoundError):
        with asr.open_db(project_path, read_only=True):
            pass

    assert not project_path.exists()
    assert not project_path.parent.exists()


def test_open_db_missing_file_rw(tmpdir):
    project_path = Path(tmpdir, "dir", "test.db")
    with asr.open_db(project_path) as db:
        db._is_valid()

    assert project_path.parent.is_dir()
    assert project_path.is_file()


def test_label_record(db):
    records = [
        Record(0, "foo"),
        Record(1, "foo"),
        Record(2, "foo"),
        Record(3, "foo"),
        Record(4, "foo"),
        Record(5, "foo"),
        Record(6, "foo"),
    ]
    db.input.add_records(records)
    groups = [(0, 0), (0, 1), (0, 2), (3, 3), (3, 4)]
    db.input.set_groups(groups)
    con = db.results._conn
    cur = con.cursor()
    cur.executemany(
        """INSERT INTO results(record_id, classifier, querier, balancer,
        feature_extractor, training_set) VALUES (:record_id, :classifier, :querier,
        :balancer, :feature_extractor, :training_set)""",
        (
            {
                "record_id": 0,
                "classifier": "c0",
                "querier": "q0",
                "balancer": "b0",
                "feature_extractor": "f0",
                "training_set": 40,
            },
            {
                "record_id": 5,
                "classifier": "c5",
                "querier": "q5",
                "balancer": "b5",
                "feature_extractor": "f5",
                "training_set": 45,
            },
        ),
    )
    con.commit()

    # record_id 0 is grouped and in the table. The existing record is updated, the new
    # records are added with model information of the existing.
    db.label_record(0, 1, "foo", 2)
    pd.testing.assert_frame_equal(
        db.results.get_results_table(
            columns=[
                "record_id",
                "label",
                "tags",
                "user_id",
                "classifier",
                "querier",
                "balancer",
                "feature_extractor",
                "training_set",
            ],
            pending=True,
        ),
        pd.DataFrame(
            {
                "record_id": [0, 5, 1, 2],
                "label": [1, None, 1, 1],
                "tags": ["foo", None, "foo", "foo"],
                "user_id": [2, None, 2, 2],
                "classifier": ["c0", "c5", "c0", "c0"],
                "querier": ["q0", "q5", "q0", "q0"],
                "balancer": ["b0", "b5", "b0", "b0"],
                "feature_extractor": ["f0", "f5", "f0", "f0"],
                "training_set": [40, 45, 40, 40],
            }
        ),
        check_dtype=False,
    )
    # record_id 3 is grouped but not in the table. The records are added without model
    # information.
    db.label_record(3, 0)
    pd.testing.assert_frame_equal(
        db.results.get_results_table(
            columns=[
                "record_id",
                "label",
                "tags",
                "user_id",
                "classifier",
                "querier",
                "balancer",
                "feature_extractor",
                "training_set",
            ],
            pending=True,
        ),
        pd.DataFrame(
            {
                "record_id": [0, 5, 1, 2, 3, 4],
                "label": [1, None, 1, 1, 0, 0],
                "tags": ["foo", None, "foo", "foo", None, None],
                "user_id": [2, None, 2, 2, None, None],
                "classifier": ["c0", "c5", "c0", "c0", None, None],
                "querier": ["q0", "q5", "q0", "q0", None, None],
                "balancer": ["b0", "b5", "b0", "b0", None, None],
                "feature_extractor": ["f0", "f5", "f0", "f0", None, None],
                "training_set": [40, 45, 40, 40, None, None],
            }
        ),
        check_dtype=False,
    )

    # record_id 5 is not in a group, but in the table already, so is updated.
    db.label_record(5, 0)
    pd.testing.assert_frame_equal(
        db.results.get_results_table(
            columns=[
                "record_id",
                "label",
                "tags",
                "user_id",
                "classifier",
                "querier",
                "balancer",
                "feature_extractor",
                "training_set",
            ],
            pending=True,
        ),
        pd.DataFrame(
            {
                "record_id": [0, 5, 1, 2, 3, 4],
                "label": [1, 0, 1, 1, 0, 0],
                "tags": ["foo", None, "foo", "foo", None, None],
                "user_id": [2, None, 2, 2, None, None],
                "classifier": ["c0", "c5", "c0", "c0", None, None],
                "querier": ["q0", "q5", "q0", "q0", None, None],
                "balancer": ["b0", "b5", "b0", "b0", None, None],
                "feature_extractor": ["f0", "f5", "f0", "f0", None, None],
                "training_set": [40, 45, 40, 40, None, None],
            }
        ),
        check_dtype=False,
    )
    # record_id 6 is not grouped and not in the table. It's added without model info.
    db.label_record(6, 1, "tag", 3)
    pd.testing.assert_frame_equal(
        db.results.get_results_table(
            columns=[
                "record_id",
                "label",
                "tags",
                "user_id",
                "classifier",
                "querier",
                "balancer",
                "feature_extractor",
                "training_set",
            ],
            pending=True,
        ),
        pd.DataFrame(
            {
                "record_id": [0, 5, 1, 2, 3, 4, 6],
                "label": [1, 0, 1, 1, 0, 0, 1],
                "tags": ["foo", None, "foo", "foo", None, None, "tag"],
                "user_id": [2, None, 2, 2, None, None, 3],
                "classifier": ["c0", "c5", "c0", "c0", None, None, None],
                "querier": ["q0", "q5", "q0", "q0", None, None, None],
                "balancer": ["b0", "b5", "b0", "b0", None, None, None],
                "feature_extractor": ["f0", "f5", "f0", "f0", None, None, None],
                "training_set": [40, 45, 40, 40, None, None, None],
            }
        ),
        check_dtype=False,
    )
