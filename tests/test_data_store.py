from pathlib import Path
import sqlite3

import pandas as pd
import pytest

from asreview import load_dataset
from asreview.data.store import DataStore
from asreview.data.base import Dataset
from asreview.data.base import Record
from asreview.project import PATH_DATA_STORE


@pytest.fixture
def dataset():
    data_fp = Path("tests", "demo_data", "generic.csv")
    return load_dataset(data_fp)


@pytest.fixture
def store(tmpdir):
    fp = tmpdir / PATH_DATA_STORE
    store = DataStore(fp)
    store.create_tables()
    return store


@pytest.fixture
def store_with_data(store, dataset):
    store.add_dataset(dataset, "foo")
    return store


def test_create_tables(tmpdir):
    fp = tmpdir / PATH_DATA_STORE
    store = DataStore(fp)
    store.create_tables()
    con = sqlite3.connect(fp)
    tables = (
        con.cursor()
        .execute("SELECT name FROM sqlite_master WHERE type='table'")
        .fetchone()
    )
    assert tables == ("records",)


def test_add_dataset(store, dataset):
    store.add_dataset(dataset, "foo")
    con = sqlite3.connect(store.fp)
    df = pd.read_sql("SELECT * FROM records", con)
    assert df["dataset_id"].eq("foo").all()


def test_is_empty(store, dataset):
    assert store.is_empty()
    store.add_dataset(dataset, "foo")
    assert not store.is_empty()


def test_get_record(store_with_data):
    row_number = 1
    record = store_with_data.get_record(row_number)
    assert isinstance(record, Record)
    assert record.record_id == row_number


def test_get_all(store_with_data):
    output = store_with_data.get_all()
    assert isinstance(output, Dataset)


def test_len(store, dataset):
    assert len(store) == 0
    store.add_dataset(dataset, "foo")
    assert len(store) == len(dataset)
