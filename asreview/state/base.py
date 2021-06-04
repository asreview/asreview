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

import numpy as np


class BaseState(ABC):
    def __init__(self, read_only=False):
        """Abstract Base Class for state.

        read_only: bool
            Whether to open file in read only mode.
        """
        self.read_only = read_only
        self.mode = 'r' if self.read_only else 'a'

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
    def _add_as_data(self, as_data, feature_matrix=None):
        """Add properties from as_data to the state.

        Arguments
        ---------
        as_data: ASReviewData
            Data file from which the review is run.
        feature_matrix: np.ndarray, sklearn.sparse.csr_matrix
            Feature matrix computed by the feature extraction model.
        """
        raise NotImplementedError

    @abstractmethod
    def get_feature_matrix(self, data_hash):
        """Get feature matrix out of the state.

        Arguments
        ---------
        data_hash: str
            Hash of as_data object from which the matrix is derived.

        Returns
        -------
        np.ndarray, sklearn.sparse.csr_matrix:
            Feature matrix as computed by the feature extraction model.
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
        labeling_times: list, numpy.ndarray
            A list of the labeling times as integers
            (UTC timestamp, microsecond accuracy).
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

    def get_order_of_labeling(self):
        """Get full array of record id's in order that they were labeled.

        Returns
        -------
        np.ndarray:
            The record_id's in the order that they were labeled.
        """
        raise NotImplementedError

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
        raise NotImplementedError

    def get_classifiers(self, query=None, record_id=None):
        """Get the classifiers from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the classifier.
            If this is 0, you get the model for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the classifier.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with classifiers in the labeling order,
            else it returns only the specific one determined by query or record_id.
        """
        raise NotImplementedError

    def get_query_strategies(self, query=None, record_id=None):
        """Get the query strategies from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the query strategies.
            If this is 0, you get the method for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the query strategy.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with query strategies in the labeling
            order, else it returns only the specific one determined by query or record_id.
        """
        raise NotImplementedError

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
        raise NotImplementedError

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
        raise NotImplementedError

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
        raise NotImplementedError

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
        raise NotImplementedError

    # @abstractmethod
    # def delete_last_query(self):
    #     """Delete the last query from the state object."""
    #     raise NotImplementedError

    def startup_vals(self):
        # TODO{STATE} Remove method
        """Get variables for reviewer to continue review.

        Returns
        -------
        numpy.ndarray:
            Current labels of dataset.
        numpy.ndarray:
            Current training indices.
        dict:
            Dictionary containing the sources of the labels.
        query_i:
            Currenty query number (starting from 0).
        """
        labels = self.get("labels")

        train_idx = []
        query_src = {}
        for query_i in range(self.n_models):
            try:
                label_idx = self.get("label_idx", query_i)
                labelled = self.get("inclusions", query_i)
                label_methods = self.get("label_methods", query_i)
            except (KeyError, IndexError):
                continue

            for i, meth in enumerate(label_methods):
                if meth not in query_src:
                    query_src[meth] = []
                query_src[meth].append(label_idx[i])
                labels[label_idx[i]] = labelled[i]
            train_idx.extend(label_idx)

        if query_i > 0:
            n_models = self.n_models
            last_inclusions = None
            try:
                last_inclusions = self.get("inclusions", n_models - 1)
            except KeyError:
                last_inclusions = []
            if last_inclusions is None:
                last_inclusions = []
            query_i_classified = len(last_inclusions)
        else:
            query_i_classified = 0

        train_idx = np.array(train_idx, dtype=np.int)
        startup_vals = {
            "labels": labels,
            "train_idx": np.unique(train_idx),
            "query_src": query_src,
            "query_i": query_i,
            "query_i_classified": query_i_classified,
        }
        return startup_vals

    @property
    def pred_proba(self):
        """Get last predicted probabilities."""
        for query_i in reversed(range(self.n_models)):
            try:
                proba = self.get("proba", query_i=query_i)
                if proba is not None:
                    return proba
            except KeyError:
                pass
        return None

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
        state_dict = {}
        state_dict["settings"] = vars(self.settings)
        state_dict["order_of_labeling"] = self.get_order_of_labeling().tolist()
        state_dict["labels"] = self.get_labels().tolist()
        state_dict["classifiers"] = self.get_classifiers().tolist()
        state_dict["query_strategies"] = self.get_query_strategies().tolist()
        state_dict["feature_extraction"] = self.get_feature_extraction().tolist()
        state_dict["balance_strategies"] = self.get_balance_strategies().tolist()
        state_dict["training_sets"] = self.get_training_sets().tolist()
        state_dict["labeling_times"] = self.get_labeling_times().tolist()
        return state_dict
