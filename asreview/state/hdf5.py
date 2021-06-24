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

from asreview.settings import ASReviewSettings
from asreview.state.base import BaseState
from asreview.state.errors import StateNotFoundError
from asreview.state.errors import StateError


# TODO (State): Time of labeling in sql.
# TODO (State): Records id's should be identifiers.


RELATIVE_RESULTS_PATH = Path('results.sql')
RELATIVE_SETTINGS_METADATA_PATH = Path('settings_metadata.json')
RELATIVE_FEATURE_MATRIX_PATH = Path('feature_matrix.npz')
LATEST_HDF5STATE_VERSION = "1.1"
REQUIRED_TABLES = ['results', 'record_table']
RESULTS_TABLE_COLUMNS = ['record_ids', 'labels', 'classifiers', 'query_strategies',
                         'balance_strategies', 'feature_extraction',
                         'training_sets', 'labeling_times']


class HDF5State(BaseState):
    """Class for storing the review state with HDF5 storage.

    Arguments
    ---------
    read_only: bool
        Open state in read only mode. Default False.
    """

    def __init__(self, read_only=True):
        super(HDF5State, self).__init__(read_only=read_only)

### INTERNAL PATHS AND CONNECTIONS
    def _connect_to_sql(self):
        """Get a connection to the sql database.

        Returns
        -------
        sqlite3.Connection
            Connection to the the sql database.
            The connection is read only if self.read_only is true.
        """
        if self.read_only:
            con = sqlite3.connect(f'file:{str(self._sql_fp)}?mode=ro', uri=True)
        else:
            con = sqlite3.connect(self._sql_fp)
        return con

    @property
    def _sql_fp(self):
        """Path to the sql database."""
        return self.fp / RELATIVE_RESULTS_PATH

    @property
    def _settings_metadata_fp(self):
        """Path to the settings and metadata json file."""
        return self.fp / RELATIVE_SETTINGS_METADATA_PATH

    @property
    def _feature_matrix_fp(self):
        """Path to the .npz file of the feature matrix"""
        return self.fp / RELATIVE_FEATURE_MATRIX_PATH

### OPEN, CLOSE, SAVE, INIT
    def _create_new_state_file(self, fp):
        if self.read_only:
            raise ValueError(
                "Can't create new state file in read_only mode."
            )

        self.fp = Path(fp)

        # create folder to state file if not exist
        self.fp.parent.mkdir(parents=True, exist_ok=True)

        # TODO(State): Add software version.
        # TODO: Add version/softwareversion to ASReviewSettings object.
        # Create settings_metadata.json
        self.settings_metadata = {
            'settings': None,
            'version': LATEST_HDF5STATE_VERSION
        }

        with open(self._settings_metadata_fp, 'w') as f:
            json.dump(self.settings_metadata, f)

        # Create results table.
        con = self._connect_to_sql()
        try:
            cur = con.cursor()

            # Create the results table.
            cur.execute('''CREATE TABLE results
                                (record_ids INTEGER,
                                labels INTEGER, 
                                classifiers TEXT,
                                query_strategies TEXT,
                                balance_strategies TEXT,
                                feature_extraction TEXT,
                                training_sets INTEGER,
                                labeling_times INTEGER)''')

            # Create the record_ids table.
            cur.execute('''CREATE TABLE record_table
                                (record_ids INT)''')

            con.commit()
            con.close()
        except sqlite3.Error as e:
            con.close()
            raise e
        # TODO (State): Models being trained.

    def _restore(self, fp):
        """Restore the state file.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path of the state file.
        """
        # If state already exist
        if not Path(fp).is_dir():
            raise StateNotFoundError(f"State file {fp} doesn't exist.")

        # store filepath
        self.fp = Path(fp)

        # Cache the settings.
        try:
            with open(self._settings_metadata_fp, self.mode) as f:
                self.settings_metadata = json.load(f)
        except FileNotFoundError:
            raise AttributeError("'settings_metadata.json' not found in the state file.")

        try:
            if not self._is_valid_version():
                raise ValueError(
                    f"State cannot be read: state version {self.version}, "
                    f"state file version {self.version}.")
        except AttributeError as err:
            raise ValueError(
                f"Unexpected error when opening state file: {err}"
            )

        self._is_valid_state()

    # TODO(State): Check more things?
    def _is_valid_state(self):
        con = self._connect_to_sql()
        cur = con.cursor()

        # Check if all required tables are present.
        table_names = cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
        table_names = [tup[0] for tup in table_names]
        for table in REQUIRED_TABLES:
            if table not in table_names:
                raise StateError(f'The sql file should contain a table named "{table}".')

        # Check if all required columns are present in results.
        column_names = cur.execute("PRAGMA table_info(results)").fetchall()
        column_names = [tup[1] for tup in column_names]
        for column in RESULTS_TABLE_COLUMNS:
            if column not in column_names:
                raise StateError(f'The results table does not contain the column {column}.')

    def close(self):
        pass

### PROPERTIES
    def _is_valid_version(self):
        """Check compatibility of state version."""
        return self.version[0] == LATEST_HDF5STATE_VERSION[0]

    @property
    def version(self):
        """Version number of the state file."""
        try:
            return self.settings_metadata['version']
        except KeyError:
            raise AttributeError("'settings_metadata.json' does not contain 'version'.")

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
            query_param       : {'strategy_1': 'max', 'strategy_2': 'random', 'mix_ratio': 0.95}
            feature_param     : {}
            balance_param     : {'a': 2.155, 'alpha': 0.94, ... 'gamma': 2.0, 'shuffle': True}
            abstract_only     : False

        """
        settings = self.settings_metadata['settings']
        if settings is None:
            return None
        return ASReviewSettings(**settings)

    @settings.setter
    def settings(self, settings):
        if isinstance(settings, ASReviewSettings):
            self._add_settings_metadata('settings', settings.to_dict())
        else:
            raise ValueError("'settings' should be an ASReviewSettings object.")

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
        self._add_settings_metadata('current_queries', str_queries)

    @property
    def n_records_labeled(self):
        """Get the number of labeled records, where each prior is counted individually."""
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute("SELECT COUNT (*) FROM results")
        n_rows = cur.fetchone()
        con.close()
        return n_rows[0]

# TODO: Should this return 0 if it is empty?
    @property
    def n_models(self):
        """Get the number of unique (classifier type + training set) models that were used. """
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute("SELECT classifiers, training_sets FROM results")
        res = cur.fetchall()
        con.close()

        classifiers = [row[0] for row in res][self.n_priors:]
        training_sets = [str(row[1]) for row in res][self.n_priors:]
        # A model is uniquely determine by the string {classifier_code}{training_set}.
        model_ids = [model + tr_set for (model, tr_set) in zip(classifiers, training_sets)]
        # Return the number of unique model_ids, plus 1 for the priors.
        return np.unique(model_ids).shape[0] + 1

    @property
    def n_priors(self):
        """Get the number of samples in the prior information.

        Returns
        -------
        int:
            Number of priors. If priors have not been selected returns None.
        """
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.execute("SELECT COUNT (*) FROM results WHERE query_strategies='prior'")
        n = cur.fetchone()
        con.close()
        n = n[0]

        if n == 0:
            return None
        return n

### Features, settings_metadata
    def _add_settings_metadata(self, key, value):
        """Add information to the settings_metadata dictionary."""
        self.settings_metadata[key] = value
        with open(self._settings_metadata_fp, self.mode) as f:
            json.dump(self.settings_metadata, f)

    # TODO(State): Input should be record table.
    def add_record_table(self, record_ids):
        # Add the record table to the sql.
        record_sql_input = [(int(record_id),) for record_id in record_ids]

        con = self._connect_to_sql()
        cur = con.cursor()
        cur.executemany("""INSERT INTO record_table VALUES
                                            (?)""", record_sql_input)
        con.commit()

    def add_feature_matrix(self, feature_matrix):
        # Make sure the feature matrix is in csr format.
        if isinstance(feature_matrix, np.ndarray):
            feature_matrix = csr_matrix(feature_matrix)
        if not isinstance(feature_matrix, csr_matrix):
            raise ValueError("The feature matrix should be of type 'np.ndarray' or 'scipy.sparse.csr.csr_matrix'.")

        save_npz(self._feature_matrix_fp, feature_matrix)

    # TODO(State): Should the feature matrix be behind a data hash?
    def get_feature_matrix(self):
        return load_npz(self._feature_matrix_fp)

# TODO (State): Add custom datasets.
# TODO (State): Add models being trained (Start with only one model at the same time).
    def add_labeling_data(self, 
                          record_ids,
                          labels, 
                          classifiers, 
                          query_strategies,
                          balance_strategies,
                          feature_extraction,
                          training_sets):
        """Add all the data of one labeling action."""
        # Check if the state is still valid.
        self._is_valid_state()

        labeling_times = [datetime.now()] * len(record_ids)

        # Check that all input data has the same length.
        lengths = [len(record_ids), len(labels), len(classifiers), len(query_strategies), len(balance_strategies), 
                   len(feature_extraction), len(training_sets), len(labeling_times)]
        if len(set(lengths)) != 1:
            raise ValueError("Input data should be of the same length.")
        n_records_labeled = len(record_ids)

        # Create the database rows.
        db_rows = [(int(record_ids[i]), int(labels[i]), classifiers[i], query_strategies[i],
                    balance_strategies[i], feature_extraction[i],
                    training_sets[i], labeling_times[i]) for i in range(n_records_labeled)]

        # Add the rows to the database.
        con = self._connect_to_sql()
        cur = con.cursor()
        cur.executemany("""INSERT INTO results VALUES
                                    (?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
        con.commit()
        con.close()
    #
    # def _record_id_to_row_index(self, record_id):
    #     """Find the row index that corresponds to a given record id.
    #
    #     Arguments
    #     ---------
    #     record_id: int
    #         Record_id of a record.
    #
    #     Returns
    #     -------
    #     int:
    #         Row index of the given record_id in the dataset.
    #     """
    #     return np.where(self.record_table == record_id)[0][0]
    #
    # def _row_index_to_record_id(self, row_index):
    #     """Find the record_id that corresponds to a given row index.
    #
    #     Arguments
    #     ----------
    #     row_index: int
    #         Row index.
    #
    #     Returns
    #     -------
    #     str:
    #         Record_id of the record with given row index.
    #
    #     """
    #     return self.record_table.iloc[row_index].item()

    def _get_record_table(self):
        """Get the record table of the state file.

        Returns
        -------
        pd.DataFrame:
            Dataframe with column 'record_ids' containing the record ids.
        """
        con = self._connect_to_sql()
        record_table = pd.read_sql_query('SELECT * FROM record_table', con)
        con.close()
        return record_table

    def _get_data_by_query_number(self, query, columns=None):
        """Get the data of a specific query from the results table.

        Arguments
        ---------
        query: int
            Number of the query of which you want the data. query=0 corresponds to all the prior records.
        columns: list
            List of columns names of the results table.

        Returns
        -------
        pd.DataFrame
            Dataframe containing the data from the results table with the given query number and columns.
        """
        if columns is not None:
            if not type(columns) == list:
                raise ValueError("The columns argument should be a list.")
        col_query_string = '*' if columns is None else ','.join(columns)

        if query == 0:
            sql_query = f"SELECT {col_query_string} FROM results WHERE query_strategies='prior'"
        else:
            rowid = query + self.n_priors
            sql_query = f"SELECT {col_query_string} FROM results WHERE rowid={rowid}"

        con = self._connect_to_sql()
        data = pd.read_sql_query(sql_query, con)
        con.close()
        return data

    def _get_data_by_record_id(self, record_id, columns=None):
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
            Dataframe containing the data from the results table with the given record_id and columns.
        """
        query_string = '*' if columns is None else ','.join(columns)

        con = self._connect_to_sql()
        data = pd.read_sql_query(f'SELECT {query_string} FROM results WHERE record_ids={record_id}', con)
        con.close()
        return data

    def get_dataset(self, columns=None):
        """Get a column from the results table.

        Arguments
        ---------
        columns: list
            List of columns names of the results table.

        Returns
        -------
        pd.DataFrame:
            Dataframe containing the data of the specified columns of the results table.
        """
        query_string = '*' if columns is None else ','.join(columns)
        con = self._connect_to_sql()
        data = pd.read_sql_query(f'SELECT {query_string} FROM results', con)
        con.close()
        return data

    # def _get_dataset(self, results_column, query=None, record_id=None):
    #     """Get a column from the results table, or only the part corresponding to a given query or record_id.
    #
    #     Arguments
    #     ---------
    #     results_column: str
    #         Name of the column of the results table you want to get.
    #     query: int
    #         Only return the data of the given query, where query=0 correspond to the prior information.
    #     record_id: str/int
    #         Only return the data corresponding to the given record_id.
    #
    #     Returns
    #     -------
    #     np.ndarray:
    #         If both query and record_id are None, return the full dataset.
    #         If query is given, return the data from that query, where the 0-th query is the prior information.
    #         If record_id is given, return the data corresponding record.
    #         If both are given it raises a ValueError.
    #     """
    #     if (query is not None) and (record_id is not None):
    #         raise ValueError("You can not search by record_id and query at the same time.")
    #
    #     if query is not None:
    #         # 0 corresponds to all priors.
    #         if query == 0:
    #             dataset_slice = range(self.n_priors)
    #         # query_i is in spot (i + n_priors - 1).
    #         else:
    #             dataset_slice = [query + self.n_priors - 1]
    #     elif record_id is not None:
    #         # Convert record id to row index.
    #         idx = self._record_id_to_row_index(record_id)
    #         # Find where this row number was labelled.
    #         dataset_slice = np.where(self.results['indices'][:] == idx)[0]
    #     else:
    #         # Return the whole dataset.
    #         dataset_slice = range(self.n_records_labeled)
    #
    #     return np.array(self.results[results_column])[dataset_slice]

    def get_order_of_labeling(self):
        """Get full array of record id's in order that they were labeled.

        Returns
        -------
        pd.DataFrame:
            The record_id's in the order that they were labeled.
        """
        return self._get_dataset(columns=['record_ids'])

    def get_labels(self, query=None, record_id=None):
        """Get the labels from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the label.
            If this is 0, you get the label for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the label.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with labels in the labeling order,
            else it returns only the specific one determined by query or record_id.
        """
        if (query is not None) and (record_id is not None):
            raise ValueError("Use either query ")
        return self._get_dataset('labels', query=query, record_id=record_id)

    def get_classifiers(self, query=None, record_id=None):
        """Get the classifiers from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the classifiers.
            If this is 0, you get the classifier for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the classifier.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with classifiers in the labeling order,
            else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(results_column='classifiers', query=query, record_id=record_id)

    def get_query_strategies(self, query=None, record_id=None):
        """Get the query strategies from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the query strategies.
            If this is 0, you get the query strategy for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the query strategy.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with query strategies in the labeling
            order, else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(results_column='query_strategies', query=query, record_id=record_id)

    def get_balance_strategies(self, query=None, record_id=None):
        """Get the balance strategies from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the balance strategies.
            If this is 0, you get the balance strategy for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the balance strategy.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with balance strategies in the labeling
            order, else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(results_column='balance_strategies', query=query, record_id=record_id)

    def get_feature_extraction(self, query=None, record_id=None):
        """Get the query strategies from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the feature extraction methods.
            If this is 0, you get the feature extraction methods for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the feature extraction method.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with feature extraction methods in the
            labeling order, else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(results_column='feature_extraction', query=query, record_id=record_id)

    def get_training_sets(self, query=None, record_id=None):
        """Get the training_sets from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the training set.
            If this is 0, you get the training set for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the training set.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with training sets in the labeling
            order, else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(results_column='training_sets', query=query, record_id=record_id)

    def get_labeling_times(self, query=None, record_id=None, format='int'):
        """Get the time of labeling the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the time.
            If this is 0, you get the time the priors were entered,
            which is the same for all priors.
        record_id: str
            The record_id of the sample from which you want to obtain the time.
        format: 'int' or 'datetime'
            Format of the return value. If it is 'int' you get a UTC timestamp ,
            if it is 'datetime' you get datetime instead of an integer.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with times in the labeling order,
            else it returns only the specific one determined by query or record_id.
            If format='int' you get a UTC timestamp (integer number of microseconds) as np.int64 dtype,
            if it is 'datetime' you get np.datetime64 format.
        """
        times = self._get_dataset('labeling_times', query=query, record_id=record_id)

        # Convert time to datetime in string format.
        if format == 'datetime':
            times = np.array([datetime.utcfromtimestamp(time/10**6) for time in times], dtype=np.datetime64)

        if query == 0:
            times = times[[self.n_priors-1]]
        return times

