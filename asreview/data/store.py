import numpy as np
import pandas as pd
from sqlalchemy import NullPool
from sqlalchemy import create_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from asreview.data.record import Base
from asreview.data.record import Record

CURRENT_DATASTORE_VERSION = 0


class DataStore:
    """Data store to hold user input data.

    Data input always happends via the record class. This means that if you want to add
    data to the data store, you will first need to clean it, make sure it has the
    correct columns and make sure it passes the validations defined in the record class.

    Getting data from the store can happen in rows or in columns. If you read rows, you
    will get record objects as response. If you read columns, you will get pandas
    objects. If you ask for a single column you get a pandas Series, and if you ask for
    multiple columns you get a pandas DataFrame.

    DataStore uses an SQLite database in the backend and SQLAlchemy ORM to interact with
    the database."""

    def __init__(self, fp, record_cls=Record):
        """Initialize the data store.

        Parameters
        ----------
        fp : str | Path
            Location of the database file. If `fp == ":memory:"`, the data store will be
            in memory.
        record_cls : asreview.data.record.Base, optional
            The record class to use. The record class specifies which fields each record
            can have, field validation and more properties of the database. See
            `asreview.data.record`. By default uses `asreview.data.record.Record`.
        """
        self.fp = fp
        # If the sqlite database is in memory, we should use the default
        # SingleThreadPool poolclass, because any poolclass with multiple threads will
        # have different instances of the database for each thread.
        if fp == ":memory:":
            poolclass = None
        else:
            poolclass = NullPool
        # I'm using NullPool here, indicating that the engine should use a connection
        # pool, but just create and dispose of a connection every time a request comes.
        # This makes it very easy dispose of the engine, but is less efficient.
        # I was getting errors when running tests that try to clean up behind them,
        # and this solves those errors. We can change this back to a connection pool at
        # some later moment by properly looking at how to close everything.
        self.engine = create_engine(f"sqlite:///{self.fp}", poolclass=poolclass)
        # I put expire_on_commit=False, so that after you put records in the database,
        # you can still use them in your code without having access to the database.
        # The downside is that if you use the record after committing it to the database
        # and another mutation happens to the database, your record might be out of
        # date. See https://docs.sqlalchemy.org/en/20/orm/session_api.html#sqlalchemy.orm.Session.params.expire_on_commit
        self.Session = sessionmaker(self.engine, expire_on_commit=False)
        self.record_cls = record_cls
        self._columns = self.record_cls.get_columns()
        self._pandas_dtype_mapping = self.record_cls.get_pandas_dtype_mapping()

    @property
    def columns(self):
        return self._columns

    @property
    def pandas_dtype_mapping(self):
        """Mapping {column name: pandas data type}"""
        return self._pandas_dtype_mapping

    @property
    def user_version(self):
        """Version number of the state."""
        with self.engine.connect() as conn:
            version = conn.execute(text("PRAGMA user_version"))
            return int(version.fetchone()[0])

    @user_version.setter
    def user_version(self, version):
        with self.engine.connect() as conn:
            # I tried passing the version through a parameter, but it didn't seem to
            # work. Maybe you can't use parameters with PRAGMA statements?
            conn.execute(text(f"PRAGMA user_version = {version}"))
            conn.commit()

    def create_tables(self):
        """Initialize the tables containing the data.

        If you are creating a new data store, you will need to call this method before
        adding data to the data store."""
        self.user_version = CURRENT_DATASTORE_VERSION
        Base.metadata.create_all(self.engine)

    def add_records(self, records):
        """Add records to the data store.

        Parameters
        ----------
        records : list[self.record_cls]
            List of records to add to the store.
        """
        # SQLite makes an autoincremented primary key column start at 1. We want it to
        # start at 0, so that the record_id is equal to the row number of the record in
        # feature matrix. By making sure that the first record has record_id 0, we force
        # the autoincremented column to start at 0.
        if self.is_empty():
            records[0].record_id = 0

        with self.Session() as session, session.begin():
            session.add_all(records)

    def delete_record(self, record_id):
        with self.Session() as session, session.begin():
            record = session.get(self.record_cls, record_id)
            if record is None:
                raise ValueError(
                    f"DataStore does not contain a record with record_id {record_id}"
                )
            session.delete(record)

    def __len__(self):
        with self.Session() as session:
            return session.query(self.record_cls).count()

    def __getitem__(self, item):
        # We allow a string or a list of strings as input. If the input is a string we
        # return that column as a pandas series. If the input is a list of strings we
        # return a pandas DataFrame containing those columns. This way the output you
        # get is the same if you do __getitem__ on a DataStore instance or on a pandas
        # DataFrame containing the same data.
        if isinstance(item, str):
            columns = [item]
        else:
            columns = item
        with self.engine.connect() as con:
            df = pd.read_sql(
                self.record_cls.__tablename__,
                con,
                columns=columns,
                dtype=self.pandas_dtype_mapping,
            )
        if isinstance(item, str):
            return df[item]
        else:
            return df

    def __contains__(self, item):
        return item in self.columns

    def is_empty(self):
        with self.Session() as session:
            return session.query(self.record_cls).first() is None

    def get_records(self, record_id):
        """Get the records with the given record identifiers.

        Parameters
        ----------
        record_id : int | list[int]
            Record identifier or list record identifiers.

        Returns
        -------
        asreview.data.record.Record | list[asreview.data.record.Record] | None
        """
        if isinstance(record_id, np.integer):
            record_id = record_id.item()

        with self.Session() as session:
            if isinstance(record_id, int):
                return (
                    session.query(self.record_cls)
                    .filter(self.record_cls.record_id == record_id)
                    .first()
                )
            else:
                records = (
                    session.query(self.record_cls)
                    .filter(self.record_cls.record_id.in_(record_id))
                    .all()
                )

                record_id_to_position = {id: i for i, id in enumerate(record_id)}
                return sorted(records, key=lambda r: record_id_to_position[r.record_id])

    def get_df(self):
        """Get all data from the data store as a pandas DataFrmae.

        Returns
        -------
        pd.DataFrame
        """
        with self.engine.connect() as con:
            return pd.read_sql(
                self.record_cls.__tablename__,
                con,
                dtype=self.pandas_dtype_mapping,
            )
