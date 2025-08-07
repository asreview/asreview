import numpy as np
import pandas as pd
from sqlalchemy import NullPool
from sqlalchemy import bindparam
from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql.functions import coalesce

from asreview.data.record import Record

CURRENT_DATASTORE_VERSION = 0


def normalize_duplicate_chain(session, record: Record):
    """Normalize the duplicate chain of a record.

    We consider records to be in a group when they point to each other with the
    `duplicate_of` column. We want to make it easy to query the groups by making sure
    that all records in a group point to the same root record. We call the records
    pointing to each other with the `duplicate_of` field the duplicate chain of the
    record. So we want to avoid duplicate chains of length more than 2 and we want to
    avoid circular duplicate chains.

    For example, if `r1`, `r2` and `r3` are in a group we want to have:
    ```
    r1.duplicate_of = r3
    r2.duplicate_of = r3
    r3.duplicate_of = None
    ```
    and not
    ```
    r1.duplicate_of = r2
    r2.duplicate_of = r3
    r3.duplicate_of = None
    ```
    or even `r3.duplicate_of = r1`. We also avoid things like `r1.duplicate_of = r2` and
    `r2.duplicate_of = 1` or even `r1.duplicate_of = r1`.

    Parameters
    ----------
    session : sqlalchemy.Session
        Database session.
    record : Record
        Record for which to normalize the duplicate chain.

    Raises
    ------
    ValueError
        If `record.duplicate_of` contains a non-existent record id.
    """
    current = record
    record_chain = [current]

    while current.duplicate_of is not None:
        next_record = session.get(Record, current.duplicate_of)
        if next_record is None:
            raise ValueError(f"Invalid duplicate_of reference: {current.duplicate_of}")
        if next_record in record_chain:
            # cycle detected, set the record with the minimal record_id as root.
            min_id = min(r.record_id for r in record_chain)
            for r in record_chain:
                r.duplicate_of = min_id if r.record_id != min_id else None
            return
        record_chain.append(next_record)
        current = next_record

    if len(record_chain) > 2:
        root = record_chain[-1]
        for r in record_chain[:-1]:
            r.duplicate_of = root.record_id


# Hook that ensures that record duplicate chains get normalized before flushing the
# record to the database.
@event.listens_for(Session, "before_flush")
def flatten_duplicate_of(session, flush_context, instances):
    record_mutations = session.new.union(session.dirty)
    if any(record.duplicate_of is not None for record in record_mutations):
        # By sorting the records by record_id we make sure that all detected
        # duplicate chains will contain the record with the lowest record_id. So we
        # guarantee that the normalized chain will have the record with the lowest
        # record_id as a root.
        for record in sorted(record_mutations, key=lambda record: record.record_id):
            normalize_duplicate_chain(session, record)


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
        self.record_cls._setup_sqlite_fts()
        self.record_cls.metadata.create_all(self.engine)

    def add_records(self, records):
        """Add records to the data store.

        Parameters
        ----------
        records : list[self.record_cls]
            List of records to add to the store.

        Raises
        ------
        ValueError
            If some `record.duplicate_of` points to a non-existing record_id. You should
            instead use `DataStore.add_groups` to set values of `duplicate_of`.
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
        """Delete a record from the store.

        WARNING: This method is purely here for completeness, it should not be used in
        any production setting. Deleting records can lead to undefined behavior because
        we make assumptions about the record_id in other parts of the code.
        """
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

    def get_records(self, record_id=None):
        """Get the records with the given record identifiers.

        Parameters
        ----------
        record_id : int | list[int] | None
            Record identifier or list record identifiers. If None, get all records.

        Returns
        -------
        asreview.data.record.Record | list[asreview.data.record.Record] | None
        """
        if isinstance(record_id, np.integer):
            record_id = record_id.item()

        with self.Session() as session:
            if record_id is None:
                return session.query(self.record_cls).all()
            elif isinstance(record_id, int):
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

    def set_groups(self, groups):
        """Add record group information to the data store.

        Parameters
        ----------
        groups : dict[int, int | None]
            Dictionary `{record_id: group_root_record_id}`. The keys should contain all
            record_ids in the data store. If multiple records are in the same group, the
            value of `group_root_id` should be the record_id of one of the record in the
            group. This data is added to the record as the `duplicate_of` attribute. The
            data store will normalize these values: One record is chosen as the root,
            satisfying `root.duplicate_of = None`. All other records in the group will
            get `record.duplicate_of = root.record_id`.

        Raises
        ------
        ValueError
            If the keys of `groups` does not consist of the full set of record_ids that
            are in the data store.
        """
        with self.Session() as session, session.begin():
            records = session.scalars(select(Record)).all()
            if set(record.record_id for record in records) != set(groups.keys()):
                raise ValueError(
                    "`groups` should be a dictionary of the form"
                    " `{record_id: group_id}` containing all record_ids in the data store."
                )
            for record in records:
                record.duplicate_of = groups[record.record_id]

    def get_groups(self):
        stmt = select(Record.record_id).group_by(
            coalesce(Record.duplicate_of, Record.record_id)
        )
        with self.Session() as session:
            return session.query(stmt).all()

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

    def search(self, query, bm25_ranking=False, limit=None, exclude=None):
        # I create the SQL command to execute as a string and not using sqlalchemy ORM
        # because SQLite FTS5 is not supported through the ORM.
        if not self.record_cls.__text_search_columns__:
            raise NotImplementedError(
                f"Record class {self.record_cls} has no searchable columns."
            )
        tablename = self.record_cls.__tablename__
        fts_tablename = f"{tablename}_fts"
        query = self.get_fts5_query_string(query)

        if bm25_ranking:
            bm25_weight_string = ", ".join(
                str(weight) for weight in self.record_cls.__bm25_weights__
            )
            ranking_string = f", bm25({fts_tablename}, {bm25_weight_string}) AS score"
            order_string = "ORDER BY score"
        else:
            ranking_string = ""
            order_string = ""
        stmt = (
            f"SELECT r.*{ranking_string}"
            f" FROM {fts_tablename}"
            f" JOIN {tablename} r ON r.record_id = {fts_tablename}.rowid"
            f" WHERE {fts_tablename} MATCH :query {order_string}"
        )

        params = [bindparam("query", value=query)]
        if exclude:
            stmt += " AND r.record_id NOT IN :exclude"
            params.append(bindparam("exclude", value=exclude, expanding=True))
        if limit is not None:
            stmt += " LIMIT :limit"
            params.append(bindparam("limit", value=int(limit)))
        stmt = select(Record).from_statement(text(stmt).bindparams(*params))
        with self.Session() as session:
            records = session.execute(stmt).scalars().all()
        return records

    def get_fts5_query_string(self, query):
        """Get a query string for use in SQLite fts5 search.

        See https://sqlite.org/fts5.html section 3 for the full fts query syntax.

        Parameters
        ----------
        query : str
            Query string.

        Returns
        -------
        str
            Escaped query string for fts. The input is wrapped in double quotes and any
            double qoute present in the query is replace by two.
        """
        return '"' + query.replace('"', '""') + '"'
