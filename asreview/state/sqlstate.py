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

import json
import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd

from asreview.settings import ASReviewSettings
from asreview.state.base import BaseState
from asreview.state.compatibility import check_and_update_version
from asreview.state.custom_metadata_mapper import convert_to_custom_metadata_str
from asreview.state.errors import StateError
from asreview.state.errors import StateNotFoundError

try:
    from asreview._version import __version__
except ImportError:
    __version__ = "0.0.0"

REQUIRED_TABLES = [
    # the table with the labeling decisions and models trained
    "results",
    # the mapping of record identifiers to row numbers
    "record_table",
    # the latest probabilities.
    "last_probabilities",
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
SETTINGS_METADATA_KEYS = [
    "settings",
]
CURRENT_STATE_VERSION = 2


class SQLiteState(BaseState):
    """Class for storing the review state.

    The results are stored in a sqlite database.

    Attributes
    ----------
    version: str
        Return the version number of the state.
    settings: asreview.settings.ASReviewSettings
        Return an ASReview settings object with model settings and
        active learning settings.
    n_records_labeled: int
        Get the number of labeled records, where each prior is counted
        individually.
    n_priors: int
        Number of priors. If priors have not been selected returns None.
    exist_new_labeled_records: bool
        Have there been labeled records added to the state since the last time
        a model ranking was added to the state?
    """

    def _conn(self):
        """Get a connection to the SQLite database.

        Returns
        -------
        sqlite3.Connection
            Connection to the SQLite database.
        """
        if hasattr(self, "_conn_cache"):
            return self._conn_cache

        self._conn_cache = sqlite3.connect(str(self._sql_fp))
        return self._conn_cache

    @property
    def _sql_fp(self):
        """Get the path to the sqlite database."""

        return Path(self.review_dir, "results.sql")

    @property
    def _settings_metadata_fp(self):
        """Get the path to the settings and metadata json file."""

        return Path(self.review_dir, "settings_metadata.json")

    def _create_new_state_file(self, working_dir, review_id):
        """Create the files for storing a new state given an review_id.

        Stages:
        1: create result structure
        2: create model settings
        3: add state to the project file

        Arguments
        ---------
        review_dir: str, pathlib.Path
            Review folder location.
        review_id: str
            Identifier of the review.
        """

        self.review_dir = Path(working_dir, "reviews", review_id)

        # create folder in the folder `results` with the name of result_id
        self._sql_fp.parent.mkdir(parents=True, exist_ok=True)

        # Create results table.
        con = self._conn()
        self.user_version = CURRENT_STATE_VERSION

        cur = con.cursor()
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

        # Create the record table.
        cur.execute(
            """CREATE TABLE record_table
                            (record_id INT)"""
        )

        # Create the last_probabilities table.
        cur.execute(
            """CREATE TABLE last_probabilities
                            (proba REAL)"""
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

        con.commit()

        # Create settings_metadata.json file
        # content of the settings is added later
        self.settings_metadata = {
            "settings": None,
        }

        with open(self._settings_metadata_fp, "w") as f:
            json.dump(self.settings_metadata, f)

    def _restore(self, working_dir, review_id):
        """Restore a state from files.

        Arguments
        ---------
        review_dir: str, pathlib.Path
            Review folder location.
        review_id: str
            Identifier of the review.
        """
        # store filepath
        self.review_dir = Path(working_dir, "reviews", review_id)

        # If state already exist
        if not working_dir.is_dir():
            raise StateNotFoundError(f"Project {working_dir} doesn't exist.")

        if not self._sql_fp.parent.is_dir():
            raise StateNotFoundError(f"Review with id {review_id} doesn't exist.")

        # Cache the settings.
        try:
            with open(self._settings_metadata_fp) as f:
                self.settings_metadata = json.load(f)
        except FileNotFoundError:
            raise AttributeError(
                "'settings_metadata.json' not found in the state file."
            )

        self._is_valid_state()

    def _is_valid_state(self):
        try:
            version = check_and_update_version(
                self.user_version, CURRENT_STATE_VERSION, self
            )
            if version != self.user_version:
                self.user_version = version
        except AttributeError as err:
            raise ValueError(f"Unexpected error when opening state file: {err}")

        con = self._conn()
        cur = con.cursor()
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

        # Check settings_metadata contains the required keys.
        missing_keys = [
            key
            for key in SETTINGS_METADATA_KEYS
            if key not in self.settings_metadata.keys()
        ]
        if missing_keys:
            raise StateError(
                f"The keys {' '.join(missing_keys)} were not found in "
                f"settings_metadata."
            )

    def close(self):
        self._conn().close()

    # PROPERTIES
    @property
    def user_version(self):
        """Version number of the state."""
        cur = self._conn().cursor()
        version = cur.execute("PRAGMA user_version")

        return int(version.fetchone()[0])

    @user_version.setter
    def user_version(self, version):
        cur = self._conn().cursor()
        cur.execute(f"PRAGMA user_version = {version}")
        self._conn().commit()
        cur.close()

    @property
    def settings(self):
        """Settings of the ASReview pipeline.

        Example
        -------

        Example of settings.

            model             : nb
            query_strategy    : max_random
            balance_strategy  : triple
            feature_extraction: tfidf
            n_instances       : 1
            stop_if           : min
            n_prior_included  : 10
            n_prior_excluded  : 10
            mode              : simulate
            model_param       : {'alpha': 3.822}
            query_param       : {'strategy_1': 'max', 'strategy_2': 'random',
            'mix_ratio': 0.95}
            feature_param     : {}
            balance_param     : {'a': 2.155, 'alpha': 0.94, ... 'gamma': 2.0,
            'shuffle': True}
            abstract_only     : False

        """
        settings = self.settings_metadata["settings"]
        if settings is None:
            return None
        return ASReviewSettings(**settings)

    @settings.setter
    def settings(self, settings):
        if isinstance(settings, ASReviewSettings):
            self._add_settings_metadata("settings", settings.to_dict())
        else:
            raise ValueError("'settings' should be an ASReviewSettings object.")

    @property
    def n_records(self):
        """Number of records in the loop.

        Returns
        -------
        int
            Number of records.
        """
        cur = self._conn().cursor()
        cur.execute("SELECT COUNT (*) FROM record_table")
        return cur.fetchone()[0]

    @property
    def n_records_labeled(self):
        """Number labeled records.

        Returns
        -------
        int
            Number of labeled records, priors counted individually.
        """
        return len(self.get_labeled())

    @property
    def n_priors(self):
        """Number of records added as prior knowledge.

        Returns
        -------
        int
            Number of records which were added as prior knowledge.
        """
        cur = self._conn().cursor()
        cur.execute("SELECT COUNT (*) FROM results WHERE query_strategy='prior'")
        return cur.fetchone()[0]

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

    def _add_settings_metadata(self, key, value):
        """Add information to the settings_metadata dictionary."""
        self.settings_metadata[key] = value

        with open(self._settings_metadata_fp, "w") as f:
            json.dump(self.settings_metadata, f)

    def add_record_table(self, record_ids):
        """Add the record table to the state.

        Arguments
        ---------
        record_ids: list, np.array
            List containing all record ids of the dataset.
        """
        pd.DataFrame({"record_id": record_ids}).to_sql(
            "record_table", self._conn(), if_exists="replace", index=False
        )

    def add_last_probabilities(self, probabilities):
        """Save the probabilities produced by the last classifier.

        Arguments
        ---------
        probabilities: list, np.array
            List containing the relevance scores for every record.
        """

        if self.n_records != len(probabilities):
            raise ValueError(
                "The number of probabilities should be equal to the number of records."
            )

        pd.DataFrame({"proba": probabilities}).to_sql(
            "last_probabilities", self._conn(), if_exists="replace", index=False
        )

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
        record_ids = self.get_record_table()

        if len(record_ids) != len(ranked_record_ids):
            raise ValueError(
                "The ranking should have the same length as the " "record table."
            )

        ranking = range(len(record_ids))
        classifiers = [classifier for _ in record_ids]
        query_strategies = [query_strategy for _ in record_ids]
        balance_strategies = [balance_strategy for _ in record_ids]
        feature_extractions = [feature_extraction for _ in record_ids]
        training_sets = [int(training_set) for _ in record_ids]
        ranking_times = [datetime.now()] * len(record_ids)

        # Create the database rows.
        db_rows = [
            (
                int(ranked_record_ids[i]),
                int(ranking[i]),
                classifiers[i],
                query_strategies[i],
                balance_strategies[i],
                feature_extractions[i],
                training_sets[i],
                ranking_times[i],
            )
            for i in range(len(record_ids))
        ]

        con = self._conn()
        cur = con.cursor()
        cur.execute("DELETE FROM last_ranking")
        cur.executemany(
            (
                "INSERT INTO last_ranking (record_id, ranking, classifier, "
                "query_strategy, balance_strategy, feature_extraction, "
                "training_set, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            ),
            db_rows,
        )
        con.commit()

    def add_note(self, note, record_id):
        """Add a text note to save with a labeled record.

        Arguments
        ---------
        note: str
            Text note to save.
        record_id: int
            Identifier of the record to which the note should be added.
        """
        con = self._conn()
        cur = con.cursor()
        cur.execute(
            "UPDATE results SET notes = ? WHERE record_id = ?", (note, record_id)
        )
        con.commit()

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

        # Check if the state is still valid.
        self._is_valid_state()

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

        pool, _, pending = self.get_pool_labeled_pending()

        if prior:
            # Check that the record_ids are in the pool.
            if not all(record_id in pool.values for record_id in record_ids):
                raise ValueError(
                    "Labeling priors, but not all " "record_ids were found in the pool."
                )

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
            # Check that the record_ids are pending.
            if not all(record_id in pending.values for record_id in record_ids):
                raise ValueError(
                    "Labeling records, but not all record_ids were pending."
                )

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
        con = self._conn()
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

        con = self._conn()
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

        con = self._conn()
        cur = con.cursor()

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

        con.commit()

    def delete_record_labeling_data(self, record_id):
        """Delete the labeling data for the given record id.

        Arguments
        ----------
        record_id : str
            Identifier of the record to delete.

        """
        current_time = datetime.now()

        con = self._conn()
        cur = con.cursor()
        cur.execute("DELETE FROM results WHERE record_id=?", (record_id,))

        # Add the change to the decision changes table.
        cur.execute(
            (
                "INSERT INTO decision_changes (record_id, new_label, time) "
                "VALUES (?,?, ?)"
            ),
            (record_id, None, current_time),
        )
        con.commit()

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

        return pd.read_sql_query("SELECT * FROM decision_changes", self._conn())

    def get_record_table(self):
        """Get the record table of the state.

        Returns
        -------
        pd.Series:
            Series with name 'record_id' containing the record ids.
        """
        return pd.read_sql_query("SELECT * FROM record_table", self._conn())[
            "record_id"
        ]

    def get_last_probabilities(self):
        """Get the probabilities produced by the last classifier.

        Returns
        -------
        pd.Series:
            Series with name 'proba' containing the probabilities.
        """
        return pd.read_sql_query("SELECT * FROM last_probabilities", self._conn())[
            "proba"
        ]

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
        return pd.read_sql_query("SELECT * FROM last_ranking", self._conn())

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
        con = self._conn()
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

    # GET FUNCTIONS
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
            self._conn(),
        )

    def get_dataset(self, columns=None, priors=True, pending=False):
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
            f"SELECT {query_string} FROM results {sql_where_str}", self._conn()
        )

    def get_order_of_labeling(self, priors=True, pending=False):
        """Get full array of record id's in order that they were labeled.

        Arguments
        ---------
        priors: bool
            Whether to keep the records containing the prior knowledge.
        pending: bool
            Whether to keep the records are pending a labeling decision.

        Returns
        -------
        pd.Series:
            The record_id's in the order that they were labeled.
        """
        return self.get_dataset("record_id", priors=priors, pending=pending)[
            "record_id"
        ]

    def get_priors(self):
        """Get the record ids of the priors.

        Returns
        -------
        pd.Series:
            The record_id's of the priors in the order they were added.
        """

        return pd.read_sql_query(
            "SELECT * FROM results WHERE query_strategy is 'prior'",
            self._conn(),
        )

    def get_labels(self, priors=True, pending=False):
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

        return self.get_dataset("label", priors=priors, pending=pending)["label"]

    def get_training_sets(self, priors=True, pending=False):
        """Get the training_sets from the state.

        Arguments
        ---------
        priors: bool
            Whether to keep the records containing the prior knowledge.
        pending: bool
            Whether to keep the records which are pending a labeling decision.

        Returns
        -------
        pd.Series:
            Series containing the training set on which the classifier was fit
            at each labeling moment.
        """
        return self.get_dataset("training_set", priors=priors, pending=pending)[
            "training_set"
        ]

    def get_labeling_times(self, time_format="int", priors=True, pending=False):
        """Get the time of labeling from the state.

        Arguments
        ---------
        time_format: 'int' or 'datetime'
            Format of the return value. If it is 'int' you get a UTC timestamp,
            if it is 'datetime' you get datetime instead of an integer.
        priors: bool
            Whether to keep the records containing the prior knowledge.
        pending: bool
            Whether to keep the records which are pending a labeling decision.

        Returns
        -------
        pd.Series:
            If format='int' you get a UTC timestamp (integer number of
            microseconds), if it is 'datetime' you get datetime format.
        """
        times = self.get_dataset("labeling_time", priors=priors, pending=pending)[
            "labeling_time"
        ]

        # Convert time to datetime format.
        if time_format == "datetime":
            times = times.applymap(lambda x: datetime.utcfromtimestamp(x / 10**6))

        return times

    # Get pool, labeled and pending in slightly more optimized way than via
    # get_dataset.
    def get_pool(self):
        """Get the unlabeled, not-pending records in ranking order.

        Get the pool of unlabeled records, not pending a labeling decision,
        in the ranking order. If you only want the records in the pool, this
        is more efficient than via 'get_pool_labeled_pending'.

        Returns
        -------
        pd.Series
            Series containing the record_ids of the unlabeled, not pending
            records, in the order of the last available ranking.
        """
        return pd.read_sql_query(
            """SELECT last_ranking.record_id, last_ranking.ranking,
                results.query_strategy
                FROM last_ranking
                LEFT JOIN results
                ON last_ranking.record_id = results.record_id
                WHERE results.query_strategy is null
                ORDER BY ranking
                """,
            self._conn(),
        )["record_id"]

    def get_labeled(self):
        """Get the labeled records in order of labeling.

        Get the record_ids and labels of the labeled records in order of
        labeling. If you only want the labeled records, this is more efficient
        than via 'get_pool_labeled_pending'.

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
            self._conn(),
        )

    def get_pending(self):
        """Get the record_ids of the records pending a labeling decision.

        If you only want the pending records, this is more efficient
        than via 'get_pool_labeled_pending'.

        Returns
        -------
        pd.Series
            A series containing the record_ids of the records whose label is
            pending.
        """
        return pd.read_sql_query(
            """SELECT * FROM results WHERE label is null""", self._conn()
        )

    def get_pool_labeled_pending(self):
        """Return the unlabeled pool, labeled and pending records.

        Convenience function to get the pool, labeled and pending records in
        one SQL query. If you only want one of these, it is more efficient to
        use the methods 'get_pool', 'get_labeled' or 'get_pending'.

        Returns
        -------
        tuple (pd.Series, pd.DataFrame, pd.Series):
            Returns a tuple (pool, labeled, pending). Pool is a series
            containing the unlabeled, not pending record_ids, ordered by the
            last predicted ranking of the model. Labeled is a dataframe
            containing the record_ids and labels of the labeled records, in the
            order that they were labeled. Pending is a series containing the
            record_ids of the records whose label is pending.
        """

        query = """SELECT record_table.record_id, results.label,
                results.rowid AS label_order, results.query_strategy,
                last_ranking.ranking
                FROM record_table
                LEFT JOIN results
                ON results.record_id=record_table.record_id
                LEFT JOIN last_ranking
                ON record_table.record_id=last_ranking.record_id
                ORDER BY label_order, ranking
                """

        df = pd.read_sql_query(query, self._conn())

        labeled = df.loc[~df["label"].isna()].loc[:, ["record_id", "label"]].astype(int)
        pool = df.loc[df["label_order"].isna(), "record_id"].astype(int)
        pending = (
            df.loc[df["label"].isna() & ~df["query_strategy"].isna()]
            .loc[:, "record_id"]
            .astype(int)
        )

        return pool, labeled, pending
