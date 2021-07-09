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

from abc import ABC, abstractmethod


class BaseState(ABC):
    def __init__(self, read_only=False):
        """Abstract Base Class for state.

        read_only: bool
            Whether to open file in read only mode.
        """
        self.read_only = read_only

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        return str(self.to_dict())

    @abstractmethod
    def _create_new_state_file(self, fp):
        """Create empty internal structure for state.

        Arguments
        ---------
        fp: str
            Location of created file.
        """
        raise NotImplementedError

    @abstractmethod
    def _restore(self, fp):
        """Restore state from a state file.

        Arguments
        ---------
        fp: str
            Path to file to restore.
        """
        raise NotImplementedError

    @abstractmethod
    def add_record_table(self, record_table):
        """Add properties from as_data to the state.

        Arguments
        ---------
        record_table: list-like
            List containing all record ids of the dataset.
        """
        raise NotImplementedError

    @abstractmethod
    def add_feature_matrix(self, feature_matrix):
        """Add feature matrix to the state file.

        Arguments
        ---------
        feature_matrix: np.ndarray, sklearn.sparse.csr_matrix
            Feature matrix computed by the feature extraction model.
        """
        raise NotImplementedError

    @abstractmethod
    def get_feature_matrix(self):
        """Get feature matrix out of the state.

        Returns
        -------
        sklearn.sparse.csr_matrix:
            Feature matrix as computed by the feature extraction model.
        """
        raise NotImplementedError

    @abstractmethod
    def add_last_probabilities(self, probabilities):
        """Save the probabilities produced by the last classifier.

        Arguments
        ---------
        probabilities: list-like.
            List containing the probabilities for every record.
        """
        raise NotImplementedError

    @abstractmethod
    def get_last_probabilities(self):
        """Get the probabilities produced by the last classifier.

        Returns
        -------
        pd.DataFrame:
            Dataframe with column 'proba' containing the probabilities.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def current_queries(self):
        """Get the current queries made by the model.

        This is useful to get back exactly to the state it was in before
        shutting down a review.

        Returns
        -------
        dict:
            The last known queries according to the state file.
        """
        raise NotImplementedError

    @current_queries.setter
    @abstractmethod
    def current_queries(self, current_queries):
        """Set the current queries made by the model.

        Arguments
        ---------
        current_queries: dict
            The last known queries, with {query_idx: query_method}.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def settings(self):
        """Get settings from state
        """
        raise NotImplementedError

    @abstractmethod
    def add_labeling_data(self, record_ids, labels, classifiers, query_strategies, balance_strategies,
                          feature_extraction, training_sets):
        """Add the data corresponding to a labeling action to the state file.

        Arguments
        ---------
        record_ids: list, numpy.ndarray
            A list of indices of the labeled records as int.
        labels: list, numpy.ndarray
            A list of labels of the labeled records as int.
        classifiers: list, numpy.ndarray
            A list of the names of the classifier models as string.
        query_strategies: list, numpy.ndarray
            A list of the names of the query strategies as string.
        balance_strategies: list, numpy.ndarray
            A list of the balance strategies as string.
        feature_extraction: list, numpy.ndarray
            A list of the feature extraction methods as string.
        training_sets: list, numpy.ndarray
            A list of the training sets as integers.
            Each record in the prior data is counted individually.
        """
        raise NotImplementedError

    def is_empty(self):
        """Check if state has no results.

        Returns
        -------
        bool
            True if empty.
        """
        return self.n_records_labeled == 0

    @property
    @abstractmethod
    def n_models(self):
        """Number of unique (classifier + training set) models used.

        Returns
        -------
        int
            Number of unique models used, priors counted as one.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def n_records_labeled(self):
        """Number labeled records.

        Returns
        -------
        int
            Number of labeled records, priors counted individually.
        """
        raise NotImplementedError

    @abstractmethod
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
        raise NotImplementedError

    def get_order_of_labeling(self):
        """Get full array of record id's in order that they were labeled.

        Returns
        -------
        pd.Series:
            The record_id's in the order that they were labeled.
        """
        raise NotImplementedError

    def get_labels(self):
        """Get the labels from the state file.

        Returns
        -------
        pd.Series:
            Series containing the labels at each labelling moment.
        """
        raise NotImplementedError

    def get_classifiers(self):
        """Get the classifiers from the state file.

        Returns
        -------
        pd.Series:
            Series containing the classifier used at each labeling moment.
        """
        raise NotImplementedError

    def get_query_strategies(self):
        """Get the query strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the query strategy used to get the record to query at each labeling moment.
        """
        raise NotImplementedError

    def get_balance_strategies(self):
        """Get the balance strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the balance strategy used to get the training data at each labeling moment.
        """
        raise NotImplementedError

    def get_feature_extraction(self):
        """Get the query strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the feature extraction method used for the classifier input at each labeling moment.
        """
        raise NotImplementedError

    def get_training_sets(self):
        """Get the training_sets from the state file.

        Returns
        -------
        pd.Series:
            Series containing the training set on which the classifier was fit at each labeling moment.
        """
        raise NotImplementedError

    def get_labeling_times(self, time_format='int'):
        """Get the time of labeling the state file.

        Arguments
        ---------
        time_format: 'int' or 'datetime'
            Format of the return value. If it is 'int' you get a UTC timestamp ,
            if it is 'datetime' you get datetime instead of an integer.

        Returns
        -------
        pd.Series:
            If format='int' you get a UTC timestamp (integer number of microseconds),
            if it is 'datetime' you get datetime format.
        """
        raise NotImplementedError

    # @abstractmethod
    # def delete_last_query(self):
    #     """Delete the last query from the state object."""
    #     raise NotImplementedError
    #
    #
    # @property
    # def pred_proba(self):
    #     """Get last predicted probabilities."""
    #     for query_i in reversed(range(self.n_models)):
    #         try:
    #             proba = self.get("proba", query_i=query_i)
    #             if proba is not None:
    #                 return proba
    #         except KeyError:
    #             pass
    #     return None

    @abstractmethod
    def close(self):
        """Close the files opened by the state.

        Also sets the end time if not in read-only mode.
        """
        raise NotImplementedError

    def to_dict(self):
        """Convert state to dictionary.

        Returns
        -------
        dict:
            Dictionary with all relevant variables.
        """
        state_data = self.get_dataset()
        state_dict = {
            'settings': vars(self.settings),
            'data': state_data.to_dict()
        }
        return state_dict
