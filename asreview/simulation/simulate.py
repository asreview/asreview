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
from pathlib import Path
from uuid import uuid4

from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import LABEL_NA
from asreview.models.balance.simple import SimpleBalance
from asreview.models.classifiers import NaiveBayesClassifier
from asreview.models.feature_extraction.tfidf import Tfidf
from asreview.models.query.max_prob import MaxQuery
from asreview.simulation.prior_knowledge import naive_prior_knowledge
from asreview.simulation.prior_knowledge import sample_prior_knowledge
from asreview.state.contextmanager import open_state


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
        fm,
        labels,
        classifier=NaiveBayesClassifier(),
        query_model=MaxQuery(),
        balance_model=SimpleBalance(),
        feature_model=Tfidf(),
        n_prior_included=0,
        n_prior_excluded=0,
        prior_indices=None,
        n_instances=DEFAULT_N_INSTANCES,
        stop_if="min",
        start_idx=None,
        init_seed=None,
        **kwargs,
    ):
        self.fm = fm
        self.labels = labels

        self.classifier = classifier
        self.balance_model = balance_model
        self.query_strategy = query_model

        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        self.prior_indices = prior_indices
        self.n_instances = n_instances
        self.stop_if = stop_if
        self.start_idx = start_idx
        self.init_seed = init_seed

        self._last_ranking = None
        self._results = None

    def _label_priors(self):
        """Label the prior knowledge."""

        if self.prior_indices is not None and len(self.prior_indices) != 0:
            self.start_idx = self.prior_indices
        else:
            if (
                self.start_idx is None
                or (isinstance(self.start_idx, list) and len(self.start_idx) == 0)
            ) and self.n_prior_included + self.n_prior_excluded > 0:
                self.start_idx = sample_prior_knowledge(
                    self.labels,
                    self.n_prior_included,
                    self.n_prior_excluded,
                    random_state=self.init_seed,
                )
            else:
                self.start_idx = naive_prior_knowledge(self.labels)

        if self.start_idx is None:
            self.start_idx = []

        self._results = pd.DataFrame(
            {
                "record_id": self.start_idx,
                "label": self.labels[self.start_idx],
                "classifier": None,
                "query_strategy": "prior",
                "balance_strategy": None,
                "feature_extraction": None,
                "training_set": 0,
                "labeling_time": str(datetime.now()),
                "notes": None,
            }
        )

    def review(self):
        """Start the review process."""

        self._label_priors()

        # progress bars
        pbar_rel = tqdm(
            initial=sum(self._results["label"]),
            total=sum(self.labels),
            desc="Relevant records found",
        )
        pbar_total = tqdm(
            initial=len(self._results["label"]),
            total=len(self.labels),
            desc="Records labeled       ",
        )

        while not self._stop_review():
            self.train()

            record_ids = self.query(self.n_instances)

            self.label(record_ids)

            # update progress here
            pbar_rel.update(sum(self._results["label"]))
            pbar_total.update(len(self._results))

        else:
            pbar_rel.close()
            pbar_total.close()

    def _stop_review(self):
        """Check if the review should be stopped."""

        # if the pool is empty, always stop
        if len(self._results) == len(self.labels):
            return True

        # If stop_if is set to max, stop after stop_if queries.
        if self.stop_if == "min" and sum(self.labels) == sum(self._results["label"]):
            return True

        # Stop when reaching stop_if (if provided)
        if isinstance(self.stop_if, int) and len(self._results) >= self.stop_if:
            return True

        return False

    def train(self):
        """Train a new model on the labeled data."""

        new_training_set = len(self._results)

        y_sample_input = (
            pd.DataFrame(np.arange(self.fm.shape[0]), columns=["record_id"])
            .merge(self._results, how="left", on="record_id")
            .loc[:, "label"]
            .fillna(LABEL_NA)
            .to_numpy()
        )

        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        X_train, y_train = self.balance_model.sample(self.fm, y_sample_input, train_idx)

        # Fit the classifier on the trainings data.
        self.classifier.fit(X_train, y_train)

        # Use the query strategy to produce a ranking.
        ranked_record_ids = self.query_strategy.query(
            self.fm,
            classifier=self.classifier,
            # return_classifier_scores=True,
        )

        self._last_ranking = pd.concat(
            [pd.Series(ranked_record_ids), pd.Series(range(len(ranked_record_ids)))],
            axis=1,
        )
        self._last_ranking.columns = ["record_id", "rank"]

        self.training_set = new_training_set

    def query(self, n):
        """Query the next n records to label.

        Arguments
        ---------
        n: int
            The number of records to query.

        Returns
        -------
        list:
            The record ids to label.
        """

        df_full = self._last_ranking.merge(self._results, how="left", on="record_id")
        df_pool = df_full[df_full["label"].isnull()]

        return df_pool["record_id"].head(n).to_list()

    def label(self, record_ids):
        """Label the records with the given record_ids.

        Arguments
        ---------
        record_ids: list
            The record ids to label.

        """

        self._results = pd.concat(
            [
                self._results,
                pd.DataFrame(
                    {
                        "record_id": record_ids,
                        "label": self.labels[record_ids],
                        "classifier": self.classifier.name,
                        "query_strategy": self.query_strategy.name,
                        "balance_strategy": self.balance_model.name,
                        "feature_extraction": None,
                        "training_set": int(self.training_set),
                        "labeling_time": str(datetime.now()),
                        "notes": None,
                    }
                ),
            ],
            ignore_index=True,
        )

    def to_state(self, project, review_id=None):
        """Write the data a state in the project.

        Arguments
        ---------
        project: asreview.Project
            The project to write the data to
        review_id: str
            The review id to write the data to. If None, a new review is
            created.
        """

        if review_id is None:
            review_id = uuid4().hex

        state_fp = Path(project.project_path, "reviews", review_id, "results.sql")
        Path(state_fp.parent).mkdir(parents=True, exist_ok=True)

        project.add_review(review_id)

        # print(self._last_ranking)

        with open_state(project) as state:
            state.create_tables()

            self._results.to_sql(
                "results", state._conn, if_exists="replace", index=False
            )

            state.add_last_ranking(
                self._last_ranking["record_id"].to_numpy(),
                self.classifier.name,
                self.query_strategy.name,
                self.balance_model.name,
                None,
                self.training_set,
            )

        project.mark_review_finished()
