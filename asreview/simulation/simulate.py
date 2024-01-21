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

__all__ = []

from datetime import datetime

import numpy as np
import pandas as pd
from tqdm import tqdm

from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import LABEL_NA
from asreview.models.balance.simple import SimpleBalance
from asreview.models.classifiers import NaiveBayesClassifier
from asreview.models.feature_extraction.tfidf import Tfidf
from asreview.models.query.max import MaxQuery
from asreview.project import open_state
from asreview.settings import ASReviewSettings
from asreview.simulation.prior_knowledge import naive_prior_knowledge
from asreview.simulation.prior_knowledge import sample_prior_knowledge


def init_results_table():
    """Initialize the results table."""
    return pd.DataFrame(
        [],
        columns=[
            "record_id",
            "label",
            "classifier",
            "query_strategy",
            "balance_strategy",
            "feature_extraction",
            "training_set",
            "labeling_time",
            "notes",
        ],
    )


class Simulate:
    """ASReview Simulation mode class.

    Arguments
    ---------
    as_data: asreview.Dataset
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
        After how many labeled records to write the simulation data to the
        state.
    """

    def __init__(
        self,
        as_data,
        project,
        classifier=NaiveBayesClassifier(),
        query_model=MaxQuery(),
        balance_model=SimpleBalance(),
        feature_model=Tfidf(),
        n_prior_included=0,
        n_prior_excluded=0,
        prior_indices=None,
        n_papers=None,
        n_instances=DEFAULT_N_INSTANCES,
        stop_if=None,
        start_idx=None,
        init_seed=None,
        write_interval=None,
        **kwargs,
    ):
        self.as_data = as_data
        self.project = project
        self.classifier = classifier
        self.balance_model = balance_model
        self.query_strategy = query_model
        self.feature_extraction = feature_model
        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        self.prior_indices = prior_indices
        self.n_instances = n_instances
        self.stop_if = stop_if
        self.start_idx = start_idx
        self.init_seed = init_seed
        self.write_interval = write_interval

        self._last_ranking = None
        self._last_probabilities = None
        self._results = init_results_table()

        if len(as_data) == 0:
            raise ValueError("Supply a dataset with at least one record.")

        labeled_idx = np.where((as_data.labels == 0) | (as_data.labels == 1))[0]
        if len(labeled_idx) != len(as_data.labels):
            raise ValueError("Expected fully labeled dataset.")

        # Get the known labels.
        self.data_labels = as_data.labels
        if self.data_labels is None:
            self.data_labels = np.full(len(as_data), LABEL_NA)

        with open_state(self.project, read_only=False):
            pass

    @property
    def settings(self):
        """Get an ASReview settings object"""
        extra_kwargs = {}
        if hasattr(self, "n_prior_included"):
            extra_kwargs["n_prior_included"] = self.n_prior_included
        if hasattr(self, "n_prior_excluded"):
            extra_kwargs["n_prior_excluded"] = self.n_prior_excluded
        return ASReviewSettings(
            model=self.classifier.name,
            query_strategy=self.query_strategy.name,
            balance_strategy=self.balance_model.name,
            feature_extraction=self.feature_extraction.name,
            n_instances=self.n_instances,
            stop_if=self.stop_if,
            model_param=self.classifier.param,
            query_param=self.query_strategy.param,
            balance_param=self.balance_model.param,
            feature_param=self.feature_extraction.param,
            **extra_kwargs,
        )

    @property
    def _feature_matrix(self):
        if not hasattr(self, "_Simulate__feature_matrix"):
            fm = self.feature_extraction.fit_transform(
                self.as_data.texts,
                self.as_data.headings,
                self.as_data.bodies,
                self.as_data.keywords,
            )

            if fm.shape[0] != len(self.as_data):
                raise ValueError(
                    f"Dataset has {len(self.as_data)} records while feature "
                    f"extractor returns {fm.shape[0]} records"
                )

            self.project.add_feature_matrix(fm, self.feature_extraction.name)

            # Check if the number or records in the feature matrix matches the
            # length of the dataset.
            if fm.shape[0] != len(self.data_labels):
                raise ValueError(
                    "The state file does not correspond to the "
                    "given data file, please use another state "
                    "file or dataset."
                )

            self.__feature_matrix = fm

        return self.__feature_matrix

    def _label_priors(self):
        """Make sure all the priors are labeled as well as the pending
        labels."""

        if self.prior_indices is not None and len(self.prior_indices) != 0:
            self.start_idx = self.prior_indices
        else:
            if (
                self.start_idx is None
                or (isinstance(self.start_idx, list) and len(self.start_idx) == 0)
            ) and self.n_prior_included + self.n_prior_excluded > 0:
                print("treuueee")
                self.start_idx = sample_prior_knowledge(
                    self.as_data.labels,
                    self.n_prior_included,
                    self.n_prior_excluded,
                    random_state=self.init_seed,
                )
            else:
                self.start_idx = naive_prior_knowledge(self.as_data.labels)

        if self.start_idx is None:
            self.start_idx = []

        self.prior_indices = self.start_idx

        with open_state(self.project, read_only=False) as state:
            # Make sure the prior records are labeled.
            labeled = state.get_labeled()
            unlabeled_priors = [
                x for x in self.prior_indices if x not in labeled["record_id"].to_list()
            ]
            labels = self.data_labels[unlabeled_priors]

            with open_state(self.project, read_only=False) as s:
                s.add_labeling_data(unlabeled_priors, labels, prior=True)

            # Make sure the pending records are labeled.
            pending = state.get_pending()
            pending_labels = self.data_labels[pending]
            state.add_labeling_data(pending, pending_labels)

    def review(self):
        with open_state(self.project, read_only=False) as s:
            # If the state is empty, add the settings.
            if s.is_empty():
                s.settings = self.settings

            # Add the record table to the state if it is not already there.
            self.record_table = s.get_record_table()
            if self.record_table.empty:
                s.add_record_table(self.as_data.record_ids)
                self.record_table = s.get_record_table()

            # Make sure the priors are labeled.
            self._label_priors()

            self.labeled = s.get_labeled()
            self.pool = pd.Series(
                [
                    record_id
                    for record_id in self.record_table
                    if record_id not in self.labeled["record_id"].values
                ]
            )
            self.training_set = len(self.labeled)

            training_sets = s.get_training_sets()
            self.total_queries = len(set(training_sets)) - 1

            # Check that both labels are available.
            if (0 not in self.labeled["label"].values) or (
                1 not in self.labeled["label"].values
            ):
                raise ValueError(
                    "Not both labels available Make sure there"
                    " is an included and excluded record in "
                    "the priors."
                )

            pending = s.get_pending()
            if not pending.empty:
                self._label(pending)

            labels_prior = s.get_labels()

        # progress bars
        pbar_rel = tqdm(
            initial=sum(labels_prior),
            total=sum(self.as_data.labels),
            desc="Relevant records found",
        )
        pbar_total = tqdm(
            initial=len(labels_prior),
            total=len(self.as_data),
            desc="Records labeled       ",
        )

        # While the stopping condition has not been met:
        while not self._stop_review():
            # Train a new model.
            self.train()

            # Query for new records to label.
            record_ids = self._query(self.n_instances)

            # Label the records.
            labels = self._label(record_ids)

            # monitor progress here
            pbar_rel.update(sum(labels))
            pbar_total.update(len(labels))

        else:
            # write to state when stopped
            pbar_rel.close()
            pbar_total.close()

        self._write_to_state()

    def _stop_review(self):
        """In simulation mode, the stop review function should get the labeled
        records list from the reviewer attribute."""

        # if the pool is empty, always stop
        if self.pool.empty:
            return True

        # If stop_if is set to min, stop when all papers in the pool are
        # irrelevant.
        if self.stop_if == "min" and (self.data_labels[self.pool] == 0).all():
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

        y_sample_input = (
            pd.DataFrame(self.record_table)
            .merge(self.labeled, how="left", on="record_id")
            .loc[:, "label"]
            .fillna(LABEL_NA)
            .to_numpy()
        )
        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        X_train, y_train = self.balance_model.sample(
            self._feature_matrix, y_sample_input, train_idx
        )

        # Fit the classifier on the trainings data.
        self.classifier.fit(X_train, y_train)

        # Use the query strategy to produce a ranking.
        ranked_record_ids, relevance_scores = self.query_strategy.query(
            self._feature_matrix,
            classifier=self.classifier,
            return_classifier_scores=True,
        )

        self._last_ranking = pd.concat(
            [pd.Series(ranked_record_ids), pd.Series(range(len(ranked_record_ids)))],
            axis=1,
        )
        self._last_ranking.columns = ["record_id", "label"]
        # The scores for the included records in the second column.
        self._last_probabilities = relevance_scores[:, 1]

        self.training_set = new_training_set

    def _query(self, n):
        """In simulation mode, the query function should get the n highest
        ranked unlabeled records, without writing the model data to the results
        table. The"""
        unlabeled_ranking = self._last_ranking[
            self._last_ranking["record_id"].isin(self.pool)
        ]

        self.total_queries += 1

        return unlabeled_ranking["record_id"].iloc[:n].to_list()

    def _label(self, record_ids, prior=False):
        """In simulation mode, the label function should also add the model
        data to the results table."""

        labels = self.data_labels[record_ids]

        results = []
        for record_id, label in zip(record_ids, labels):
            results.append(
                {
                    "record_id": int(record_id),
                    "label": int(label),
                    "classifier": self.classifier.name,
                    "query_strategy": self.query_strategy.name,
                    "balance_strategy": self.balance_model.name,
                    "feature_extraction": self.feature_extraction.name,
                    "training_set": int(self.training_set),
                    "labeling_time": str(datetime.now()),
                    "notes": None,
                }
            )

        self._results = pd.concat(
            [self._results, pd.DataFrame(results)], ignore_index=True
        )

        # Add the record ids to the labeled and remove from the pool.
        new_labeled_data = pd.DataFrame(
            zip(record_ids, labels), columns=["record_id", "label"]
        )
        self.labeled = pd.concat([self.labeled, new_labeled_data], ignore_index=True)
        self.pool = self.pool[~self.pool.isin(record_ids)]

        if (self.write_interval is not None) and (
            len(self._results) >= self.write_interval
        ):
            self._write_to_state()

        return labels

    def _write_to_state(self):
        """Write the data that has not yet been written to the state."""
        # Write the data to the state.
        if len(self._results) > 0:
            rows = [tuple(self._results.iloc[i]) for i in range(len(self._results))]
            with open_state(self.project, read_only=False) as state:
                state._add_labeling_data_simulation_mode(rows)

                state.add_last_ranking(
                    self._last_ranking["record_id"].to_numpy(),
                    self.classifier.name,
                    self.query_strategy.name,
                    self.balance_model.name,
                    self.feature_extraction.name,
                    self.training_set,
                )
                state.add_last_probabilities(self._last_probabilities)

            # Empty the results table in memory.
            self._results.drop(self._results.index, inplace=True)
