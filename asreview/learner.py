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


import json
from dataclasses import asdict
from dataclasses import dataclass
from dataclasses import field
from typing import Any
from typing import Optional

from asreview.extensions import load_extension
from asreview.utils import _read_config_file

__all__ = []


def _unpack_params(params):
    return {} if params is None else params


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


@dataclass
class ActiveLearningCycleData:
    querier: str
    classifier: Optional[str] = None
    balancer: Optional[str] = None
    feature_extractor: Optional[str] = None
    stopper: Optional[str] = None
    querier_param: Optional[dict[str, Any]] = field(default_factory=dict)
    classifier_param: Optional[dict[str, Any]] = field(default_factory=dict)
    balancer_param: Optional[dict[str, Any]] = field(default_factory=dict)
    feature_extractor_param: Optional[dict[str, Any]] = field(default_factory=dict)
    stopper_param: Optional[dict[str, Any]] = field(default_factory=dict)
    n_query: int = 1


class ActiveLearningCycle:
    """Active learner cycle class.

    The active learner cycle class is a wrapper around the various learner components.

    The classifier is optional, if no classifier is provided, the active learner will
    only rank the instances based on the query strategy. This can be useful for example
    if you want random screening.

    Parameters
    ----------
    querier: BaseQueryStrategy
        The query strategy to use.
    classifier: BaseTrainClassifier
        The classifier to use. Default is None.
    balancer: BaseTrainClassifier
        The balance strategy to use. Default is None.
    feature_extractor: BaseFeatureExtraction
        The feature extraction method to use. Default is None.
    stopper: BaseStopper
        The stopping criteria. Default is None.
    n_query: int, callable
        The number of instances to query at once. If None, the querier
        will determine the number of instances to query. Default is None.

    """

    def __init__(
        self,
        querier,
        classifier=None,
        balancer=None,
        feature_extractor=None,
        stopper=None,
        n_query=1,
    ):
        self.querier = querier
        self.classifier = classifier
        self.balancer = balancer
        self.feature_extractor = feature_extractor
        self.stopper = stopper
        self.n_query = n_query

    def get_n_query(self, results, labels):
        """Get the number of records to query at each step in the active learning.

        n_query can be an integer or a function that takes the results of the
        simulation as input. If n_query is a function, it should return an integer.
        n_query can not be larger than the number of records left to label.

        Parameters
        ----------
        n_query: int | callable
            Number of records to query at each step in the active learning
            process. Default is 1.
        results: pd.DataFrame
            The results of the simulation.

        Returns
        -------
        int
            Number of records to query at each step in the active learning process.

        """

        n_query = self.n_query(results) if callable(self.n_query) else self.n_query
        return min(n_query, len(labels) - len(results))

    def transform(self, X):
        """Transform the data.

        Parameters
        ----------
        X: np.array
            The instances to transform.

        Returns
        -------
        np.array, scipy.sparse.csr_matrix:
            The transformed instances.
        """
        return self.feature_extractor.fit_transform(X)

    def fit(self, X, y):
        """Fit the classifier to the data.

        Parameters
        ----------
        X: np.array
            The instances to fit.
        y: np.array
            The labels of the instances.
        """
        if self.balancer is None:
            sample_weight = None
        else:
            sample_weight = self.balancer.compute_sample_weight(y)

        self.classifier.fit(X, y, sample_weight=sample_weight)
        return self

    def rank(self, X):
        """Rank the instances in X.

        Parameters
        ----------
        X: np.array
            The instances to rank.

        Returns
        -------
        np.array:
            The ranking of the instances.
        """

        if self.classifier is None:
            return self.querier.query(X)

        try:
            proba = self.classifier.predict_proba(X)
            return self.querier.query(proba[:, 1])
        except AttributeError:
            try:
                scores = self.classifier.decision_function(X)

                if "proba" in self.querier.get_params(deep=False):
                    self.querier.set_params(proba=False)

                return self.querier.query(scores)

            except AttributeError:
                raise AttributeError(
                    "Not possible to compute probabilities or "
                    "decision function for this classifier."
                )

    def stop(self, results, data):
        """Check if the stopping criteria is met.

        Parameters
        ----------
        results: pd.DataFrame
            The results of the simulation.
        data: pandas.DataFrame
            The data store object.

        Returns
        -------
        bool:
            True if the stopping criteria is met, False otherwise.
        """
        if self.stopper is None:
            return False
        return self.stopper.stop(results, data)

    @classmethod
    def from_meta(cls, cycle_meta_data, skip_feature_extraction=False):
        """Load the active learner from a metadata object.

        Parameters
        ----------
        cycle_meta_data: CycleMetaData
            The metadata object with the active learner settings.

        Returns
        -------
        ActiveLearningCycle:
            The active learner cycle object.
        """
        query_class = load_extension("models.queriers", cycle_meta_data.querier)
        query_model = query_class(**cycle_meta_data.querier_param)

        if cycle_meta_data.classifier is not None:
            classifier_class = load_extension(
                "models.classifiers", cycle_meta_data.classifier
            )
            classifier_model = classifier_class(**cycle_meta_data.classifier_param)
        else:
            classifier_model = None

        if cycle_meta_data.balancer is not None:
            balance_class = load_extension("models.balancers", cycle_meta_data.balancer)
            balance_model = balance_class(**cycle_meta_data.balancer_param)
        else:
            balance_model = None

        if (
            not skip_feature_extraction
            and cycle_meta_data.feature_extractor is not None
        ):
            feature_class = load_extension(
                "models.feature_extractors", cycle_meta_data.feature_extractor
            )
            feature_model = feature_class(**cycle_meta_data.feature_extractor_param)
        else:
            feature_model = None

        if cycle_meta_data.stopper is not None:
            stopper_class = load_extension("models.stoppers", cycle_meta_data.stopper)
            stopper_model = stopper_class(**cycle_meta_data.stopper_param)
        else:
            stopper_model = None

        return cls(
            querier=query_model,
            classifier=classifier_model,
            balancer=balance_model,
            feature_extractor=feature_model,
            stopper=stopper_model,
            n_query=cycle_meta_data.n_query,
        )

    @classmethod
    def from_file(cls, fp, load=None):
        """Load the active learner from a file.

        Parameters
        ----------
        fp: str, Path
            Review config file.
        load: object
            Config reader. Default tomllib.load for TOML (.toml) files,
            otherwise json.load.
        """
        if load is not None:
            with open(fp, "r") as f:
                return cls.from_meta(ActiveLearningCycleData(**load(f)))

        return cls.from_meta(ActiveLearningCycleData(**_read_config_file(fp)))

    def to_meta(self):
        return ActiveLearningCycleData(
            querier=_get_name_from_estimator(self.querier),
            querier_param=self.querier.get_params(deep=False),
            classifier=_get_name_from_estimator(self.classifier),
            classifier_param=self.classifier.get_params(deep=False)
            if self.classifier is not None
            else None,
            balancer=_get_name_from_estimator(self.balancer),
            balancer_param=self.balancer.get_params(deep=False)
            if self.balancer is not None
            else None,
            feature_extractor=_get_name_from_estimator(self.feature_extractor),
            feature_extractor_param=self.feature_extractor.get_params(deep=False)
            if self.feature_extractor is not None
            else None,
            stopper=_get_name_from_estimator(self.stopper),
            stopper_param=self.stopper.get_params(deep=False)
            if self.stopper is not None
            else None,
            n_query=self.n_query,
        )

    def to_file(self, fp):
        with open(fp, "w") as f:
            json.dump(asdict(self.to_meta()), f)
