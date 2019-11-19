# Copyright 2019 The ASReview Authors. All Rights Reserved.
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


class BaseLogger(ABC):
    def __init__(self, log_fp, read_only=False):
        self.log_fp = log_fp
        self.read_only = read_only
        self.settings = None
        self.restore(log_fp)

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        return str(self.to_dict())

    @abstractmethod
    def set_labels(self, y):
        """Add/set labels to logger

        If the labels do not exist, add it to the logger.

        Arguments
        ---------
        y: np.array
            One dimensional integer numpy array with inclusion labels.
        """
        raise NotImplementedError

    @abstractmethod
    def set_final_labels(self, y):
        """Add/set final labels to logger.

        If final_labels does not exist yet, add it.

        Arguments
        ---------
        y: np.array
            One dimensional integer numpy array with final inclusion labels.
        """
        raise NotImplementedError

    @abstractmethod
    def add_settings(self, settings):
        """Add settings to the logger.

        Arguments
        ---------
        settings: ASReviewSettings
            Settings object to add to the logger.
        """
        raise NotImplementedError

    @abstractmethod
    def add_classification(self, idx, labels, methods, query_i):
        """Add training indices and their labels.

        Arguments
        ---------
        indices: list, np.array
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
        indices: list, np.array
            A list of indices used for unlabeled pool.
        pred: np.array
            Array of prediction probabilities for unlabeled pool.
        i: int
            The query number.
        """
        raise NotImplementedError

    def is_empty(self):
        """Check if logger has no results.

        Returns
        -------
        bool:
            True if empty.
        """
        return self.n_queries() == 0

    @abstractmethod
    def n_queries(self):
        """Number of queries saved in the logger.

        Returns
        -------
        int:
            Number of queries.
        """
        raise NotImplementedError

    @abstractmethod
    def get(self, variable, query_i=None, idx=None):
        """Get data from the logger object.

        This is universal accessor method of the Logger classes. It can be used
        to get a variable from one specific query. In theory, it should get the
        whole data set if query_i=None, but this is not currently implemented
        in any of the Loggers.

        Arguments
        ---------
        variable: str
            Name of the variable/data to get. Options are:
            label_idx, inclusions, label_methods, labels, final_labels, proba
            , train_idx, pool_idx.
        query_i: int
            Query number, should be between 0 and self.n_queries().
        idx: int, np.array, list
            Indices to get in the returned array.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_last_query(self):
        """Delete the last query from the logger object."""
        raise NotImplementedError

    def review_state(self):
        """Get variables for reviewer to continue review.

        Returns
        -------
        np.array:
            Current labels of dataset.
        np.array:
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
                last_inclusions = self.get("inclusions", n_queries-1)
            except KeyError:
                last_inclusions = None
            if last_inclusions is None or len(last_inclusions) == 0:
                query_i -= 1
                self.delete_last_query()

        train_idx = np.array(train_idx, dtype=np.int)
        return labels, train_idx, query_src, query_i

    @abstractmethod
    def initialize_structure(self):
        """Create empty internal structure for logger"""
        raise NotImplementedError

    @abstractmethod
    def close(self):
        """Close the files opened by the logger.

        Also sets the end time if not in read-only mode.
        """
        raise NotImplementedError

    @abstractmethod
    def save(self):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        raise NotImplementedError

    @abstractmethod
    def restore(self, fp):
        """Restore or create logger from a log file.

        If the log file doesn't exist, creates and empty state that is ready
        for storage.

        Arguments
        ---------
        fp: str
            Path to file to restore/create.
        """
        raise NotImplementedError

    def to_dict(self):
        """Convert logger to dictionary.

        Returns
        -------
        dict:
            Dictionary with all relevant variables.
        """
        log_dict = {}
        log_dict["settings"] = vars(self.settings)

        global_datasets = ["labels", "final_labels"]
        for dataset in global_datasets:
            try:
                log_dict[dataset] = self.get(dataset).tolist()
            except KeyError:
                pass

        query_datasets = [
            "label_methods", "label_idx", "inclusions", "proba", "pool_idx",
            "train_idx"]
        log_dict["results"] = []
        for query_i in range(self.n_queries()):
            log_dict["results"].append({})
            for dataset in query_datasets:
                try:
                    log_dict["results"][query_i][dataset] = self.get(
                        dataset, query_i).tolist()
                except (KeyError, IndexError):
                    pass
        return log_dict
