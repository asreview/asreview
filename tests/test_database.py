import sqlite3
from pathlib import Path
import time

import pandas as pd
import pytest

import asreview as asr
from asreview.data.loader import load_records
from asreview.database.database import CURRENT_DATABASE_VERSION
from asreview.database.sqlstate import REQUIRED_TABLES
from asreview.data.record import Record


def assert_state(db, state, columns):
    pd.testing.assert_frame_equal(
        db.results.get_results_table(columns=columns, pending=True),
        pd.DataFrame(
            state,
            columns=columns,
        ),
        check_dtype=False,
    )


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
    state = [
        [0, None, None, None, "c0", "q0", "b0", "f0", 40],
        [5, None, None, None, "c5", "q5", "b5", "f5", 45],
    ]
    columns = [
        "record_id",
        "label",
        "tags",
        "user_id",
        "classifier",
        "querier",
        "balancer",
        "feature_extractor",
        "training_set",
    ]

    # record_id 0 is grouped and in the table. The existing record is updated, the new
    # records are added with model information of the existing.
    db.label_record(0, 1, "foo", 2)
    state[0] = [0, 1, "foo", 2, "c0", "q0", "b0", "f0", 40]
    state.append([1, 1, "foo", 2, "c0", "q0", "b0", "f0", 40])
    state.append([2, 1, "foo", 2, "c0", "q0", "b0", "f0", 40])
    assert_state(db, state, columns)

    # record_id 3 is grouped but not in the table. The records are added without model
    # information.
    db.label_record(3, 0)
    state.append([3, 0, None, None, None, None, None, None, None])
    state.append([4, 0, None, None, None, None, None, None, None])
    assert_state(db, state, columns)

    # record_id 5 is not in a group, but in the table already, so is updated.
    db.label_record(5, 0)
    state[1] = [5, 0, None, None, "c5", "q5", "b5", "f5", 45]
    assert_state(db, state, columns)

    # record_id 6 is not grouped and not in the table. It's added without model info.
    db.label_record(6, 1, "tag", 3)
    state.append([6, 1, "tag", 3, None, None, None, None, None])
    assert_state(db, state, columns)


def test_query_top_ranked(db):
    records = [
        Record(0, "foo"),
        Record(1, "foo"),
        Record(2, "foo"),
        Record(3, "foo"),
        Record(4, "foo"),
        Record(5, "foo"),
    ]
    db.input.add_records(records)
    groups = [(0, 0), (0, 1), (3, 3), (3, 4)]
    db.input.set_groups(groups)
    con = db.results._conn
    cur = con.cursor()
    current_time = time.time()
    cur.executemany(
        """INSERT INTO last_ranking(record_id, classifier, querier, balancer,
        feature_extractor, training_set, time) VALUES (?, 'nb',
        'max', 'balanced', 'tfidf', 42, ?)""",
        (
            (5, current_time),
            (0, current_time),
            (2, current_time),
            (1, current_time),
            (4, current_time),
            (3, current_time),
        ),
    )
    con.commit()

    columns = [
        "record_id",
        "label",
        "user_id",
        "classifier",
        "querier",
        "balancer",
        "feature_extractor",
        "training_set",
    ]
    state = []

    # record_id 5 is the top ranked and is not grouped.
    db.query_top_ranked()
    state.append([5, None, None, "nb", "max", "balanced", "tfidf", 42])
    assert_state(db, state, columns)

    # record_id 0 is the top ranked not in results. It's grouped with record_id 1.
    db.query_top_ranked(2)
    state.append([0, None, 2, "nb", "max", "balanced", "tfidf", 42])
    state.append([1, None, 2, "nb", "max", "balanced", "tfidf", 42])
    assert_state(db, state, columns)

    # record_id 2 is the top ranked not in results. It's not grouped.
    db.query_top_ranked()
    state.append([2, None, None, "nb", "max", "balanced", "tfidf", 42])
    assert_state(db, state, columns)

    # record_id 4 is the top ranked not in results. It's grouped with record_id 3.
    # The grouped records end up in the results table in the same order as they are in
    # the records table, to 3 comes before 4.
    db.query_top_ranked(3)
    state.append([3, None, 3, "nb", "max", "balanced", "tfidf", 42])
    state.append([4, None, 3, "nb", "max", "balanced", "tfidf", 42])
    assert_state(db, state, columns)


def test_update(db):
    records = [
        Record(0, "foo"),
        Record(1, "foo"),
        Record(2, "foo"),
    ]
    db.input.add_records(records)
    groups = [(0, 0), (0, 1)]
    db.input.set_groups(groups)
    db.label_record(record_id=0, label=0, tags="foo", user_id=0)
    db.label_record(record_id=2, label=1, tags="bar", user_id=1)

    state = [[0, 0, "foo", 0], [1, 0, "foo", 0], [2, 1, "bar", 1]]
    # Update everything, grouped record.
    db.update_result(record_id=0, label=1, tags="foofoo", user_id=2)
    state[0] = [0, 1, "foofoo", 2]
    state[1] = [1, 1, "foofoo", 2]
    assert_state(db, state, columns=["record_id", "label", "tags", "user_id"])

    # Update everything, non-grouped record.
    db.update_result(record_id=2, label=0, tags="barbar", user_id=3)
    state[2] = [2, 0, "barbar", 3]
    assert_state(db, state, columns=["record_id", "label", "tags", "user_id"])

    # Update only label
    db.update_result(record_id=1, label=0)
    state[0] = [0, 0, "foofoo", 2]
    state[1] = [1, 0, "foofoo", 2]
    assert_state(db, state, columns=["record_id", "label", "tags", "user_id"])

    # Update only tags
    db.update_result(record_id=2, tags="barbarbar")
    state[2] = [2, 0, "barbarbar", 3]
    assert_state(db, state, columns=["record_id", "label", "tags", "user_id"])

    # Update tags check user_id is not changed.
    db.update_result(record_id=0, tags="foofoofoo", user_id=4)
    state[0] = [0, 0, "foofoofoo", 2]
    state[1] = [1, 0, "foofoofoo", 2]
    assert_state(db, state, columns=["record_id", "label", "tags", "user_id"])


def test_delete_labeling_data(db):
    records = [
        Record(0, "foo"),
        Record(1, "foo"),
        Record(2, "foo"),
        Record(3, "foo"),
        Record(4, "foo"),
    ]
    db.input.add_records(records)
    groups = [(0, 0), (0, 1), (3, 3), (3, 4)]
    db.input.set_groups(groups)
    db.label_record(record_id=0, label=0)
    db.label_record(record_id=2, label=1)
    db.label_record(record_id=3, label=0)

    db.delete_result(0)
    assert_state(db, state=[[2, 1], [3, 0], [4, 0]], columns=["record_id", "label"])
    db.delete_result(2)
    assert_state(db, state=[[3, 0], [4, 0]], columns=["record_id", "label"])
    db.delete_result(4)
    assert_state(db, state=[], columns=["record_id", "label"])
