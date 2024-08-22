import json
import sqlite3
from datetime import datetime

import numpy as np
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import select
from sqlalchemy.orm import Session

from asreview.data.base import Dataset
from asreview.data.record import Base
from asreview.data.record import Record


CURRENT_DATASTORE_VERSION = 0


class DataStore:
    def __init__(self, fp, record_cls=Record):
        self.fp = fp
        self.engine = create_engine(f"sqlite+pysqlite:///{self.fp}")
        self.record_cls = record_cls
        self._columns = self.record_cls.get_columns()
        self._pandas_dtype_mapping = self.record_cls.get_pandas_dtype_mapping()

    @property
    def columns(self):
        """"""
        return self._columns

    @property
    def pandas_dtype_mapping(self):
        return self._pandas_dtype_mapping

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
        Base.metadata.create_all(self.engine)

    def add_dataset(self, dataset, dataset_id):
        """Add a new dataset to the data store."""
        # try:
        #     keywords = [
        #         json.dumps(keyword_list) for keyword_list in dataset["keywords"]
        #     ]
        # except KeyError:
        #     keywords = None
        records = dataset.record(range(len(dataset)))
        for record in records:
            record.dataset_id = dataset_id
        with Session(self.engine) as session:
            session.add_all(records)
            session.commit()

    def __len__(self):
        with Session(self.engine) as session:
            return session.query(self.record_cls).count()

    def __getitem__(self, item):
        if not item:
            raise KeyError(
                "'item' should be valid column name or list of column names."
            )
        if isinstance(item, list):
            illegal_cols = [col for col in item if col not in self.columns]
            if illegal_cols:
                raise KeyError(
                    f"DataStore does not have a columns named {illegal_cols}."
                    f" Valid column names are: {self.columns}"
                )
            col_string = ",".join(item)
            dtype = {
                key: val
                for key, val in self.pandas_dtype_mapping.items()
                if key in item
            }
        else:
            if item not in self.columns:
                raise KeyError(
                    f"DataStore does not have a column named {item}."
                    f" Valid column names are: {self.columns}"
                )
            col_string = item
            dtype = self.pandas_dtype_mapping[item]
        # I can use the value of item directly in the query because I checked that item
        # is in the list of column names.
        return pd.read_sql(
            f"SELECT {col_string} FROM {self.record_cls.__tablename__}",
            con=self._conn,
            dtype=dtype,
        )

    def __contains__(self, item):
        return item in self.columns

    def is_empty(self):
        with Session(self.engine) as session:
            return session.query(self.record_cls).first() is None

    def get_record(self, record_id):
        """Get the record with the given record row number.

        Arguments
        ---------
        record_id : int
            Record id (row number) of the record to get.

        Returns
        -------
        asreview.data.record.Record
        """
        if isinstance(record_id, np.int64):
            record_id = record_id.item()

        with Session(self.engine) as session:
            if isinstance(record_id, int):
                return (
                    session.query(self.record_cls)
                    .filter(self.record_cls.id == record_id)
                    .first()
                )
            else:
                return session.query(self.record_cls).filter(
                    self.record_cls.id.in_(record_id)
                )

    def get_all(self):
        """Get all data from the data store as a dataset.

        Returns
        -------
        asreview.data.base.Dataset
        """
        df = pd.read_sql(
            f"select * from {self.record_cls.__tablename__}",
            self._conn,
            dtype=self.pandas_dtype_mapping,
        )
        return Dataset(df=df)
