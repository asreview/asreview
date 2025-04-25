# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import sqlite3
import time

import pandas as pd

REQUIRED_TABLES = [
    "results",
    "last_ranking",
    "decision_changes",
]

RESULTS_TABLE_COLUMNS_PANDAS_DTYPES = {
    "record_id": "Int64",
    "label": "Int64",
    "classifier": "object",
    "querier": "object",
    "balancer": "object",
    "feature_extractor": "object",
    "training_set": "Int64",
    "time": "Float64",
    "note": "object",
    "tags": "object",
    "user_id": "Int64",
}

RANKING_TABLE_COLUMNS_PANDAS_DTYPES = {
    "record_id": "Int64",
    "ranking": "Int64",
    "classifier": "object",
    "querier": "object",
    "balancer": "object",
    "feature_extractor": "object",
    "training_set": "Int64",
    "time": "Float64",
}

CURRENT_STATE_VERSION = 2


class SQLiteState:
    """Class for managing the state of the review process.

    The state is stored in a SQLite database. The state contains the results
    of the review process, the ranking of the last model, and the changes in
    the decisions.

    Parameters
    ----------
    fp: str, Path
        Path to the SQLite database file.

    Attributes
    ----------
    user_version: str
        Return the version number of the state.
    exist_new_labeled_records: bool
        Have there been labeled records added to the state since the last time
        a model ranking was added to the state?
    """

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

    def create_tables(self):
        """Create the files for storing a new state."""

        self.user_version = CURRENT_STATE_VERSION

        cur = self._conn.cursor()

        cur.execute(
            """CREATE TABLE results
                            (record_id INTEGER UNIQUE,
                            label INTEGER,
                            classifier TEXT,
                            querier TEXT,
                            balancer TEXT,
                            feature_extractor TEXT,
                            training_set INTEGER,
                            time FLOAT,
                            note TEXT,
                            tags JSON,
                            user_id INTEGER)"""
        )

        cur.execute(
            """CREATE TABLE last_ranking
                            (record_id INTEGER UNIQUE,
                            ranking INT,
                            classifier TEXT,
                            querier TEXT,
                            balancer TEXT,
                            feature_extractor TEXT,
                            training_set INTEGER,
                            time FLOAT)"""
        )

        cur.execute(
            """CREATE TABLE decision_changes
                            (record_id INTEGER,
                            new_label INTEGER,
                            time FLOAT)"""
        )

        self._conn.commit()

    def _is_valid_state(self):
        if self.user_version != CURRENT_STATE_VERSION:
            raise ValueError(
                f"State version {self.user_version} is not supported. "
                "See migration guide."
            )

        cur = self._conn.cursor()
        column_names = cur.execute("PRAGMA table_info(results)").fetchall()
        table_names = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()

        table_names = [tup[0] for tup in table_names]
        missing_tables = [
            table for table in REQUIRED_TABLES if table not in table_names
        ]
        if missing_tables:
            raise ValueError(
                f"The SQL file should contain tables named "
                f"'{' '.join(missing_tables)}'."
            )

        column_names = [tup[1] for tup in column_names]
        missing_columns = [
            col
            for col in RESULTS_TABLE_COLUMNS_PANDAS_DTYPES.keys()
            if col not in column_names
        ]
        if missing_columns:
            raise ValueError(
                f"The results table does not contain the columns "
                f"{' '.join(missing_columns)}."
            )

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

    @property
    def exist_new_labeled_records(self):
        """Return True if there are new labeled records.

        Return True if there are any record labels added since the last time
        the model ranking was added to the state. Also returns True if no
        model was trained yet, but priors have been added.
        """
        labeled = self.get_results_table("label")
        last_training_set = self.get_last_ranking_table()["training_set"]

        if last_training_set.empty or pd.isna(last_training_set.max()):
            return len(labeled) > 0
        else:
            return len(labeled) > last_training_set.max()

    def _replace_results_from_df(self, results):
        if not set(results.columns) == set(RESULTS_TABLE_COLUMNS_PANDAS_DTYPES):
            raise ValueError(
                f"Columns of the results dataframe should be "
                f"{list(RESULTS_TABLE_COLUMNS_PANDAS_DTYPES.keys())}."
            )

        cur = self._conn.cursor()
        cur.execute("delete from results")
        self._conn.commit()
        cur.close()

        results.to_sql("results", self._conn, if_exists="append", index=False)

    def _replace_last_ranking_from_df(self, last_ranking):
        if not set(last_ranking.columns) == set(RANKING_TABLE_COLUMNS_PANDAS_DTYPES):
            raise ValueError(
                f"Columns of the last ranking dataframe should be "
                f"{list(RANKING_TABLE_COLUMNS_PANDAS_DTYPES.keys())}."
            )

        last_ranking.to_sql(
            "last_ranking", self._conn, if_exists="replace", index=False
        )

    def add_last_ranking(
        self,
        ranked_record_ids,
        classifier,
        querier,
        balancer,
        feature_extractor,
        training_set=None,
    ):
        """Save the ranking of the last iteration of the model.

        Save the ranking of the last iteration of the model, in the ranking
        order, so the record on row 0 is ranked first by the model.

        Parameters
        ----------
        ranked_record_ids: list, numpy.ndarray
            A list of records ids in the order that they were ranked.
        classifier: str
            Name of the classifier of the model.
        querier: str
            Name of the query strategy of the model.
        balancer: str
            Name of the balance strategy of the model.
        feature_extractor: str
            Name of the feature extraction method of the model.
        training_set: int
            Number of labeled records available at the time of training.
        """

        pd.DataFrame(
            {
                "record_id": ranked_record_ids,
                "ranking": range(len(ranked_record_ids)),
                "classifier": classifier,
                "querier": querier,
                "balancer": balancer,
                "feature_extractor": feature_extractor,
                "training_set": training_set,
                "time": time.time(),
            }
        ).to_sql("last_ranking", self._conn, if_exists="replace", index=False)

    def add_labeling_data(self, record_ids, labels, tags=None, user_id=None):
        """Add the data corresponding to a labeling action to the state file.

        Parameters
        ----------
        record_ids: list, numpy.ndarray
            A list of ids of the labeled records as int.
        labels: list, numpy.ndarray
            A list of labels of the labeled records as int.
        tags: dict
            A dict of tags to save with the labeled records.
        user_id: int
            User id of the user who labeled the records.
        """

        if tags is None:
            tags = [None for _ in record_ids]

        if len({len(record_ids), len(labels), len(tags)}) != 1:
            raise ValueError("Input data should be of the same length.")

        if tags is None:
            tags = [None for _ in record_ids]
        elif isinstance(tags, dict):
            tags = [json.dumps(tags) for _ in record_ids]
        else:
            tags = [json.dumps(tag) for tag in tags]

        labeling_time = time.time()

        con = self._conn
        cur = con.cursor()
        cur.executemany(
            (
                """
                INSERT INTO results(record_id,label,time,tags, user_id)
                VALUES(?,?,?,?,?)
                ON CONFLICT(record_id) DO UPDATE
                    SET label=excluded.label, time=excluded.time,
                    tags=excluded.tags, user_id=excluded.user_id
            """
            ),
            [
                (
                    int(record_ids[i]),
                    int(labels[i]),
                    labeling_time,
                    tags[i],
                    user_id,
                )
                for i in range(len(record_ids))
            ],
        )

        if cur.rowcount != len(record_ids):
            raise ValueError("Failed to insert or update labels for record.")

        con.commit()

    def get_last_ranking_table(self):
        """Get the ranking from the state.

        Returns
        -------
        pd.DataFrame
            Dataframe with columns 'record_id', 'ranking', 'classifier',
            'querier', 'balancer', 'feature_extractor',
            'training_set' and 'time'. It has one row for each record in the
            dataset, and is ordered by ranking.
        """
        return pd.read_sql_query(
            "SELECT * FROM last_ranking",
            self._conn,
            dtype=RANKING_TABLE_COLUMNS_PANDAS_DTYPES,
        )

    def query_top_ranked(self, n=1, user_id=None):
        """Get the top ranked records from the ranking table.

        Get the top n instances from the pool according to the last ranking.
        Add the model data to the results table.

        Parameters
        ----------
        n: int
            Number of instances. Default is 1.
        user_id: int
            User id of the user who queries the records.

        Returns
        -------
        list
            List of record_ids of the top n ranked records.
        """

        con = self._conn
        cur = con.cursor()
        cur.execute(
            """INSERT INTO results (record_id, classifier, querier,
            balancer, feature_extractor, training_set, user_id)
            SELECT record_id, classifier, querier,
            balancer, feature_extractor, training_set, ? AS user_id
            FROM (
                SELECT last_ranking.*
                FROM last_ranking
                LEFT JOIN results
                USING (record_id)
                WHERE results.record_id is null
                ORDER BY ranking
                LIMIT ?
            )""",
            (
                user_id,
                n,
            ),
        )
        con.commit()

        if cur.rowcount != n:
            raise ValueError("Failed to query top ranked records")

        return self.get_pending(user_id=user_id)

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
            self._conn,
            dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
        )
        result["tags"] = result["tags"].map(json.loads, na_action="ignore")
        return result

    def get_results_table(self, columns=None, priors=True, pending=False):
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

        Returns
        -------
        pd.DataFrame:
            Dataframe containing the data of the specified columns of the
            results table.
        """
        if isinstance(columns, str):
            columns = [columns]

        if (not priors) or (not pending):
            sql_where = []
            if not priors:
                sql_where.append("querier is not NULL")
            if not pending:
                sql_where.append("label is not NULL")

            sql_where_str = f"WHERE {sql_where[0]}"
            if len(sql_where) == 2:
                sql_where_str += f" AND {sql_where[1]}"
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
            f"SELECT {query_string} FROM results {sql_where_str}",
            self._conn,
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
            The result records of the priors in the order they were added.
        """

        df_results = pd.read_sql_query(
            "SELECT * FROM results WHERE querier is NULL AND label is not NULL",
            self._conn,
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
            records, in the order of the last available ranking.
        """

        return pd.read_sql_query(
            """SELECT record_id, last_ranking.ranking
                FROM last_ranking
                LEFT JOIN results
                USING (record_id)
                WHERE results.record_id is null
                ORDER BY ranking
                """,
            self._conn,
        )["record_id"]

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

        if user_id is None:
            return pd.read_sql_query(
                """SELECT * FROM results WHERE label is null""",
                self._conn,
                dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
            )
        else:
            return pd.read_sql_query(
                """SELECT * FROM results WHERE label is null AND user_id=?""",
                self._conn,
                params=(user_id,),
                dtype=RESULTS_TABLE_COLUMNS_PANDAS_DTYPES,
            )

    def update(self, record_id, label=None, tags=None):
        """Change the label or tag of an already labeled record.

        Parameters
        ----------
        record_id: int
            Id of the record whose label should be changed.
        label: 0 / 1
            New label of the record.
        tags: list
            Tags list to add to the record.
        """

        cur = self._conn.cursor()

        cur.execute(
            "UPDATE results SET label = ?, tags=? WHERE record_id = ?",
            (label, json.dumps({"tags": tags}), record_id),
        )

        if cur.rowcount == 0:
            raise ValueError(f"Record with id {record_id} not found.")

        cur.execute(
            (
                "INSERT INTO decision_changes (record_id, new_label, time) "
                "VALUES (?, ?, ?)"
            ),
            (record_id, label, time.time()),
        )

        self._conn.commit()

    def update_note(self, record_id, note=None):
        """Change the note of an already labeled or pending record.

        Parameters
        ----------
        record_id: int
            Id of the record whose label should be changed.
        note: str
            Note to add to the record.
        """

        cur = self._conn.cursor()
        cur.execute(
            "UPDATE results SET note = ? WHERE record_id = ?",
            (note, record_id),
        )

        if cur.rowcount == 0:
            raise ValueError(f"Record with id {record_id} not found.")

        self._conn.commit()

    def delete_record_labeling_data(self, record_id):
        """Delete the labeling data for the given record id.

        Parameters
        ----------
        record_id : str
            Identifier of the record to delete.

        """
        current_time = time.time()

        cur = self._conn.cursor()
        cur.execute("DELETE FROM results WHERE record_id=?", (record_id,))

        cur.execute(
            (
                "INSERT INTO decision_changes (record_id, new_label, time) "
                "VALUES (?, ?, ?)"
            ),
            (record_id, None, current_time),
        )
        self._conn.commit()

    def get_decision_changes(self):
        """Get the record ids for any decision changes.

        Get the record ids of the records whose labels have been changed
        after the original labeling action.

        Returns
        -------
        pd.DataFrame
            Dataframe with columns 'record_id', 'new_label', and 'time' for
            each record of which the labeling decision was changed.
        """

        return pd.read_sql_query("SELECT * FROM decision_changes", self._conn)
