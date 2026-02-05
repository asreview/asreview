from functools import cached_property

from asreview.data.record import Record
from asreview.database.sqlstate import SQLiteState
from asreview.database.store import DataStore

__all__ = ["Database"]

CURRENT_DATABASE_VERSION = 3


def open_db(fp, read_only=False):
    """Open a database.

    Parameters
    ----------
    fp : path-like
        File path to the database
    read_only : bool, optional
        Whether to create a new database if one doesn't exist yet and whether the opened
        database will be in read only mode or not.

    Returns
    -------
    Database
        ASReview database.

    Raises
    ------
    FileNotFoundError
        If `read_only` and there is no file at `fp`.
    ValueError
        If `read_only` and there is no valid database at `fp`.
    """
    if not fp.is_file():
        if read_only:
            raise FileNotFoundError(
                f"File path {fp} is not a file and 'read_only' is 'True'"
            )
        fp.parent.mkdir(parents=True, exist_ok=True)

    db = Database(fp)
    try:
        db._is_valid()
    except ValueError as e:
        if read_only:
            raise ValueError(f"There is no valid database as {fp}") from e
        db.create_tables()
    return db


class Database:
    """Database containing the input data and results.

    Attributes
    ----------
    user_version: str
        Return the version number of the database.
    """

    def __init__(self, fp, record_cls=Record, read_only=False):
        if fp == ":memory:" and read_only:
            raise ValueError("Can't open an in-memory database in read only mode")
        self.fp = fp
        self.record_cls = record_cls
        self.read_only = read_only
        self.input = DataStore(fp, record_cls=record_cls, read_only=read_only)
        self.results = SQLiteState(fp, read_only=read_only)

    @cached_property
    def input(self):
        return DataStore(self.fp, record_cls=self._record_cls)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.results.close()

    def close(self):
        self.results.close()

    @property
    def user_version(self):
        """Version number of the state."""
        cur = self.results._conn.cursor()
        version = cur.execute("PRAGMA user_version")

        return int(version.fetchone()[0])

    @user_version.setter
    def user_version(self, version):
        cur = self.results._conn.cursor()
        cur.execute(f"PRAGMA user_version = {version}")
        self.results._conn.commit()
        cur.close()

    def create_tables(self):
        self.user_version = CURRENT_DATABASE_VERSION
        self.input.create_tables()
        self.results.create_tables()

    def _is_valid(self):
        if self.user_version != CURRENT_DATABASE_VERSION:
            raise ValueError(
                f"Database version {self.user_version} is not supported. "
                "See migration guide."
            )
        self.results._is_valid()
