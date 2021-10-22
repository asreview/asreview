# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.sparse.csr import csr_matrix
from scipy.sparse import load_npz
from scipy.sparse import save_npz

from asreview._version import get_versions
from asreview.settings import ASReviewSettings
from asreview.state.base import BaseState
from asreview.state.errors import StateNotFoundError
from asreview.state.errors import StateError
from asreview.state.paths import get_sql_path
from asreview.state.paths import get_feature_matrix_path
from asreview.state.paths import get_settings_metadata_path
from asreview.state.paths import get_project_file_path


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
    "decision_changes"
]

RESULTS_TABLE_COLUMNS = [
    "record_id", "label", "classifier", "query_strategy",
    "balance_strategy", "feature_extraction", "training_set",
    "labeling_time", "notes"
]
SETTINGS_METADATA_KEYS = ["settings", "state_version", "software_version"]


# TODO(State): Update docstring.
class SqlStateV1(BaseState):
    """Class for storing the review state with HDF5 storage.

    Arguments
    ---------
    read_only: bool
        Open state in read only mode. Default False.

    Attributes
    ----------
    settings: asreview.settings.ASReviewSettings
        Return an ASReview settings object with model settings and
        active learning settings.
    n_records_labeled: int
        Get the number of labeled records, where each prior is counted
        individually.
    n_priors: int
        Number of priors. If priors have not been selected returns None.

    """
    def __init__(self, read_only=True):
        super(SqlStateV1, self).__init__(read_only=read_only)

# INTERNAL PATHS AND CONNECTIONS

    def _connect_to_sql(self):
        """Get a connection to the sql database.

        Returns
        -------
        sqlite3.Connection
            Connection to the the sql database.
            The connection is read only if self.read_only is true.
        """
        if self.read_only:
            con = sqlite3.connect(f"file:{str(self._sql_fp)}?mode=ro",
                                  uri=True)
        else:
            con = sqlite3.connect(str(self._sql_fp))
        return con

    # TODO(State): Should this be obtained from webapp/utils/paths, viceversa?
    @property
    def _sql_fp(self):
        """Path to the sql database."""
        return get_sql_path(self.working_dir, self.review_id)

    @property
    def _settings_metadata_fp(self):
        """Path to the settings and metadata json file."""
        return get_settings_metadata_path(self.working_dir, self.review_id)

    @property
    def _feature_matrix_fp(self):
        """Path to the .npz file of the feature matrix"""
        with open(self._settings_metadata_fp, "r") as f:
            feature_extraction = json.load(f)["settings"]["feature_extraction"]

        return get_feature_matrix_path(self.working_dir, feature_extraction)

    def _add_state_file_to_project(self,
                                   review_id,
                                   start_time=None,
                                   review_finished=False):

        if start_time is None:
            start_time = datetime.now()

        # Add the review to the project json.
        with open(get_project_file_path(self.working_dir), "r") as f:
            project_config = json.load(f)

        review_config = {
            "id": review_id,
            "start_time": str(start_time),
            "review_finished": review_finished
        }

        project_config["reviews"].append(review_config)

        with open(get_project_file_path(self.working_dir), "w") as f:
            json.dump(project_config, f)

    def _create_new_state_file(self, working_dir, review_id):
        """Create the files for a new state given an review_id.

        Stages:
        1: create result structure
        2: create model settings
        3: add state to the project file

        Arguments
        ---------
        working_dir: str, pathlib.Path
            Project file location.
        review_id: str
            Identifier (UUID4) of the review.
        """
        if self.read_only:
            raise ValueError("Can't create new state file in read_only mode.")

        self.working_dir = Path(working_dir)
        self.review_id = review_id

        # create folder in the folder `results` with the name of result_id
        self._sql_fp.parent.mkdir(parents=True, exist_ok=True)

        # Create results table.
        con = self._connect_to_sql()
        try:
            cur = con.cursor()

            # Create the results table.
            cur.execute("""CREATE TABLE results
                                (record_id INTEGER,
                                label INTEGER,
                                classifier TEXT,
                                query_strategy TEXT,
                                balance_strategy TEXT,
                                feature_extraction TEXT,
                                training_set INTEGER,
                                labeling_time INTEGER,
                                notes TEXT)""")

            # Create the record table.
            cur.execute("""CREATE TABLE record_table
                                (record_id INT)""")

            # Create the last_probabilities table.
            cur.execute("""CREATE TABLE last_probabilities
                                (proba REAL)""")

            # Create the last_ranking table.
            cur.execute('''CREATE TABLE last_ranking
                                (record_id INTEGER,
                                ranking INT,
                                classifier TEXT,
                                query_strategy TEXT,
                                balance_strategy TEXT,
                                feature_extraction TEXT,
                                training_set INTEGER,
                                time INTEGER)''')

            # Create the table of changed decisions.
            cur.execute('''CREATE TABLE decision_changes
                                (record_id INTEGER,
                                new_label INTEGER,
                                time INTEGER)''')

            con.commit()
            con.close()
        except sqlite3.Error as e:
            con.close()
            raise e

        # Create settings_metadata.json file
        # content of the settings is added later
        self.settings_metadata = {
            "settings": None,
            "state_version": "1",
            "software_version": get_versions()['version']
        }

        with open(self._settings_metadata_fp, "w") as f:
            json.dump(self.settings_metadata, f)

        # after succesfull init, add review_id to the project file
        self._add_state_file_to_project(review_id)

    def _restore(self, working_dir, review_id):
        """
        Initialize a state from files.

        Arguments
        ---------
        working_dir: str, pathlib.Path
            Project file location.
        review_id: str
            Identifier of the review.
        """
        # store filepath
        self.working_dir = Path(working_dir)
        self.review_id = review_id

        # If state already exist
        if not self.working_dir.is_dir():
            raise StateNotFoundError(f"Project {working_dir} doesn't exist.")

        if not self._sql_fp.parent.is_dir():
            raise StateNotFoundError(
                f"Review with id {review_id} doesn't exist.")

        # Cache the settings.
        try:
            with open(self._settings_metadata_fp, "r") as f:
                self.settings_metadata = json.load(f)
        except FileNotFoundError:
            raise AttributeError(
                "'settings_metadata.json' not found in the state file.")

        try:
            if not self._is_valid_version():
                raise ValueError(
                    f"State cannot be read: state version {self.version}, "
                    f"state file version {self.version}.")
        except AttributeError as err:
            raise ValueError(
                f"Unexpected error when opening state file: {err}")

        self._is_valid_state()

    def _is_valid_state(self):
        con = self._connect_to_sql()
        cur = con.cursor()

        # Check if all required tables are present.
        table_names = cur.execute(
            "SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        table_names = [tup[0] for tup in table_names]
        for table in REQUIRED_TABLES:
            if table not in table_names:
                raise StateError(
                    f"The sql file should contain a table named '{table}'.")

        # Check if all required columns are present in results.
        column_names = cur.execute("PRAGMA table_info(results)").fetchall()
        column_names = [tup[1] for tup in column_names]
        for column in RESULTS_TABLE_COLUMNS:
            if column not in column_names:
                raise StateError(
                    f"The results table does not contain the column {column}.")

        # Check settings_metadata contains the required keys.
        settings_metadata_keys = self.settings_metadata.keys()
        for key in SETTINGS_METADATA_KEYS:
            if key not in settings_metadata_keys:
                raise StateError(
                    f"The key {key} was not found in settings_metadata.")

    def close(self):
        pass

# PROPERTIES

    def _is_valid_version(self):
        """Check compatibility of state version."""
        return self.version[0] == "1"

    @property
    def version(self):
        """Version number of the state file.

        Returns
        -------
        str:
            Returns the version of the state file.

        """
        try:
            return self.settings_metadata["state_version"]
        except KeyError:
            raise AttributeError(
                "'settings_metadata.json' does not contain 'state_version'.")

    @property
    def settings(self):
        """Settings of the ASReview pipeline.

        Settings like models.

        Example
        -------

        Example of settings.

            model             : nb
            query_strategy    : max_random
            balance_strategy  : triple
            feature_extraction: tfidf
            n_instances       : 1
            n_queries         : 1
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
        settings = self.settings_metadata['settings']
        if settings is None:
            return None
        return ASReviewSettings(**settings)

    @settings.setter
    def settings(self, settings):
        if isinstance(settings, ASReviewSettings):
            self._add_settings_metadata("settings", settings.to_dict())
        else:
            raise ValueError(
                "'settings' should be an ASReviewSettings object.")

    @property
    def current_queries(self):
        """Get the current queries made by the model.

        This is useful to get back exactly to the state it was in before
        shutting down a review.

        Returns
        -------
        dict:
            The last known queries according to the state file.
        """
        str_queries = self.settings_metadata['current_queries']
        return {int(key): value for key, value in str_queries.items()}

    @current_queries.setter
    def current_queries(self, current_queries):
        str_queries = {
            str(key): value
            for key, value in current_queries.items()
        }
        self._add_settings_metadata("current_queries", str_queries)

    @property
    def n_records_labeled(self):
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute("SELECT COUNT (*) FROM results")
        n_rows = cur.fetchone()
        con.close()
        return n_rows[0]

    @property
    def n_priors(self):
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute(
            "SELECT COUNT (*) FROM results WHERE query_strategy='prior'")
        n = cur.fetchone()
        con.close()
        n = n[0]

        if n == 0:
            return None
        return n

    @property
    def exist_new_labeled_records(self):
        """Return True if there were records labeled since the last time the
        model training data was saved in the state."""
        # TODO(State): Add function.

    @property
    def model_has_trained(self):
        """Return True if there is data of a trained model in the state."""
        return len(self.get_last_ranking()) > 0

# Features, settings_metadata

    def _update_project_with_feature_extraction(self, feature_extraction):
        """If the feature extraction method is set, update the project.json."""
        # TODO(State): Should this always be .npz?
        feature_matrix_filename = f'{feature_extraction}_feature_matrix.npz'

        with open(get_project_file_path(self.working_dir), "r") as f:
            project_config = json.load(f)

        # Update the feature matrices section.
        all_matrices = [x['id'] for x in project_config['feature_matrices']]
        if feature_extraction not in all_matrices:
            project_config['feature_matrices'].append({
                'id':
                feature_extraction,
                'filename':
                feature_matrix_filename
            })

        with open(get_project_file_path(self.working_dir), "w") as f:
            json.dump(project_config, f)

    def _add_settings_metadata(self, key, value):
        """Add information to the settings_metadata dictionary."""
        if self.read_only:
            raise ValueError("Can't change settings in read only mode.")
        self.settings_metadata[key] = value

        # If the feature extraction method is being set, update project.json
        if key == 'settings':
            self._update_project_with_feature_extraction(
                value['feature_extraction'])

        with open(self._settings_metadata_fp, "w") as f:
            json.dump(self.settings_metadata, f)

    def add_record_table(self, record_ids):
        # Add the record table to the sql.
        record_sql_input = [(int(record_id), ) for record_id in record_ids]

        con = self._connect_to_sql()
        cur = con.cursor()
        cur.executemany(
            """INSERT INTO record_table VALUES
                                            (?)""", record_sql_input)
        con.commit()

    def add_last_probabilities(self, probabilities):
        """Save the probabilities of the last model."""
        proba_sql_input = [(proba, ) for proba in probabilities]

        con = self._connect_to_sql()
        cur = con.cursor()

        # Check that the number of rows in the table is 0 (if the table is not
        # yet populated), or that it's equal to len(probabilities).
        cur.execute("SELECT COUNT (*) FROM last_probabilities")
        proba_length = cur.fetchone()[0]
        if not ((proba_length == 0) or (proba_length == len(proba_sql_input))):
            raise ValueError(
                f"There are {proba_length} probabilities in the database, "
                f"but 'probabilities' has length {len(probabilities)}")

        cur.execute("""DELETE FROM last_probabilities""")
        cur.executemany(
            """INSERT INTO last_probabilities VALUES
                                            (?)""", proba_sql_input)
        con.commit()

    def add_last_ranking(self, record_ids, ranking, classifier,
                         query_strategy, balance_strategy, feature_extraction,
                         training_set):
        """Save the ranking of the last iteration of the model."""

        if len(record_ids) != len(ranking):
            raise ValueError("The len(record_ids) should be the same as "
                             "len(ranking).")

        classifiers = [classifier for _ in record_ids]
        query_strategies = [query_strategy for _ in record_ids]
        balance_strategies = [balance_strategy for _ in record_ids]
        feature_extractions = [feature_extraction for _ in record_ids]
        training_sets = [int(training_set) for _ in record_ids]
        ranking_times = [datetime.now()] * len(record_ids)

        # Create the database rows.
        db_rows = [(int(record_ids[i]), int(ranking[i]), classifiers[i],
                    query_strategies[i], balance_strategies[i],
                    feature_extractions[i], training_sets[i],
                    ranking_times[i])
                   for i in range(len(record_ids))]

        con = self._connect_to_sql()
        cur = con.cursor()
        cur.executemany(
            """INSERT INTO results VALUES
                                    (?, ?, ?, ?, ?, ?, ?, ?, )""", db_rows)
        con.commit()
        con.close()

    def add_feature_matrix(self, feature_matrix):
        """Add feature matrix to project file.

        Feature matrices are stored in the project file. See
        asreview.state.SqlStateV1._feature_matrix_fp for the file
        location.

        Arguments
        ---------
        feature_matrix: numpy.ndarray, scipy.sparse.csr.csr_matrix
            The feature matrix to add to the project file.
        """
        # Make sure the feature matrix is in csr format.
        if isinstance(feature_matrix, np.ndarray):
            feature_matrix = csr_matrix(feature_matrix)
        if not isinstance(feature_matrix, csr_matrix):
            raise ValueError(
                "The feature matrix should be convertible to type "
                "scipy.sparse.csr.csr_matrix.")

        save_npz(self._feature_matrix_fp, feature_matrix)

    def get_feature_matrix(self):
        """Get the feature matrix from the project file.

        Returns
        -------
        numpy.ndarray:
            Returns the feature matrix.
        """
        return load_npz(self._feature_matrix_fp)

    def add_note(self, note, record_id):
        """Add a text note to save with a labeled record."""
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute(
            "UPDATE results SET notes = ? WHERE record_id = ?",
            (note, record_id)
        )
        con.commit()
        con.close()

    def add_labeling_data(self, record_ids, labels, classifiers,
                          query_strategies, balance_strategies,
                          feature_extraction, training_sets, notes=None):
        """Add all the data of one labeling action."""

        # TODO (State): Add custom datasets.
        # TODO (State): Add models being trained.

        # Check if the state is still valid.
        self._is_valid_state()

        labeling_times = [datetime.now()] * len(record_ids)

        if notes is None:
            notes = [None for _ in record_ids]

        # Check that all input data has the same length.
        lengths = [
            len(record_ids),
            len(labels),
            len(classifiers),
            len(query_strategies),
            len(balance_strategies),
            len(feature_extraction),
            len(training_sets),
            len(labeling_times),
            len(notes)
        ]
        if len(set(lengths)) != 1:
            raise ValueError("Input data should be of the same length.")
        n_records_labeled = len(record_ids)

        # Create the database rows.
        db_rows = [(int(record_ids[i]), int(labels[i]), classifiers[i],
                    query_strategies[i], balance_strategies[i],
                    feature_extraction[i], training_sets[i],
                    labeling_times[i], notes[i])
                   for i in range(n_records_labeled)]

        # Add the rows to the database.
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.executemany(
            """INSERT INTO results VALUES
                                    (?, ?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
        con.commit()
        con.close()

    def change_decision(self, record_id):
        """Change the label of a record from 0 to 1 or vice versa."""
        current_label = self.get_data_by_record_id(record_id)['label'][0]

        # New label should be of type int, not np.int, to insert into sql.
        new_label = int(1 - current_label)
        current_time = datetime.now()

        con = self._connect_to_sql()
        cur = con.cursor()

        # Change the label.
        cur.execute(
            "UPDATE results SET label = ? WHERE record_id = ?",
            (new_label, record_id)
        )

        # Add the change to the decision changes table.
        cur.execute(
            "INSERT INTO decision_changes VALUES (?,?, ?)",
            (record_id, new_label, current_time)
        )

        con.commit()
        con.close()

    def get_decision_changes(self):
        """Get the record ids of the records whose labels have been changed
        after the original labeling action."""
        con = self._connect_to_sql()
        change_table = pd.read_sql_query('SELECT * FROM decision_changes', con)
        con.close()
        return change_table

    def get_record_table(self):
        """Get the record table of the state file.

        Returns
        -------
        pd.DataFrame:
            Dataframe with column 'record_id' containing the record ids.
        """
        con = self._connect_to_sql()
        record_table = pd.read_sql_query('SELECT * FROM record_table', con)
        con.close()
        return record_table

    def get_pool_labeled_pending(self):
        """Return the labeled and unlabeled records and the records pending a
        labeling decision.

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
        # TODO(State) Add function
        con = self._connect_to_sql()
        query = """SELECT record_table.record_id, results.label,
                results.rowid AS label_order, last_probabilities.proba
                FROM record_table
                LEFT JOIN results
                ON results.record_id=record_table.record_id
                LEFT JOIN last_probabilities
                ON record_table.rowid=last_probabilities.rowid
                """
        df = pd.read_sql_query(query, con)
        con.close()
        labeled = df.loc[~df['label'].isna()] \
            .sort_values('label_order') \
            .loc[:, ['record_id', 'label']] \
            .astype(int)
        pool = df.loc[df['label'].isna()] \
            .sort_values('proba', ascending=False) \
            .loc[:, ['record_id']] \
            .astype(int)
        return pool, labeled

    def get_last_probabilities(self):
        """Get the probabilities produced by the last classifier.

        Returns
        -------
        pd.DataFrame:
            Dataframe with column 'proba' containing the probabilities.
        """
        con = self._connect_to_sql()
        last_probabilities = pd.read_sql_query(
            'SELECT * FROM last_probabilities', con)
        con.close()
        return last_probabilities

    def get_last_ranking(self):
        """Get the ranking from the state."""
        con = self._connect_to_sql()
        last_ranking = pd.read_sql_query(
            'SELECT * FROM last_ranking', con)
        con.close()
        return last_ranking

    def _move_ranking_data_to_results(self, record_ids):
        """Move the data with the given record_ids from the last_ranking table
        to the results table.

        Arguments
        ---------
        record_ids: list
            List of record ids in last ranking whose model data should be added
            to the results table.
        """
        if self.model_has_trained:
            place_holders = ','.join(['?'] * len(record_ids))
            con = self._connect_to_sql()
            cur = con.cursor()
            cur.execute(
                f"""INSERT INTO results (record_id, classifier, query_strategy,
                balance_strategy, feature_extraction, training_set)
                SELECT record_id, classifier, query_strategy,
                balance_strategy, feature_extraction, training_set
                FROM last_ranking
                WHERE record_id IN ({place_holders})""", record_ids
            )
            con.commit()
            con.close()
        else:
            raise StateError("Save trained model data "
                             "before using this function.")

    def query_top_ranked(self, n):
        """Get the top n instances from the pool according to the last ranking.
        Add the model data to the results table.

        Arguments
        ---------
        n: int
            Number of instances.

        Returns
        -------
        np.ndarray:
            record_ids of the top n instances.
        """
        if self.model_has_trained:
            # TODO(State): Add this function.
            top_record_ids = None
            self._move_ranking_data_to_results(top_record_ids)
        else:
            raise StateError("Save trained model data "
                             "before using this function.")

        return np.ndarray(top_record_ids)

    def get_data_by_query_number(self, query, columns=None):
        """Get the data of a specific query from the results table.

        Arguments
        ---------
        query: int
            Number of the query of which you want the data. query=0 corresponds
            to all the prior records.
        columns: list
            List of columns names of the results table.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the data from the results table with the given
            query number and columns.
        """
        if columns is not None:
            if not type(columns) == list:
                raise ValueError("The columns argument should be a list.")
        col_query_string = '*' if columns is None else ','.join(columns)

        if query == 0:
            sql_query = f"SELECT {col_query_string} FROM results WHERE " \
                        f"query_strategy='prior'"
        else:
            rowid = query + self.n_priors
            sql_query = f"SELECT {col_query_string} FROM results WHERE " \
                        f"rowid={rowid}"

        con = self._connect_to_sql()
        data = pd.read_sql_query(sql_query, con)
        con.close()
        return data

    def get_data_by_record_id(self, record_id, columns=None):
        """Get the data of a specific query from the results table.

        Arguments
        ---------
        record_id: int
            Record id of which you want the data.
        columns: list
            List of columns names of the results table.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the data from the results table with the given
            record_id and columns.
        """
        query_string = '*' if columns is None else ','.join(columns)

        con = self._connect_to_sql()
        data = pd.read_sql_query(
            f'SELECT {query_string} FROM results WHERE record_id={record_id}',
            con)
        con.close()
        return data

    def get_dataset(self, columns=None):
        """Get a column from the results table.

        Arguments
        ---------
        columns: list, str
            List of columns names of the results table, or a string containing
            one column name.

        Returns
        -------
        pd.DataFrame:
            Dataframe containing the data of the specified columns of the
            results table.
        """
        if type(columns) == str:
            columns = [columns]
        query_string = '*' if columns is None else ','.join(columns)
        con = self._connect_to_sql()
        data = pd.read_sql_query(f'SELECT {query_string} FROM results', con)
        con.close()
        return data

    def get_order_of_labeling(self):
        """Get full array of record id's in order that they were labeled.

        Returns
        -------
        pd.Series:
            The record_id's in the order that they were labeled.
        """
        return self.get_dataset('record_id')['record_id']

    def get_priors(self):
        """Get the record ids of the priors.

        Returns
        -------
        pd.Series:
            The record_id's of the priors in the order they were added.
        """
        return self.get_order_of_labeling()[:self.n_priors]

    def get_labels(self):
        """Get the labels from the state file.

        Returns
        -------
        pd.Series:
            Series containing the labels at each labelling moment.
        """
        return self.get_dataset('label')['label']

    def get_classifiers(self):
        """Get the classifiers from the state file.

        Returns
        -------
        pd.Series:
            Series containing the classifier used at each labeling moment.
        """
        return self.get_dataset('classifier')['classifier']

    def get_query_strategies(self):
        """Get the query strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the query strategy used to get the record to
            query at each labeling moment.
        """
        return self.get_dataset('query_strategy')['query_strategy']

    def get_balance_strategies(self):
        """Get the balance strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the balance strategy used to get the training
            data at each labeling moment.
        """
        return self.get_dataset('balance_strategy')['balance_strategy']

    def get_feature_extraction(self):
        """Get the query strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the feature extraction method used for the
            classifier input at each labeling moment.
        """
        return self.get_dataset('feature_extraction')['feature_extraction']

    def get_training_sets(self):
        """Get the training_sets from the state file.

        Returns
        -------
        pd.Series:
            Series containing the training set on which the classifier was fit
            at each labeling moment.
        """
        return self.get_dataset('training_set')['training_set']

    def get_labeling_times(self, time_format='int'):
        """Get the time of labeling the state file.

        Arguments
        ---------
        time_format: 'int' or 'datetime'
            Format of the return value. If it is 'int' you get a UTC timestamp,
            if it is 'datetime' you get datetime instead of an integer.

        Returns
        -------
        pd.Series:
            If format='int' you get a UTC timestamp (integer number of
            microseconds), if it is 'datetime' you get datetime format.
        """
        times = self.get_dataset('labeling_time')['labeling_time']

        # Convert time to datetime format.
        if time_format == 'datetime':
            times = times.applymap(
                lambda x: datetime.utcfromtimestamp(x / 10**6))

        return times
