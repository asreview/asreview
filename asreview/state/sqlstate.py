# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

__all__ = ["SQLiteState"]

import sqlite3
from datetime import datetime

import pandas as pd

from asreview.state.compatibility import check_and_update_version
from asreview.state.custom_metadata_mapper import convert_to_custom_metadata_str
from asreview.state.errors import StateError


REQUIRED_TABLES = [
    # the table with the labeling decisions and models trained
    "results",
    # the latest ranking.
    "last_ranking",
    # the record ids whose labeling decision was changed.
    "decision_changes",
]

RESULTS_TABLE_COLUMNS = [
    "record_id",
    "label",
    "classifier",
    "query_strategy",
    "balance_strategy",
    "feature_extraction",
    "training_set",
    "labeling_time",
    "notes",
    "custom_metadata_json",
]
CURRENT_STATE_VERSION = 2


class SQLiteState:
    """Class for storing the review state.

    The results are stored in a sqlite database.

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
        # Create the results table.
        cur.execute(
            """CREATE TABLE results
                            (record_id INTEGER,
                            label INTEGER,
                            classifier TEXT,
                            query_strategy TEXT,
                            balance_strategy TEXT,
                            feature_extraction TEXT,
                            training_set INTEGER,
                            labeling_time INTEGER,
                            notes TEXT,
                            custom_metadata_json TEXT)"""
        )

        # Create the last_ranking table.
        cur.execute(
            """CREATE TABLE last_ranking
                            (record_id INTEGER,
                            ranking INT,
                            classifier TEXT,
                            query_strategy TEXT,
                            balance_strategy TEXT,
                            feature_extraction TEXT,
                            training_set INTEGER,
                            time INTEGER)"""
        )

        # Create the table of changed decisions.
        cur.execute(
            """CREATE TABLE decision_changes
                            (record_id INTEGER,
                            new_label INTEGER,
                            time INTEGER)"""
        )

        self._conn.commit()

    def _is_valid_state(self):
        try:
            version = check_and_update_version(
                self.user_version, CURRENT_STATE_VERSION, self
            )
            if version != self.user_version:
                self.user_version = version
        except AttributeError as err:
            raise ValueError(f"Unexpected error when opening state file: {err}")

        cur = self._conn.cursor()
        column_names = cur.execute("PRAGMA table_info(results)").fetchall()
        table_names = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table';"
        ).fetchall()

        # Check if all required tables are present.
        table_names = [tup[0] for tup in table_names]
        missing_tables = [
            table for table in REQUIRED_TABLES if table not in table_names
        ]
        if missing_tables:
            raise StateError(
                f"The SQL file should contain tables named "
                f"'{' '.join(missing_tables)}'."
            )

        # Check if all required columns are present in results.
        column_names = [tup[1] for tup in column_names]
        missing_columns = [
            col for col in RESULTS_TABLE_COLUMNS if col not in column_names
        ]
        if missing_columns:
            raise StateError(
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
        labeled = self.get_labeled()
        last_training_set = self.get_last_ranking()["training_set"]
        if last_training_set.empty:
            return len(labeled) > 0
        else:
            return len(labeled) > last_training_set.iloc[0]

    def add_last_ranking(
        self,
        ranked_record_ids,
        classifier,
        query_strategy,
        balance_strategy,
        feature_extraction,
        training_set,
    ):
        """Save the ranking of the last iteration of the model.

        Save the ranking of the last iteration of the model, in the ranking
        order, so the record on row 0 is ranked first by the model.

        Arguments
        ---------
        ranked_record_ids: list, numpy.ndarray
            A list of records ids in the order that they were ranked.
        classifier: str
            Name of the classifier of the model.
        query_strategy: str
            Name of the query strategy of the model.
        balance_strategy: str
            Name of the balance strategy of the model.
        feature_extraction: str
            Name of the feature extraction method of the model.
        training_set: int
            Number of labeled records available at the time of training.
        """

        pd.DataFrame(
            {
                "record_id": ranked_record_ids,
                "ranking": range(len(ranked_record_ids)),
                "classifier": classifier,
                "query_strategy": query_strategy,
                "balance_strategy": balance_strategy,
                "feature_extraction": feature_extraction,
                "training_set": training_set,
                "time": datetime.now(),
            }
        ).to_sql("last_ranking", self._conn, if_exists="replace", index=False)

    def add_labeling_data(
        self, record_ids, labels, notes=None, tags_list=None, prior=False
    ):
        """Add the data corresponding to a labeling action to the state file.

        Arguments
        ---------
        record_ids: list, numpy.ndarray
            A list of ids of the labeled records as int.
        labels: list, numpy.ndarray
            A list of labels of the labeled records as int.
        notes: list of str/None
            A list of text notes to save with the labeled records.
        tags_list: list of list
            A list of tags to save with the labeled records.
        prior: bool
            Whether the added record are prior knowledge.
        """

        labeling_times = [datetime.now()] * len(record_ids)

        if notes is None:
            notes = [None for _ in record_ids]

        if tags_list is None:
            tags_list = [None for _ in record_ids]

        # Check that all input data has the same length.
        if len({len(record_ids), len(labels), len(notes), len(tags_list)}) != 1:
            raise ValueError("Input data should be of the same length.")

        custom_metadata_list = [
            convert_to_custom_metadata_str(tags=tags_list[i])
            for i, _ in enumerate(record_ids)
        ]

        n_records_labeled = len(record_ids)

        if prior:
            query_strategies = ["prior" for _ in record_ids]
            training_sets = [-1 for _ in record_ids]
            data = [
                (
                    int(record_ids[i]),
                    int(labels[i]),
                    query_strategies[i],
                    training_sets[i],
                    labeling_times[i],
                    notes[i],
                    custom_metadata_list[i],
                )
                for i in range(n_records_labeled)
            ]

            # If prior, we need to insert new records into the database.
            query = (
                "INSERT INTO results (record_id, label, query_strategy, "
                "training_set, labeling_time, notes, custom_metadata_json) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)"
            )

        else:
            data = [
                (
                    int(labels[i]),
                    labeling_times[i],
                    notes[i],
                    custom_metadata_list[i],
                    int(record_ids[i]),
                )
                for i in range(n_records_labeled)
            ]

            # If not prior, we need to update records.
            query = (
                "UPDATE results SET label=?, labeling_time=?, "
                "notes=?, custom_metadata_json=? WHERE record_id=?"
            )

        # Add the rows to the database.
        con = self._conn
        cur = con.cursor()
        cur.executemany(query, data)
        con.commit()

    def _add_labeling_data_simulation_mode(self, rows):
        """Add labeling and model data to the results table.

        Add the labeling data and the model data at the same time to the
        results table. This is used for the simulation mode, since the model
        data is available at the time of labeling.

        Arguments
        ----------
        rows : list of tuples
            List of tuples (record_id: int, label: int, classifier: str,
            query_strategy: str, balance_strategy: str, feature_extraction: str,
             training_set: int, labeling_time: int, notes: str).
        """
        query = (
            "INSERT INTO results (record_id, label, classifier, "
            "query_strategy, balance_strategy, feature_extraction, "
            "training_set, labeling_time, notes) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )

        con = self._conn
        cur = con.cursor()
        cur.executemany(query, rows)
        con.commit()

    def update_decision(self, record_id, label, note=None, tags=None):
        """Change the label of an already labeled record.

        Arguments
        ---------
        record_id: int
            Id of the record whose label should be changed.
        label: 0 / 1
            New label of the record.
        note: str
            Note to add to the record.
        tags: list
            Tags list to add to the record.
        """

        cur = self._conn.cursor()

        # Change the label.
        cur.execute(
            "UPDATE results SET label = ?, notes = ?, "
            "custom_metadata_json=? WHERE record_id = ?",
            (label, note, convert_to_custom_metadata_str(tags=tags), record_id),
        )

        # Add the change to the decision changes table.
        cur.execute(
            (
                "INSERT INTO decision_changes (record_id, new_label, time) "
                "VALUES (?, ?, ?)"
            ),
            (record_id, label, datetime.now()),
        )

        self._conn.commit()

    def delete_record_labeling_data(self, record_id):
        """Delete the labeling data for the given record id.

        Arguments
        ----------
        record_id : str
            Identifier of the record to delete.

        """
        current_time = datetime.now()

        cur = self._conn.cursor()
        cur.execute("DELETE FROM results WHERE record_id=?", (record_id,))

        # Add the change to the decision changes table.
        cur.execute(
            (
                "INSERT INTO decision_changes (record_id, new_label, time) "
                "VALUES (?,?, ?)"
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

    def get_last_ranking(self):
        """Get the ranking from the state.

        Returns
        -------
        pd.DataFrame
            Dataframe with columns 'record_id', 'ranking', 'classifier',
            'query_strategy', 'balance_strategy', 'feature_extraction',
            'training_set' and 'time'. It has one row for each record in the
            dataset, and is ordered by ranking.
        """
        return pd.read_sql_query("SELECT * FROM last_ranking", self._conn)

    def _move_ranking_data_to_results(self, record_ids):
        """Move data from the ranking to the results table.

        Move the data with the given record_ids from the last_ranking table
        to the results table.

        Arguments
        ---------
        record_ids: list
            List of record ids in last ranking whose model data should be added
            to the results table.
        """
        record_list = [(record_id,) for record_id in record_ids]
        con = self._conn
        cur = con.cursor()
        cur.executemany(
            """INSERT INTO results (record_id, classifier, query_strategy,
            balance_strategy, feature_extraction, training_set)
            SELECT record_id, classifier, query_strategy,
            balance_strategy, feature_extraction, training_set
            FROM last_ranking
            WHERE record_id=?""",
            record_list,
        )
        con.commit()

    def get_top_ranked(self, n):
        """Get the top ranked records from the ranking table.

        Get the top n instances from the pool according to the last ranking.
        Add the model data to the results table.

        Arguments
        ---------
        n: int
            Number of instances.

        Returns
        -------
        list
            List of record_ids of the top n ranked records.
        """
        return self.get_pool()[:n].to_list()

    def query_top_ranked(self, n, return_all=False):
        """Get the top ranked records from the ranking table.

        Get the top n instances from the pool according to the last ranking.
        Add the model data to the results table.

        Arguments
        ---------
        n: int
            Number of instances.

        Returns
        -------
        list
            List of record_ids of the top n ranked records.
        """
        top_n_records = self.get_pool()[:n].to_list()
        self._move_ranking_data_to_results(top_n_records)

        return top_n_records

    def get_data_by_record_id(self, record_id):
        """Get the data of a specific query from the results table.

        Arguments
        ---------
        record_id: int
            Record id of which you want the data.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the data from the results table with the given
            record_id and columns.
        """

        return pd.read_sql_query(
            f"SELECT * FROM results WHERE record_id={record_id}",
            self._conn,
        )

    def get_results_table(self, columns=None, priors=True, pending=False):
        """Get a subset from the results table.

        Can be used to get any column subset from the results table.
        Most other get functions use this one, except some that use a direct
        SQL query for efficiency.

        Arguments
        ---------
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
                sql_where.append("query_strategy is not 'prior'")
            if not pending:
                sql_where.append("label is not NULL")

            sql_where_str = f"WHERE {sql_where[0]}"
            if len(sql_where) == 2:
                sql_where_str += f" AND {sql_where[1]}"
        else:
            sql_where_str = ""

        # Query the database.
        query_string = "*" if columns is None else ",".join(columns)
        return pd.read_sql_query(
            f"SELECT {query_string} FROM results {sql_where_str}", self._conn
        )

    def get_priors(self):
        """Get the record ids of the priors.

        Returns
        -------
        pd.Series:
            The record_id's of the priors in the order they were added.
        """

        return pd.read_sql_query(
            "SELECT * FROM results WHERE query_strategy is 'prior'",
            self._conn,
        )

    def get_labels(self, priors=True, pending=False, n_labels_padding=None):
        """Get the labels from the state.

        Arguments
        ---------
        priors: bool
            Whether to keep the records containing the prior knowledge.
        pending: bool
            Whether to keep the records which are pending a labeling decision.

        Returns
        -------
        pd.Series:
            Series containing the labels at each labelling moment.
        """

        labels = self.get_results_table("label", priors=priors, pending=pending)[
            "label"
        ]

        if n_labels_padding is not None:
            labels = labels.append(pd.Series([0] * (n_labels_padding - len(labels))))

        return labels

    def get_pool(self):
        """Get the unlabeled, not-pending records in ranking order.

        Returns
        -------
        pd.Series
            Series containing the record_ids of the unlabeled, not pending
            records, in the order of the last available ranking.
        """
        return pd.read_sql_query(
            """SELECT record_id, last_ranking.ranking,
                results.query_strategy
                FROM last_ranking
                LEFT JOIN results
                USING (record_id)
                WHERE results.query_strategy is null
                ORDER BY ranking
                """,
            self._conn,
        )["record_id"]

    def get_labeled(self):
        """Get labeled records from the results table.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the record_ids and labels of the labeled
            records, in the order that they were labeled.
        """
        return pd.read_sql_query(
            """SELECT record_id, label FROM results
                WHERE label is not null
            """,
            self._conn,
        )

    def get_pending(self):
        """Get pending records from the results table.

        Returns
        -------
        pd.DataFrame
            DataFrame with pending results records.
        """
        return pd.read_sql_query(
            """SELECT * FROM results WHERE label is null""", self._conn
        )

    def get_ranking_with_labels(self):
        """Return ranking with labels is present"""

        return pd.read_sql_query(
            """SELECT
                    record_id, results.label
                FROM
                    last_ranking
                LEFT JOIN
                    results
                USING
                    (record_id)
                """,
            self._conn,
            dtype={"label": "Int64"},
        )
