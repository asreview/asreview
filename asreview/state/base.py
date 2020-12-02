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
    def __init__(self, state_fp, read_only=False):
        """Initialize State instance.

        state_fp: str
            Path to state file.
        read_only: bool
            Whether to open file in read only mode.
        """
        self.state_fp = state_fp
        self.read_only = read_only
        self.restore(state_fp)

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        return str(self.to_dict())

    @abstractmethod
    def set_labels(self, y):
        """Add/set labels to state

        If the labels do not exist, add it to the state.

        Arguments
        ---------
        y: numpy.ndarray
            One dimensional integer numpy array with inclusion labels.
        """
        raise NotImplementedError

    @abstractmethod
    def set_final_labels(self, y):
        """Add/set final labels to state.

        If final_labels does not exist yet, add it.

        Arguments
        ---------
        y: numpy.ndarray
            One dimensional integer numpy array with final inclusion labels.
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

    @abstractmethod
    def get_current_queries(self):
        """Get the current queries made by the model.

        This is useful to get back exactly to the state it was in before
        shutting down a review.

        Returns
        -------
        dict:
            The last known queries according to the state file.
        """
        raise NotImplementedError

    @abstractmethod
    def set_current_queries(self, current_queries):
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
    def add_classification(self, idx, labels, methods, query_i):
        """Add training indices and their labels.

        Arguments
        ---------
        indices: list, numpy.ndarray
            A list of indices used for training.
        labels: list
            A list of labels corresponding with the training indices.
        i: int
            The query number.
        """
        raise NotImplementedError

    @abstractmethod
    def add_proba(self, pool_idx, train_idx, proba, query_i):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, numpy.ndarray
            A list of indices used for unlabeled pool.
        pred: numpy.ndarray
            Array of prediction probabilities for unlabeled pool.
        i: int
            The query number.
        """
        raise NotImplementedError

    def is_empty(self):
        """Check if state has no results.

        Returns
        -------
        bool
            True if empty.
        """
        return self.n_queries() == 0

    @abstractmethod
    def n_queries(self):
        """Number of queries saved in the state.

        Returns
        -------
        int
            Number of queries.
        """
        raise NotImplementedError

    @abstractmethod
    def get(self, variable, query_i=None, default=None, idx=None):
        """Get data from the state object.

        This is universal accessor method of the State classes. It can be used
        to get a variable from one specific query. In theory, it should get the
        whole data set if query_i=None, but this is not currently implemented
        in any of the States.

        Arguments
        ---------
        variable: str
            Name of the variable/data to get. Options are:
            label_idx, inclusions, label_methods, labels, final_labels, proba
            , train_idx, pool_idx.
        query_i: int
            Query number, should be between 0 and self.n_queries().
        idx: int, numpy.ndarray,list
            Indices to get in the returned array.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_last_query(self):
        """Delete the last query from the state object."""
        raise NotImplementedError

    def startup_vals(self):
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
        for query_i in range(self.n_queries()):
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
            n_queries = self.n_queries()
            last_inclusions = None
            try:
                last_inclusions = self.get("inclusions", n_queries - 1)
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

    def review_state(self):
        startup = self.startup_vals()
        return (startup["labals"], startup["train_idx"], startup["query_src"],
                startup["query_i"])

    @property
    def pred_proba(self):
        """Get last predicted probabilities."""
        for query_i in reversed(range(self.n_queries())):
            try:
                proba = self.get("proba", query_i=query_i)
                if proba is not None:
                    return proba
            except KeyError:
                pass
        return None

    @abstractmethod
    def initialize_structure(self):
        """Create empty internal structure for state"""
        raise NotImplementedError

    @abstractmethod
    def close(self):
        """Close the files opened by the state.

        Also sets the end time if not in read-only mode.
        """
        raise NotImplementedError

    @abstractmethod
    def save(self):
        """Save state to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        raise NotImplementedError

    @abstractmethod
    def restore(self, fp):
        """Restore or create state from a state file.

        If the state file doesn't exist, creates and empty state that is ready
        for storage.

        Arguments
        ---------
        fp: str
            Path to file to restore/create.
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

        global_datasets = ["labels", "final_labels"]
        for dataset in global_datasets:
            try:
                state_dict[dataset] = self.get(dataset).tolist()
            except KeyError:
                pass

        query_datasets = [
            "label_methods", "label_idx", "inclusions", "proba", "pool_idx",
            "train_idx"
        ]
        state_dict["results"] = []
        for query_i in range(self.n_queries()):
            state_dict["results"].append({})
            for dataset in query_datasets:
                try:
                    state_dict["results"][query_i][dataset] = self.get(
                        dataset, query_i).tolist()
                except (KeyError, IndexError):
                    pass
        return state_dict
