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
from datetime import datetime

import numpy as np
import pandas as pd

from asreview.project import open_state
from asreview.review import BaseReview
from asreview.review.base import LABEL_NA
from asreview.utils import get_random_state


def sample_prior_knowledge(
        labels, n_prior_included=10,
        n_prior_excluded=10, random_state=None):
    """Function to sample prelabelled articles.

    Arguments
    ---------
    labels: np.ndarray
        Array of labels, with 1 -> included, 0 -> excluded.
    n_prior_included: int
        The number of positive labels.
    n_prior_excluded: int
        The number of negative labels.
    random_state : int, RandomState instance or None, optional (default=None)
        If int, random_state is the seed used by the random number generator;
        If RandomState instance, random_state is the random number generator;
        If None, the random number generator is the RandomState instance used
        by `np.random`.

    Returns
    -------
    np.ndarray:
        An array with n_included and n_excluded indices.

    """
    # set random state
    r = get_random_state(random_state)

    # retrieve the index of included and excluded papers
    included_idx = np.where(labels == 1)[0]
    excluded_idx = np.where(labels == 0)[0]

    if len(included_idx) < n_prior_included:
        raise ValueError(
            f"Number of included priors requested ({n_prior_included})"
            f" is bigger than number of included papers "
            f"({len(included_idx)}).")
    if len(excluded_idx) < n_prior_excluded:
        raise ValueError(
            f"Number of excluded priors requested ({n_prior_excluded})"
            f" is bigger than number of excluded papers "
            f"({len(excluded_idx)}).")
    # select randomly from included and excluded papers
    included_indexes_sample = r.choice(
        included_idx, n_prior_included, replace=False)
    excluded_indexes_sample = r.choice(
        excluded_idx, n_prior_excluded, replace=False)

    init = np.append(included_indexes_sample, excluded_indexes_sample)

    return init


class ReviewSimulate(BaseReview):
    """ASReview Simulation mode class.

    Arguments
    ---------
    as_data: asreview.ASReviewData
        The data object which contains the text, labels, etc.
    model: BaseModel
        Initialized model to fit the data during active learning.
        See asreview.models.utils.py for possible models.
    query_model: BaseQueryModel
        Initialized model to query new instances for review, such as random
        sampling or max sampling.
        See asreview.query_strategies.utils.py for query models.
    balance_model: BaseBalanceModel
        Initialized model to redistribute the training data during the
        active learning process. They might either resample or undersample
        specific papers.
    feature_model: BaseFeatureModel
        Feature extraction model that converts texts and keywords to
        feature matrices.
    n_prior_included: int
        Sample n prior included papers.
    n_prior_excluded: int
        Sample n prior excluded papers.
    prior_indices: int
        Prior indices by row number.
    n_instances: int
        Number of papers to query at each step in the active learning
        process.
    stop_if: int
        Number of steps/queries to perform. Set to None for no limit.
    start_idx: numpy.ndarray
        Start the simulation/review with these indices. They are assumed to
        be already labeled. Failing to do so might result bad behaviour.
    init_seed: int
        Seed for setting the prior indices if the --prior_idx option is
        not used. If the option prior_idx is used with one or more
        index, this option is ignored.
    state_file: str
        Path to state file.
    write_interval: int
        After how many labeled records to write away the simulation data to the
        state.
    """

    name = "simulate"

    def __init__(self,
                 as_data,
                 *args,
                 n_prior_included=0,
                 n_prior_excluded=0,
                 prior_indices=None,
                 init_seed=None,
                 write_interval=None,
                 **kwargs):

        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded

        self.write_interval = write_interval

        # check for partly labeled data
        labels = as_data.labels
        labeled_idx = np.where((labels == 0) | (labels == 1))[0]
        if len(labeled_idx) != len(labels):
            raise ValueError("Expected fully labeled dataset.")

        if prior_indices is not None and len(prior_indices) != 0:
            start_idx = prior_indices
        else:
            start_idx = as_data.prior_data_idx
            if len(start_idx) == 0 and n_prior_included + n_prior_excluded > 0:
                start_idx = sample_prior_knowledge(labels,
                                                   n_prior_included,
                                                   n_prior_excluded,
                                                   random_state=init_seed)
        super(ReviewSimulate, self).__init__(as_data,
                                             *args,
                                             start_idx=start_idx,
                                             **kwargs)

        # Setup the reviewer attributes that take over the role of state
        # functions.
        with open_state(self.project) as state:
            # Check if there is already a ranking stored in the state.
            if state.model_has_trained:
                self.last_ranking = state.get_last_ranking()
            else:
                self.last_ranking = None

            self.labeled = state.get_labeled()
            self.pool = pd.Series([
                record_id for record_id in self.record_table if record_id
                not in self.labeled['record_id'].values])
            self.training_set = len(self.labeled)

            # Get the number of queries.
            training_sets = state.get_training_sets()
            # There is one query per trained model. We subtract 1
            # for the priors.
            self.total_queries = len(set(training_sets)) - 1

            # Check that both labels are available.
            if (0 not in self.labeled['label'].values) or \
                    (1 not in self.labeled['label'].values):
                raise ValueError("Not both labels available Make sure there"
                                 " is an included and excluded record in "
                                 "the priors.")

        self.results = pd.DataFrame([], columns=[
            'record_id', 'label', 'classifier', 'query_strategy',
            'balance_strategy', 'feature_extraction', 'training_set',
            'labeling_time', 'notes'])

    def _label_priors(self):
        """Make sure all the priors are labeled as well as the pending
        labels."""
        with open_state(self.project, read_only=False) as state:
            # Make sure the prior records are labeled.
            labeled = state.get_labeled()
            unlabeled_priors = [x for x in self.prior_indices
                                if x not in labeled['record_id'].to_list()]
            labels = self.data_labels[unlabeled_priors]

            with open_state(self.project, read_only=False) as s:
                s.add_labeling_data(unlabeled_priors, labels, prior=True)

            # Make sure the pending records are labeled.
            pending = state.get_pending()
            pending_labels = self.data_labels[pending]
            state.add_labeling_data(pending, pending_labels)

    def _stop_review(self):
        """In simulation mode, the stop review function should get the labeled
        records list from the reviewer attribute."""

        # if the pool is empty, always stop
        if self.pool.empty:
            return True

        # If stop_if is set to min, stop when all papers in the pool are
        # irrelevant.
        if self.stop_if == 'min' and (self.data_labels[self.pool] == 0).all():
            return True

        # Stop when reaching stop_if (if provided)
        if isinstance(self.stop_if, int) and self.total_queries >= self.stop_if:
            return True

        return False

    def train(self):
        """Train a new model on the labeled data."""
        # Check if both labels are available is done in init for simulation.
        # Use the balance model to sample the trainings data.
        new_training_set = len(self.labeled)

        y_sample_input = pd.DataFrame(self.record_table). \
            merge(self.labeled, how='left', on='record_id'). \
            loc[:, 'label']. \
            fillna(LABEL_NA). \
            to_numpy()
        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        X_train, y_train = self.balance_model.sample(
            self.X,
            y_sample_input,
            train_idx
        )

        # Fit the classifier on the trainings data.
        self.classifier.fit(X_train, y_train)

        # Use the query strategy to produce a ranking.
        ranked_record_ids = \
            self.query_strategy.query(self.X, classifier=self.classifier)

        self.last_ranking = \
            pd.concat([pd.Series(ranked_record_ids),
                      pd.Series(range(len(ranked_record_ids)))], axis=1)
        self.last_ranking.columns = ['record_id', 'label']

        self.training_set = new_training_set

    def _query(self, n):
        """In simulation mode, the query function should get the n highest
        ranked unlabeled records, without writing the model data to the results
        table. The """
        unlabeled_ranking = self.last_ranking[
            self.last_ranking['record_id'].isin(self.pool)]

        self.total_queries += 1

        return unlabeled_ranking['record_id'].iloc[:n].to_list()

    def _label(self, record_ids, prior=False):
        """In simulation mode, the label function should also add the model
        data to the results table."""

        labels = self.data_labels[record_ids]
        labeling_time = datetime.now()

        results = []
        for record_id, label in zip(record_ids, labels):
            results.append({
                'record_id': int(record_id),
                'label': int(label),
                'classifier': self.classifier.name,
                'query_strategy': self.query_strategy.name,
                'balance_strategy': self.balance_model.name,
                'feature_extraction': self.feature_extraction.name,
                'training_set': int(self.training_set),
                'labeling_time': str(labeling_time),
                'notes': None
            })

        self.results = pd.concat([
            self.results,
            pd.DataFrame(results)
        ], ignore_index=True)

        # Add the record ids to the labeled and remove from the pool.
        new_labeled_data = pd.DataFrame(zip(record_ids, labels),
                                        columns=['record_id', 'label'])
        self.labeled = pd.concat(
            [self.labeled, new_labeled_data], ignore_index=True)
        self.pool = self.pool[~self.pool.isin(record_ids)]

        if (self.write_interval is not None) and \
                (len(self.results) >= self.write_interval):
            self._write_to_state()

    def _write_to_state(self):
        """Write the data that has not yet been written away to the state."""
        # Write the data to the state.
        if len(self.results) > 0:
            rows = [tuple(self.results.iloc[i])
                    for i in range(len(self.results))]
            with open_state(self.project, read_only=False) as state:
                state._add_labeling_data_simulation_mode(rows)

                state.add_last_ranking(
                    self.last_ranking['record_id'].to_numpy(),
                    self.classifier.name,
                    self.query_strategy.name,
                    self.balance_model.name,
                    self.feature_extraction.name,
                    self.training_set)

            # Empty the results table in memory.
            self.results.drop(self.results.index, inplace=True)
