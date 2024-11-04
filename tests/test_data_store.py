import sqlite3
from pathlib import Path

import pandas as pd
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Mapped

from asreview import load_dataset
from asreview.data.record import Base
from asreview.data.record import Record
from asreview.data.store import CURRENT_DATASTORE_VERSION
from asreview.data.store import DataStore
from asreview.project.api import PATH_DATA_STORE


@pytest.fixture
def records():
    data_fp = Path("tests", "demo_data", "generic.csv")
    return load_dataset(data_fp, dataset_id="foo")


@pytest.fixture
def store(tmpdir):
    fp = tmpdir / PATH_DATA_STORE
    store = DataStore(fp)
    store.create_tables()
    return store


@pytest.fixture
def store_with_data(store, records):
    store.add_records(records)
    return store


def test_create_tables(tmpdir):
    fp = tmpdir / PATH_DATA_STORE
    store = DataStore(fp)
    store.create_tables()
    assert store.user_version == CURRENT_DATASTORE_VERSION
    store.user_version = 42
    assert store.user_version == 42
    con = sqlite3.connect(fp)
    tables = (
        con.cursor()
        .execute("SELECT name FROM sqlite_master WHERE type='table'")
        .fetchone()
    )
    assert tables == ("record",)


def test_in_memory():
    store = DataStore(":memory:")
    store.create_tables()
    assert store.is_empty()
    store.add_records(
        [
            Record(dataset_row=0, dataset_id="foo"),
            Record(dataset_row=1, dataset_id="foo"),
        ]
    )
    assert len(store) == 2


def test_add_dataset(store, records):
    store.add_records(records)
    con = sqlite3.connect(store.fp)
    df = pd.read_sql("SELECT * FROM record", con)
    assert df["dataset_id"].eq("foo").all()


def test_record_id_start_at_zero(store):
    store.add_records(
        [
            Record(dataset_id="foo", dataset_row=5),
            Record(dataset_id="foo", dataset_row=6),
        ]
    )
    assert store["record_id"].to_list() == [0, 1]


def test_is_empty(store, records):
    assert store.is_empty()
    store.add_records(records)
    assert not store.is_empty()


def test_get_records(store_with_data):
    row_number = 1
    record = store_with_data.get_records(row_number)
    assert isinstance(record, Record)
    assert record.record_id == row_number


def test_get_df(store_with_data):
    output = store_with_data.get_df()
    assert isinstance(output, pd.DataFrame)
    assert set(output.columns) == set(Record.get_columns())


def test_len(store, records):
    assert len(store) == 0
    store.add_records(records)
    assert len(store) == len(records)


def test_get_column(store_with_data, records):
    abstracts = store_with_data["abstract"]
    assert isinstance(abstracts, pd.Series)
    abstracts = store_with_data[["abstract"]]
    assert isinstance(abstracts, pd.DataFrame)
    assert abstracts.columns == ["abstract"]
    for i in range(len(records)):
        assert abstracts.loc[i, "abstract"] == records[i].abstract

    data = store_with_data[["title", "record_id"]]
    assert isinstance(data, pd.DataFrame)
    assert list(data.columns) == ["title", "record_id"]


def test_custom_record(tmpdir):
    class CustomRecord(Base):
        __tablename__ = "custom"
        foo: Mapped[str]

    fp = Path(tmpdir, PATH_DATA_STORE)
    data_store = DataStore(fp, CustomRecord)
    data_store.create_tables()


def test_close_store(tmpdir):
    fp = Path(tmpdir, PATH_DATA_STORE)
    data_store = DataStore(fp)
    data_store.create_tables()
    fp.unlink()


def test_dataset_row_id_unique(store):
    records = [
        Record(dataset_row=1, dataset_id="foo"),
        Record(dataset_row=1, dataset_id="foo"),
    ]
    with pytest.raises(IntegrityError):
        store.add_records(records)


def test_author_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, authors=None),
        Record(dataset_id="foo", dataset_row=2, authors=["Foo", "Bar"]),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=3, authors="Foo;Bar")])


def test_keyword_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, keywords=None),
        Record(dataset_id="foo", dataset_row=2, keywords=["Foo", "Bar"]),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=3, keywords="Foo;Bar")])


def test_label_validation(store):
    records = [
        Record(dataset_id="foo", dataset_row=1, included=None),
        Record(dataset_id="foo", dataset_row=2, included=1),
        Record(dataset_id="foo", dataset_row=3, included=0),
    ]
    store.add_records(records)
    with pytest.raises(ValueError):
        store.add_records([Record(dataset_id="foo", dataset_row=4, included="1")])
