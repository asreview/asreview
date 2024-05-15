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
from asreview.state.contextmanager import open_state
from asreview.utils import get_random_state


class Simulate:
    """ASReview Simulation mode class.

    Arguments
    ---------
    fm: numpy.ndarray
        The feature matrix to use for the simulation.
    labels: numpy.ndarray, pandas.Series, list
        The labels to use for the simulation.
    classifier: BaseModel
        The classifier to use for the simulation.
    query_strategy: BaseQueryModel
        The query strategy to use for the simulation.
    balance_strategy: BaseBalanceModel
        The balance strategy to use for the simulation.
    feature_extraction: BaseFeatureModel
        The feature extraction model to use for the simulation. If None,
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
        balance_strategy,
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

        self._last_ranking = None
        self._results = pd.DataFrame(
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
                "user_id",
            ]
        )

    def _stop_review(self):
        """Check if the review should be stopped."""

        # if the pool is empty, always stop
        if len(self._results) == len(self.labels):
            return True

        # If stop_if is set to min, stop after stop_if queries.
        if self.stop_if == "min" and sum(self.labels) == sum(self._results["label"]):
            return True

        # Stop when reaching stop_if (if provided)
        if isinstance(self.stop_if, int) and len(self._results) >= self.stop_if:
            return True

        return False

    def review(self):
        """Start the review process."""

        if (
            not (self._results["label"] == 1).any()
            or not (self._results["label"] == 0).any()
        ):
            first_included_idx = np.where(self.labels == 1)[0].min()
            first_excluded_idx = np.where(self.labels == 0)[0].min()
            first_idx = np.arange(max(first_included_idx, first_excluded_idx) + 1)

            new_idx = list(set(first_idx) - set(self._results["record_id"]))
            self.label(new_idx, prior=True)

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

        X_train, y_train = self.balance_strategy.sample(
            self.fm, y_sample_input, train_idx
        )

        self.classifier.fit(X_train, y_train)

        ranked_record_ids = self.query_strategy.query(
            self.fm,
            classifier=self.classifier,
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
            query_strategy = "prior"
            balance_strategy = None
            feature_extraction = None
            training_set = 0
        else:
            classifier = self.classifier.name
            query_strategy = self.query_strategy.name
            balance_strategy = self.balance_strategy.name
            feature_extraction = self.feature_extraction.name
            training_set = int(self.training_set)

        self._results = pd.concat(
            [
                self._results,
                pd.DataFrame(
                    {
                        "record_id": record_ids,
                        "label": self.labels[record_ids],
                        "classifier": classifier,
                        "query_strategy": query_strategy,
                        "balance_strategy": balance_strategy,
                        "feature_extraction": feature_extraction,
                        "training_set": training_set,
                        "labeling_time": str(datetime.now()),
                        "notes": None,
                        "user_id": None,
                    }
                ),
            ],
            ignore_index=True,
        )

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
        random_state: int, RandomState
            Seed for the random number generator.
        """

        r = get_random_state(random_state)

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

    def to_sql(self, project, review_id=None):
        """Write the data a sql file.

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

        with open_state(project) as state:
            state.create_tables()

            self._results.to_sql(
                "results", state._conn, if_exists="replace", index=False
            )

            state.add_last_ranking(
                self._last_ranking["record_id"].to_numpy(),
                self.classifier.name,
                self.query_strategy.name,
                self.balance_strategy.name,
                None,
                self.training_set,
            )

        project.mark_review_finished()
