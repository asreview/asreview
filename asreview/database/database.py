from asreview.data.record import Record
from asreview.database.sqlstate import SQLiteState
from asreview.database.store import DataStore

__all__ = ["Database"]

CURRENT_DATABASE_VERSION = 3


class Database:
    """Database containing the input data and results.

    Attributes
    ----------
    user_version: str
        Return the version number of the database.
    """

    def __init__(self, fp, record_cls=Record):
        self.fp = fp
        self.input = DataStore(fp, record_cls=record_cls)
        self.results = SQLiteState(fp)

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
        self.results._is_valid_state()
