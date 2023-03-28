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

from abc import ABC
from abc import abstractmethod


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
    def _create_new_state_file(self, working_dir, review_id):
        """Create empty internal structure for state.

        Arguments
        ---------
        working_dir: str, pathlib.Path
            Location of project file.
        review_id: str
            Identifier of the review.
        """
        raise NotImplementedError

    @abstractmethod
    def _restore(self, working_dir, review_id):
        """Restore state from a state file.

        Arguments
        ---------
        working_dir: str, pathlib.Path
            Location of project file.
        review_id: str
            Identifier of the review.
        """
        raise NotImplementedError

    @abstractmethod
    def add_record_table(self, record_ids):
        """Add the record table to the state.

        Arguments
        ---------
        record_ids: list-like
            List containing all record ids of the dataset.
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
    def add_last_ranking(self, ranked_record_ids, classifier,
                         query_strategy, balance_strategy, feature_extraction,
                         training_set):
        """Save the ranking of the last iteration of the model, in the ranking
        order.

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
        raise NotImplementedError

    @abstractmethod
    def get_last_probabilities(self):
        """Get the probabilities produced by the last classifier.

        Returns
        -------
        pd.Series:
            Series with name 'proba' containing the probabilities.
        """
        raise NotImplementedError

    @property
    @abstractmethod
    def settings(self):
        """Get settings from the state.
        """
        raise NotImplementedError

    @abstractmethod
    def add_note(self, note, record_id):
        """Add a text note to save with a labeled record.

        Arguments
        ---------
        note: str
            Text note to save.
        record_id: int
            Identifier of the record to which the note should be added.
        """
        raise NotImplementedError

    @abstractmethod
    def add_labeling_data(self, record_ids, labels, notes=None, prior=False):
        """Add the data corresponding to a labeling action to the state file.

        Arguments
        ---------
        record_ids: list, numpy.ndarray
            A list of ids of the labeled records as int.
        labels: list, numpy.ndarray
            A list of labels of the labeled records as int.
        notes: list of str/None
            A list of text notes to save with the labeled records.
        prior: bool
            Whether the added record are prior knowledge.
        """
        raise NotImplementedError

    def update_decision(self, record_id, label, note=None):
        """Change the label of an already labeled record.

        Arguments
        ---------
        record_id: int
            Id of the record whose label should be changed.
        label: 0 / 1
            New label of the record.
        note: str
            Note to add to the record.
        """
        raise NotImplementedError

    def get_decision_changes(self):
        """Get the record ids of the records whose labels have been changed
        after the original labeling action."""
        raise NotImplementedError

    @abstractmethod
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
            Dataframe containing the data of the specified columns of the
            results table.
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
            Series containing the query strategy used to get the record to
            query at each labeling moment.
        """
        raise NotImplementedError

    def get_balance_strategies(self):
        """Get the balance strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the balance strategy used to get the training
            data at each labeling moment.
        """
        raise NotImplementedError

    def get_feature_extraction(self):
        """Get the query strategies from the state file.

        Returns
        -------
        pd.Series:
            Series containing the feature extraction method used for the
            classifier input at each labeling moment.
        """
        raise NotImplementedError

    def get_training_sets(self):
        """Get the training_sets from the state file.

        Returns
        -------
        pd.Series:
            Series containing the training set on which the classifier was
            fit at each labeling moment.
        """
        raise NotImplementedError

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
        raise NotImplementedError

    @abstractmethod
    def close(self):
        """Close the files opened by the state.

        """
        raise NotImplementedError

    def to_dict(self):
        """Convert state to dictionary.

        Returns
        -------
        dict:
            Dictionary with all settings and results.
        """
        state_data = self.get_dataset()
        state_dict = {
            'settings': vars(self.settings),
            'data': state_data.to_dict()
        }
        return state_dict
