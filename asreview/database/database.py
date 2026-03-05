import json
import time
from functools import cached_property

import pandas as pd

from asreview.data.record import Record
from asreview.database.sqlstate import RESULTS_TABLE_COLUMNS_PANDAS_DTYPES
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
        self._set_results_changes_triggers()

    def _is_valid(self):
        if self.user_version != CURRENT_DATABASE_VERSION:
            raise ValueError(
                f"Database version {self.user_version} is not supported. "
                "See migration guide."
            )
        self.results._is_valid()

    def _set_results_changes_triggers(self):
        con = self.results._conn
        cur = con.cursor()
        cur.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_results_delete
            AFTER DELETE ON results
            FOR EACH ROW
            BEGIN
                INSERT INTO decision_changes (record_id, label, time, user_id)
                VALUES (OLD.record_id, OLD.label, OLD.time, OLD.user_id);
            END
        """)
        cur.execute("""
            CREATE TRIGGER IF NOT EXISTS trg_results_label_update
            AFTER UPDATE OF label ON results
            FOR EACH ROW
            WHEN OLD.label IS NOT NEW.label
            BEGIN
                INSERT INTO decision_changes (record_id, label, time, user_id)
                VALUES (OLD.record_id, OLD.label, OLD.time, OLD.user_id);
            END
        """)
        con.commit()

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
        return self.get_pending(user_id=user_id)

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

    def get_results_record(self, record_id):
        """Get the data of a specific query from the results table.

        Parameters
        ----------
        record_id: int
            Record id of which you want the data.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the data from the results table with the given
            record_id and columns.
        """

        result = pd.read_sql_query(
            f"SELECT * FROM results WHERE record_id={record_id}",
            self.results._conn,
            dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
        )
        result["tags"] = result["tags"].map(json.loads, na_action="ignore")
        return result

    def get_results_table(
        self, columns=None, priors=True, pending=False, whole_group=False
    ):
        """Get a subset from the results table.

        Can be used to get any column subset from the results table.
        Most other get functions use this one, except some that use a direct
        SQL query for efficiency.

        Parameters
        ----------
        columns: list, str
            List of columns names of the results table, or a string containing
            one column name.
        priors: bool
            Whether to keep the records containing the prior knowledge.
        pending: bool
            Whether to keep the records which are pending a labeling decision.
        whole_group: bool
            Return the records of a group of records. Be default only returns the base
            record of each group.

        Returns
        -------
        pd.DataFrame:
            Dataframe containing the data of the specified columns of the
            results table.
        """
        if isinstance(columns, str):
            columns = [columns]

        if (not priors) or (not pending) or (not whole_group):
            sql_where = []
            if not priors:
                sql_where.append("querier is not NULL")
            if not pending:
                sql_where.append("label is not NULL")
            if not whole_group:
                sql_where.append(
                    f"record_id IN ( SELECT group_id FROM {self.record_table_name})"
                )
            sql_where_str = "WHERE " + " AND ".join(sql_where)
        else:
            sql_where_str = ""

        if columns is None:
            col_dtype = RESULTS_TABLE_COLUMNS_PANDAS_DTYPES
        else:
            col_dtype = {
                k: v
                for k, v in RESULTS_TABLE_COLUMNS_PANDAS_DTYPES.items()
                if columns and k in columns
            }

        query_string = "*" if columns is None else ",".join(columns)
        df_results = pd.read_sql_query(
            f"SELECT {query_string} FROM results {sql_where_str} ORDER BY rowid",
            self.results._conn,
            dtype=col_dtype,
        )

        if columns is None or "tags" in columns:
            df_results["tags"] = df_results["tags"].map(json.loads, na_action="ignore")
        return df_results

    def get_priors(self):
        """Get the record ids of the priors.

        Returns
        -------
        pd.DataFrame:
            The result records of the priors in the order they were added. If multiple
            records are in the same group, only the base record of the group is
            returned.
        """
        df_results = pd.read_sql_query(
            f"""
            SELECT * FROM results
            WHERE results.querier is NULL
            AND results.label is not NULL
            AND record_id IN (
                SELECT group_id FROM {self.record_table_name}
            )
            ORDER BY rowid
            """,
            self.results._conn,
            dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
        )
        df_results["tags"] = df_results["tags"].map(json.loads, na_action="ignore")
        return df_results

    def get_pool(self):
        """Get the unlabeled, not-pending records in ranking order.

        Returns
        -------
        pd.Series
            Series containing the record_ids of the unlabeled, not pending
            records, in the order of the last available ranking. If the state does not
            yet contain a last ranking, the return value will be an empty dataframe. If
            multiple records are in the same group, only the base record of the group is
            returned.
        """

        return pd.read_sql_query(
            f"""SELECT record_id, last_ranking.ranking
                FROM last_ranking
                LEFT JOIN results
                USING (record_id)
                WHERE results.record_id is null AND last_ranking.record_id IN (
                    SELECT group_id FROM {self.record_table_name}
                )
                ORDER BY ranking
                """,
            self.results._conn,
        )["record_id"]

    def get_unlabeled(self):
        return pd.read_sql_query(
            f"""SELECT record_id, group_id, last_ranking.ranking
            FROM last_ranking
            JOIN {self.record_table_name} USING (record_id)
            LEFT JOIN results USING (record_id)
            WHERE results.record_id IS NULL OR results.label IS NULL
            ORDER BY ranking
            """,
            self.results._conn,
        )

    def get_pending(self, user_id=None):
        """Get pending records from the results table.

        Parameters
        ----------
        user_id: int
            User id of the user who labeled the records.

        Returns
        -------
        pd.DataFrame
            DataFrame with pending results records.
        """
        query = f"""SELECT * FROM results WHERE label is null AND record_id IN (
            SELECT group_id FROM {self.record_table_name}
        )"""
        params = None
        if user_id is not None:
            query += " AND user_id=?"
            params = (user_id,)
        query += " ORDER BY rowid"

        return pd.read_sql_query(
            query,
            self.results._conn,
            params=params,
            dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
        )
