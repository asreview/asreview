from functools import cached_property
import json
import time

from asreview.data.record import Record
from asreview.database.sqlstate import SQLiteState
from asreview.database.store import DataStore

__all__ = ["Database"]

CURRENT_DATABASE_VERSION = 3

MODEL_COLUMNS = [
    "classifier",
    "querier",
    "balancer",
    "feature_extractor",
    "training_set",
]


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

    db = Database(fp, read_only=read_only)
    try:
        db._is_valid()
    except ValueError as e:
        if read_only:
            raise ValueError(
                f"There is no valid database at {fp} and the database is opened in"
                " read-only mode"
            ) from e
        db.create_tables()
    return db


class Database:
    """Database containing the input data and results.

    Database contains two parts: the input and the results. For more information on the
    input, see `asreview.database.store.py`. For more information on the results, see
    `asreview.database.sqlstate.py`.

    Attributes
    ----------
    user_version: str
        Return the version number of the database.
    """

    def __init__(self, fp, record_cls=Record, read_only=False):
        """_summary_

        Parameters
        ----------
        fp : str | Path
            Path of the database file.
        record_cls : type[asreview.data.record.Base], optional
            Type to use for the input records, see `DataStore` for more information.
        read_only : bool, optional
            Whether to open the database in read only mode. If the database is opened in
            read only mode and an attempt to write to the database is made, an
            `sqlite3.OperationalError` will be raised.
        """
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

    @property
    def record_table_name(self):
        return self.input.record_cls.__tablename__

    def label_record(self, record_id, label, tags=None, user_id=None):
        if tags is not None:
            tags = json.dumps(tags)
        labeling_time = time.time()
        con = self.results._conn
        cur = con.cursor()
        model_string = ", ".join(MODEL_COLUMNS)
        target_result_string = ", ".join(
            f"target_result.{col}" for col in MODEL_COLUMNS
        )
        upsert_columns = ["label", "time", "tags", "user_id"] + MODEL_COLUMNS
        upsert_string = ", ".join(f"{col} = excluded.{col}" for col in upsert_columns)

        cur.execute(
            f"""
            WITH target_group AS (
                SELECT record_id
                FROM {self.record_table_name}
                WHERE group_id = (
                    SELECT group_id
                    FROM {self.record_table_name}
                    WHERE record_id=:record_id
                )
            ), target_result AS (
                SELECT {model_string}
                FROM results
                WHERE record_id = :record_id
            )
            INSERT INTO results(record_id, label, time, tags, user_id, {model_string})
            SELECT target_group.record_id, :label, :time, :tags, :user_id, {target_result_string}
            FROM target_group
            LEFT JOIN target_result ON 1
            ON CONFLICT(record_id) DO UPDATE
                SET {upsert_string};
            """,
            {
                "record_id": record_id,
                "label": label,
                "time": labeling_time,
                "tags": tags,
                "user_id": user_id,
            },
        )
        con.commit()

    def query_top_ranked(self, user_id=None):
        model_string = ", ".join(MODEL_COLUMNS)
        top_record_string = ", ".join(f"top_record.{col}" for col in MODEL_COLUMNS)
        con = self.results._conn
        cur = con.cursor()
        cur.execute(
            f"""INSERT INTO results (record_id, user_id, {model_string})
            WITH top_record AS (
                SELECT last_ranking.*
                FROM last_ranking
                LEFT JOIN results USING (record_id)
                WHERE results.record_id IS NULL
                ORDER BY ranking
                LIMIT 1
            ), group_records AS (
                SELECT record.record_id
                FROM record
                WHERE group_id = (
                    SELECT group_id
                    FROM record
                    WHERE record.record_id = (SELECT record_id FROM top_record)
                )
            )
            SELECT group_records.record_id, :user_id, {top_record_string}
            FROM group_records
            CROSS JOIN top_record;""",
            {"user_id": user_id},
        )
        con.commit()

    def update_result(self, record_id, label=None, tags=None, user_id=None):
        if label is None and tags is None:
            raise ValueError("At least one of 'label' or 'tags' must be provided.")

        fields = []
        values = {"record_id": record_id}
        if label is not None:
            fields.append("label = :label")
            values["label"] = label
            if user_id is not None:
                # We only update the user_id if the label changes.
                fields.append("user_id = :user_id")
                values["user_id"] = user_id
        if tags is not None:
            fields.append("tags = :tags")
            values["tags"] = json.dumps(tags)
        set_string = ", ".join(fields)

        con = self.results._conn
        cur = con.cursor()
        cur.execute(
            f"""
            WITH target_group AS (
                SELECT record_id
                FROM {self.record_table_name}
                WHERE group_id = (
                    SELECT group_id
                    FROM {self.record_table_name}
                    WHERE record_id=:record_id
                )
            )
            UPDATE results
            SET {set_string}
            WHERE record_id IN (SELECT record_id FROM target_group)
            """,
            values,
        )
        con.commit()

    def delete_result(self, record_id):
        con = self.results._conn
        cur = con.cursor()
        cur.execute(
            f"""
            WITH target_group AS (
                SELECT record_id
                FROM {self.record_table_name}
                WHERE group_id = (
                    SELECT group_id
                    FROM {self.record_table_name}
                    WHERE record_id=:record_id
                )
            )
            DELETE FROM results
            WHERE record_id IN (SELECT record_id FROM target_group)
            """,
            {"record_id": record_id},
        )
        con.commit()
