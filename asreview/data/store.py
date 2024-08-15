from datetime import datetime
import json
import sqlite3

import pandas as pd

from asreview.data.base import Dataset
from asreview.data.base import Record

DATA_TABLE_COLUMNS = {
    "record_id",
    "dataset_id",
    "dataset_row",
    "included",
    "title",
    "authors",
    "abstract",
    "notes",
    "doi",
    "keywords",
    "created_at",
}

DATA_TABLE_COLUMNS_PANDAS_DTYPES = {
    "record_id": "Int64",
    "dataset_id": "object",
    "dataset_row": "Int64",
    "included": "Int64",
    "title": "object",
    "authors": "object",
    "abstract": "object",
    "notes": "object",
    "doi": "object",
    "keywords": "object",
    "created_at": "object",
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

    def create_tables(self):
        """Initialize the tables containing the data."""
        self.user_version = CURRENT_DATASTORE_VERSION

        cur = self._conn.cursor()

        cur.execute(
            """CREATE TABLE records
                            (record_id INTEGER PRIMARY KEY,
                            dataset_id string,
                            dataset_row INTEGER,
                            included INTEGER,
                            title TEXT,
                            authors TEXT,
                            abstract TEXT,
                            notes TEXT,
                            keywords JSON,
                            doi TEXT,
                            created_at TEXT)"""
        )
        self._conn.commit()

    def add_dataset(self, dataset, dataset_id):
        """Add a new dataset to the data store."""
        try:
            keywords = [
                json.dumps(keyword_list) for keyword_list in dataset["keywords"]
            ]
        except KeyError:
            keywords = None

        data = {
            "dataset_id": dataset_id,
            "dataset_row": range(len(dataset)),
            "included": dataset.get("included"),
            "title": dataset.get("title"),
            "authors": dataset.get("authors"),
            "abstract": dataset.get("abstract"),
            "notes": dataset.get("notes"),
            "keywords": keywords,
            "doi": dataset.get("doi"),
            "created_at": datetime.now(),
        }

        # If the data store is empty, make the row number column start at 0 instead of
        # sqlite default value 1.
        if self.is_empty:
            data["record_id"] = range(len(dataset))
        pd.DataFrame(data).to_sql(
            "records", self._conn, if_exists="append", index=False
        )

    def __len__(self):
        cur = self._conn.cursor()
        n = cur.execute("SELECT COUNT(*) FROM records").fetchone()[0]
        cur.close()
        return n

    def __getitem__(self, item):
        if not item:
            raise KeyError(
                "'item' should be valid column name or list of column names."
            )
        if isinstance(item, list):
            illegal_cols = [col for col in item if col not in DATA_TABLE_COLUMNS]
            if illegal_cols:
                raise KeyError(
                    f"DataStore does not have a columns named {illegal_cols}."
                    f" Valid column names are: {DATA_TABLE_COLUMNS}"
                )
            col_string = ",".join(item)
            dtype = {
                key: val
                for key, val in DATA_TABLE_COLUMNS_PANDAS_DTYPES.items()
                if key in item
            }
        else:
            if item not in DATA_TABLE_COLUMNS:
                raise KeyError(
                    f"DataStore does not have a column named {item}."
                    f" Valid column names are: {DATA_TABLE_COLUMNS}"
                )
            col_string = item
            dtype = DATA_TABLE_COLUMNS_PANDAS_DTYPES[item]
        # I can use the value of item directly in the query because I checked that item
        # is in the list of column names.
        return pd.read_sql(
            f"SELECT {col_string} FROM records",
            con=self._conn,
            dtype=dtype,
        )

    def __contains__(self, item):
        return item in DATA_TABLE_COLUMNS

    def is_empty(self):
        cur = self._conn.cursor()
        val = cur.execute("SELECT EXISTS (SELECT 1 FROM records);").fetchone()[0]
        return not bool(val)

    def get_record(self, record_id):
        """Get the record with the given record row number.

        Arguments
        ---------
        record_id : int
            Record id (row number) of the record to get.

        Returns
        -------
        asreview.data.base.Record
        """
        record = pd.read_sql(
            "SELECT * FROM records WHERE record_id = ?",
            con=self._conn,
            params=(record_id,),
            dtype=DATA_TABLE_COLUMNS_PANDAS_DTYPES,
        ).drop(["dataset_id", "dataset_row", "created_at"], axis=1)
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
