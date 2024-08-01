from datetime import datetime
import json
import sqlite3

import pandas as pd

from asreview.data.base import Dataset
from asreview.data.base import Record

DATA_TABLE_COLUMNS = {
    "row_number",
    "dataset_id",
    "dataset_row",
    "included",
    "title",
    "authors",
    "abstract",
    "notes",
    "doi",
    "keywords",
    "tags",
    "created_at",
    "is_prior",
}

DATA_TABLE_COLUMNS_PANDAS_DTYPES = {
    "row_number": "Int64",
    "dataset_id": "object",
    "dataset_row": "Int64",
    "included": "Int64",
    "title": "object",
    "authors": "object",
    "abstract": "object",
    "notes": "object",
    "doi": "object",
    "keywords": "object",
    "tags": "object",
    "created_at": "object",
    "is_prior": "Int64",
}

CURRENT_DATASTORE_VERSION = 0


class DataStore:
    def __init__(self, fp):
        self.fp = fp

    @property
    def _conn(self):
        """Get a connection to the SQLite database.

        Returns
        -------
        sqlite3.Connection
            Connection to the SQLite database.
        """
        if hasattr(self, "_conn_cache"):
            return self._conn_cache

        self._conn_cache = sqlite3.connect(str(self.fp))
        return self._conn_cache

    def close(self):
        self._conn.close()

    @property
    def user_version(self):
        """Version number of the state."""
        cur = self._conn.cursor()
        version = cur.execute("PRAGMA user_version")

        return int(version.fetchone()[0])

    @user_version.setter
    def user_version(self, version):
        cur = self._conn.cursor()
        cur.execute(f"PRAGMA user_version = {version}")
        self._conn.commit()
        cur.close()

    def add_dataset(self, dataset, dataset_id):
        """Add a new dataset to the data store."""
        keywords = (
            None
            if dataset.keywords is None
            else [json.dumps(keyword_list) for keyword_list in dataset.keywords]
        )
        data = {
            "dataset_id": dataset_id,
            "dataset_row": range(len(dataset)),
            "included": dataset.labels,
            "title": dataset.title,
            "authors": dataset.authors,
            "abstract": dataset.abstract,
            "notes": dataset.notes,
            "keywords": keywords,
            "doi": dataset.doi,
            # Tags are not yet in the Dataset object.
            # "tags": dataset.tags,
            # It's not clear yet you to get 'is_prior' from a Dataset object
            # "is_prior": dataset.get("is_prior"),
            "created_at": datetime.now(),
        }

        # If the data store is empty, make the row number column start at 0 instead of
        # sqlite default value 1.
        if self.is_empty:
            data["row_number"] = range(len(dataset))
        pd.DataFrame(data).to_sql(
            "records", self._conn, if_exists="append", index=False
        )

    def is_empty(self):
        cur = self._conn.cursor()
        val = cur.execute("SELECT EXISTS (SELECT 1 FROM records);").fetchone()[0]
        return not bool(val)

    def get_record(self, row_number):
        """Get the record with the given record row number.

        Arguments
        ---------
        row_number : int
            Row number of the record to get.

        Returns
        -------
        asreview.data.base.Record
        """
        record = (
            pd.read_sql(
                "SELECT * FROM records WHERE row_number = ?",
                con=self._conn,
                params=(row_number,),
                dtype=DATA_TABLE_COLUMNS_PANDAS_DTYPES,
            )
            .rename({"row_number": "record_id"}, axis=1)
            .drop(["dataset_id", "dataset_row", "tags", "created_at"], axis=1)
        )
        return Record(**record.iloc[0].to_dict())

    def get_all(self):
        """Get all data from the data store as a dataset.

        Returns
        -------
        asreview.data.base.Dataset
        """
        df = pd.read_sql(
            "select * from records", self._conn, dtype=DATA_TABLE_COLUMNS_PANDAS_DTYPES
        )
        return Dataset(df=df)

    def create_tables(self):
        """Initialize the tables containing the data."""
        self.user_version = CURRENT_DATASTORE_VERSION

        cur = self._conn.cursor()

        cur.execute(
            """CREATE TABLE records
                            (row_number INTEGER PRIMARY KEY,
                            dataset_id string,
                            dataset_row INTEGER,
                            included INTEGER,
                            title TEXT,
                            authors TEXT,
                            abstract TEXT,
                            notes TEXT,
                            keywords JSON,
                            doi TEXT,
                            tags JSON,
                            is_prior INTEGER,
                            created_at TEXT)"""
        )
        self._conn.commit()
