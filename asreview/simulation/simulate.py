# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

import time

import numpy as np
import pandas as pd
from tqdm import tqdm

from asreview.metrics import loss
from asreview.metrics import ndcg
from asreview.models.stoppers import LastRelevant
from asreview.models.stoppers import NLabeled
from asreview.state.contextmanager import open_state


def _get_name_from_estimator(estimator):
    """Get the name of the estimator.

    Parameters
    ----------
    estimator: object
        The estimator to get the name from.

    Returns
    -------
    str
        The name of the estimator.

    """
    if estimator is None:
        return None

    return estimator.name


class Simulate:
    """ASReview simulation class.

    The simulation will stop when all records have been labeled or when the number of
    steps/queries reaches the stopping.

    To seed the simulation, provide the seed to the classifier, query strategy,
    feature extraction model, and balance strategy or use a global random seed.

    Parameters
    ----------
    fm: numpy.ndarray
        The feature matrix to use for the simulation.
    labels: numpy.ndarray, pandas.Series, list
        The labels to use for the simulation.
    classifier: BaseModel
        The initialized classifier to use for the simulation.
    querier: BaseQueryModel
        The initialized query strategy to use for the simulation.
    balancer: BaseBalanceModel
        The initialized balance strategy to use for the simulation.
    feature_extractor: BaseFeatureModel
        The initialized feature extraction model to use for the simulation. If None,
        the name of the feature extraction model is set to None.
    stopper: int, callable
        The stopping mechanism to use for the simulation. When stopper is None,
        the simulation stops when all relevant records are found. If an integer, the
        simulation stops after n queries. A stopper or -1 stops the simulation after
        all records have been labeled. If class with .stop() method, the simulation
        stops when the callable returns True. Default is None.
    skip_transform: bool
        If True, the feature matrix is not computed in the simulation. It is assumed
        that X is the feature matrix or input to the estimator. Default is False.
    """

    def __init__(
        self,
        X,
        labels,
        cycles,
        stopper=None,
        skip_transform=False,
        print_progress=True,
    ):
        self.X = X
        self.labels = labels
        self.cycles = cycles
        self.stopper = stopper
        self.skip_transform = skip_transform
        self.print_progress = print_progress

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

    def review(self):
        """Start the review process."""

        if not hasattr(self, "_results"):
            self._results = pd.DataFrame(
                columns=[
                    "record_id",
                    "label",
                    "classifier",
                    "querier",
                    "balancer",
                    "feature_extractor",
                    "training_set",
                    "time",
                    "note",
                    "tags",
                    "user_id",
                ]
            )

        pbar_rel = tqdm(
            initial=sum(self._results["label"]) if hasattr(self, "_results") else 0,
            total=sum(self.labels),
            desc="Relevant records found",
            disable=not self.print_progress,
        )
        pbar_total = tqdm(
            initial=len(self._results) if hasattr(self, "_results") else 0,
            total=len(self.labels),
            desc="Records labeled       ",
            disable=not self.print_progress,
        )

        if self.stopper is None:
            stopper = LastRelevant()
        elif isinstance(self.stopper, int):
            stopper = NLabeled(self.stopper)
        else:
            stopper = self.stopper

        cycles = self.cycles if isinstance(self.cycles, list) else [self.cycles]

        for cycle in cycles:
            # first run the overall simulation until the default stopper is met
            while not stopper.stop(self._results, self.labels) and not cycle.stop(
                self._results, self.labels
            ):
                # compute the feature matrix for the labeled records if not in
                # _X_features cache
                if not hasattr(self, "_X_features"):
                    if not self.skip_transform and cycle.feature_extractor is not None:
                        self._X_features = cycle.transform(self.X)
                    elif isinstance(self.X, pd.DataFrame):
                        self._X_features = self.X.values
                    else:
                        self._X_features = self.X

                # fit the estimator to the labeled records
                if cycle.classifier is not None:
                    cycle.fit(
                        self._X_features[self._results["record_id"].values],
                        self._results["label"].values,
                    )

                # collect the records in the pool
                pool_record_ids = np.setdiff1d(
                    np.arange(len(self.labels)), self._results["record_id"].values
                )

                # rank the pool and convert the ranked pool to record ids
                ranked_pool = cycle.rank(self._X_features[pool_record_ids])
                ranked_pool_record_ids = pool_record_ids[ranked_pool]

                # label n_query records from the pool
                n_query = cycle.get_n_query(self._results, self.labels)
                if not isinstance(n_query, int) or n_query < 1:
                    raise ValueError(
                        f"Number of records to query should be an integer "
                        f"greater than 0, got {n_query}."
                    )

                labeled = self.label(ranked_pool_record_ids[:n_query], cycle=cycle)

                pbar_rel.update(labeled["label"].sum())
                pbar_total.update(n_query)

            else:
                if hasattr(self, "_X_features"):
                    del self._X_features

        else:
            pbar_rel.close()
            pbar_total.close()

            padded_results = list(
                self._results.dropna(axis=0, subset="training_set")["label"]
            ) + [0] * (len(self.labels) - len(self._results["label"]))

            if self.print_progress:
                try:
                    print(
                        f"\nLoss: {loss(padded_results):.3f}\nNDCG: {ndcg(padded_results):.3f}"
                    )
                except ValueError:
                    print(
                        "Can't compute loss and gain for labels with only relevant or irrelevant records"
                    )

    def label(self, record_ids, cycle=None):
        """Label the records with the given record_ids.

        Parameters
        ----------
        record_ids: list
            The record ids to label.

        """

        if cycle is None:
            classifier = None
            querier = None
            balancer = None
            feature_extractor = None
            training_set = None
        else:
            classifier = _get_name_from_estimator(cycle.classifier)
            querier = _get_name_from_estimator(cycle.querier)
            balancer = _get_name_from_estimator(cycle.balancer)
            feature_extractor = _get_name_from_estimator(cycle.feature_extractor)
            training_set = len(self._results)

        new_labels = pd.DataFrame(
            {
                "record_id": record_ids,
                "label": pd.Series(self.labels).iloc[record_ids],
                "classifier": classifier,
                "querier": querier,
                "balancer": balancer,
                "feature_extractor": feature_extractor,
                "training_set": training_set,
                "time": time.time(),
                "note": None,
                "tags": None,
                "user_id": None,
            }
        )

        if not hasattr(self, "_results") or self._results.empty:
            self._results = new_labels
        else:
            self._results = pd.concat(
                [self._results, new_labels],
                ignore_index=True,
            )

        return new_labels

    def to_sql(self, fp):
        """Write the data a sql file.

        Parameters
        ----------
        fp: str, Path, asreview.Project
            The path to the sqlite file to write the results to.
        """

        with open_state(fp) as state:
            state._replace_results_from_df(self._results)
