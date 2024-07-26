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
from sklearn.utils import check_random_state
from tqdm import tqdm

from asreview.config import DEFAULT_N_INSTANCES
from asreview.config import LABEL_NA
from asreview.state.contextmanager import open_state


class Simulate:
    """ASReview Simulation mode class.

    The simulation will stop when all papers have been labeled or when the number of
    steps/queries reaches the stop_if parameter.

    To seed the simulation, provide the seed to the classifier, query strategy,
    feature extraction model, and balance strategy or use a global random seed.

    Arguments
    ---------
    fm: numpy.ndarray
        The feature matrix to use for the simulation.
    labels: numpy.ndarray, pandas.Series, list
        The labels to use for the simulation.
    classifier: BaseModel
        The initialized classifier to use for the simulation.
    query_strategy: BaseQueryModel
        The initialized query strategy to use for the simulation.
    balance_strategy: BaseBalanceModel
        The initialized balance strategy to use for the simulation.
    feature_extraction: BaseFeatureModel
        The initialized feature extraction model to use for the simulation. If None,
        the name of the feature extraction model is set to None.
    n_instances: int
        Number of papers to query at each step in the active learning
        process. Default is 1.
    stop_if: int
        Number of steps/queries to perform. Set to None for no limit. Default
        is None.
    """

    def __init__(
        self,
        fm,
        labels,
        classifier,
        query_strategy,
        balance_strategy=None,
        feature_extraction=None,
        n_instances=DEFAULT_N_INSTANCES,
        stop_if="min",
    ):
        self.fm = fm
        self.labels = labels
        self.classifier = classifier
        self.balance_strategy = balance_strategy
        self.query_strategy = query_strategy
        self.feature_extraction = feature_extraction
        self.n_instances = n_instances
        self.stop_if = stop_if

    @property
    def _results(self):
        if not hasattr(self, "_Simulate__results"):
            raise AttributeError("No results. Label records or call review.")
        return self._Simulate__results

    @_results.setter
    def _results(self, value):
        self._Simulate__results = value

    @property
    def _last_ranking(self):
        if not hasattr(self, "_Simulate__last_ranking"):
            raise AttributeError("No last ranking. Call train or review.")
        return self._Simulate__last_ranking

    @_last_ranking.setter
    def _last_ranking(self, value):
        self._Simulate__last_ranking = value

    def _stop_review(self):
        """Check if the review should be stopped."""

        try:
            # if the pool is empty, always stop
            if len(self._results) == len(self.labels):
                return True

            # If stop_if is set to min, stop after stop_if queries.
            if self.stop_if == "min" and sum(self.labels) == sum(
                self._results["label"]
            ):
                return True

            # Stop when reaching stop_if (if provided)
            if isinstance(self.stop_if, int) and len(self._results) >= self.stop_if:
                return True
        except AttributeError:
            if len(self.labels) == 0:
                return True

        return False

    def review(self):
        """Start the review process."""

        if not hasattr(self, "_results") or (
            not (self._results["label"] == 1).any()
            or not (self._results["label"] == 0).any()
        ):
            argmin_bin = max(
                np.where(self.labels == 1)[0].min(), np.where(self.labels == 0)[0].min()
            )

            try:
                new_idx = list(
                    set(np.arange(argmin_bin + 1)) - set(self._results["record_id"])
                )
            except AttributeError:
                new_idx = np.arange(argmin_bin + 1)

            self.label(new_idx, prior=True)

        pbar_rel = tqdm(
            initial=sum(self._results["label"]) if hasattr(self, "_results") else 0,
            total=sum(self.labels),
            desc="Relevant records found",
        )
        pbar_total = tqdm(
            initial=len(self._results) if hasattr(self, "_results") else 0,
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

    def train(self):
        """Train a new model on the labeled data."""

        try:
            y_sample_input = (
                pd.DataFrame(np.arange(self.fm.shape[0]), columns=["record_id"])
                .merge(self._results, how="left", on="record_id")
                .loc[:, "label"]
                .fillna(LABEL_NA)
                .to_numpy()
            )
        except AttributeError:
            y_sample_input = np.full(self.fm.shape[0], LABEL_NA)

        train_idx = np.where(y_sample_input != LABEL_NA)[0]

        if self.balance_strategy is None:
            X_train = self.fm[train_idx]
            y_train = y_sample_input[train_idx]
        else:
            X_train, y_train = self.balance_strategy.sample(
                self.fm, y_sample_input, train_idx
            )

        self.classifier.fit(X_train, y_train)
        relevance_scores = self.classifier.predict_proba(self.fm)

        ranked_record_ids = self.query_strategy.query(
            feature_matrix=self.fm,
            relevance_scores=relevance_scores,
        )

        self._last_ranking = pd.DataFrame(
            {
                "record_id": ranked_record_ids,
                "ranking": range(len(ranked_record_ids)),
                "classifier": self.classifier.name,
                "query_strategy": self.query_strategy.name,
                "balance_strategy": self.balance_strategy.name
                if self.balance_strategy
                else None,
                "feature_extraction": self.feature_extraction.name,
                "training_set": len(self._results),
                "time": datetime.now(),
            }
        )

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

        df_full = self._last_ranking[["record_id", "ranking"]].merge(
            self._results, how="left", on="record_id"
        )

        return df_full[df_full["label"].isnull()]["record_id"].head(n).to_list()

    def label(self, record_ids, prior=False):
        """Label the records with the given record_ids.

        Arguments
        ---------
        record_ids: list
            The record ids to label.
        prior: bool
            If True, the records are labeled based on prior knowledge.

        """

        if prior:
            classifier = None
            query_strategy = None
            balance_strategy = None
            feature_extraction = None
            training_set = None
        else:
            classifier = self.classifier.name
            query_strategy = self.query_strategy.name
            balance_strategy = (
                self.balance_strategy.name if self.balance_strategy else None,
            )
            feature_extraction = self.feature_extraction.name
            training_set = len(self._results)

        new_labels = pd.DataFrame(
            {
                "record_id": record_ids,
                "label": self.labels[record_ids],
                "classifier": classifier,
                "query_strategy": query_strategy,
                "balance_strategy": balance_strategy,
                "feature_extraction": feature_extraction,
                "training_set": training_set,
                "labeling_time": str(datetime.now()),
                "note": None,
                "tags": None,
                "user_id": None,
            }
        )

        try:
            self._results = pd.concat(
                [self._results, new_labels],
                ignore_index=True,
            )
        except AttributeError:
            self._results = new_labels

    def label_random(
        self, n_included=None, n_excluded=None, prior=False, random_state=None
    ):
        """Label random records.

        Arguments
        ---------
        n_included: int
            Number of included records to label.
        n_excluded: int
            Number of excluded records to label.
        prior: bool
            If True, the records are labeled based on prior knowledge.

        """

        r = check_random_state(random_state)

        included_idx = np.where(self.labels == 1)[0]
        excluded_idx = np.where(self.labels == 0)[0]

        if len(included_idx) < n_included:
            raise ValueError(
                f"Number of included priors requested ({n_included})"
                f" is bigger than number of included papers "
                f"({len(included_idx)})."
            )
        if len(excluded_idx) < n_excluded:
            raise ValueError(
                f"Number of excluded priors requested ({n_excluded})"
                f" is bigger than number of excluded papers "
                f"({len(excluded_idx)})."
            )

        init = np.append(
            r.choice(included_idx, n_included, replace=False),
            r.choice(excluded_idx, n_excluded, replace=False),
        )

        self.label(init, prior=prior)

    def to_sql(self, fp):
        """Write the data a sql file.

        Arguments
        ---------
        fp: str, Path, asreview.Project
            The path to the sqlite file to write the results to.
        """

        with open_state(fp) as state:
            state._add_results_from_df(self._results)

            try:
                state._add_last_ranking(self._last_ranking)
            except AttributeError:
                pass
