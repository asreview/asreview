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

from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib

from extensions import load_extension

import json

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


class ActiveLearningCycle:
    """Active learner cycle class.

    The active learner class is a wrapper around a query strategy and a classifier.
    It is used to rank the instances of the feature matrix.

    The classifier is optional, if no classifier is provided, the active learner will
    only rank the instances based on the query strategy. This can be useful for example
    if you want random screening.

    Parameters
    ----------
    query_strategy: BaseQueryStrategy
        The query strategy to use.
    classifier: BaseTrainClassifier
        The classifier to use. Default is None.
    balance_strategy: BaseTrainClassifier
        The balance strategy to use. Default is None.
    feature_extraction: BaseFeatureExtraction
        The feature extraction method to use. Default is None.
    stopping: BaseStopping
        The stopping criteria. Default is None.
    n_query: int, callable
        The number of instances to query at once. If None, the querier
        will determine the number of instances to query. Default is None.


    Returns
    -------
    ActiveLearningCycle:
        An active learner object.

    """

    def __init__(
        self,
        query_strategy,
        classifier=None,
        balance_strategy=None,
        feature_extraction=None,
        stopping=None,
        n_query=1,
    ):
        self.query_strategy = query_strategy
        self.classifier = classifier
        self.balance_strategy = balance_strategy
        self.feature_extraction = feature_extraction
        self.stopping = stopping
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
        return self.feature_extraction.fit_transform(X)

    def fit(self, X, y):
        """Fit the classifier to the data.

        Parameters
        ----------
        X: np.array
            The instances to fit.
        y: np.array
            The labels of the instances.
        """
        if self.balance_strategy is None:
            sample_weight = None
        else:
            sample_weight = self.balance_strategy.compute_sample_weight(y)

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
            return self.query_strategy.query(X)

        try:
            proba = self.classifier.predict_proba(X)
            return self.query_strategy.query(proba[:, 1])
        except AttributeError:
            try:
                scores = self.classifier.decision_function(X)

                if "proba" in self.query_strategy.get_params():
                    self.query_strategy.set_params(proba=False)

                return self.query_strategy.query(scores)

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
        if self.stopping is None:
            return False
        return self.stopping.stop(results, data)

    @classmethod
    def from_file(cls, fp, load):
        """Load the active learner from a file.

        Parameters
        ----------

        Parameters
        ----------
        fp: str, Path
            Review config file.
        load: object
            Config reader. Default tomllib.load for TOML (.toml) files,
            otherwise json.load.
        """
        if load is None:
            if Path(fp).suffix == ".toml":
                load = tomllib.load
            else:
                load = json.load

        with open(fp, "rb") as f:
            data = load(f)

        errors = []

        if data["query_strategy"] is None:
            raise ValueError("query strategy is required.")

        try:
            query_class = load_extension("models.query", data["query_strategy"])
            query_model = query_class(**_unpack_params(data["query_param"]))
        except ValueError:
            errors.append(f"query strategy={data['query_strategy']}")

        if data["classifier"] is not None:
            try:
                classifier_class = load_extension(
                    "models.classifiers", data["classifier"]
                )
                classifier_model = classifier_class(
                    **_unpack_params(data["classifier_param"])
                )
            except ValueError:
                errors.append(f"classifier={data["classifier"]}")
        else:
            classifier_model = None

        if data["balance_strategy"] is not None:
            try:
                balance_class = load_extension(
                    "models.balance", data["balance_strategy"]
                )
                balance_model = balance_class(**_unpack_params(data["balance_param"]))
            except ValueError:
                errors.append(f"balance strategy={data["balance_strategy"]}")
        else:
            balance_model = None

        if data["feature_extraction"] is not None:
            try:
                feature_class = load_extension(
                    "models.feature_extraction", data["feature_extraction"]
                )
                feature_model = feature_class(**_unpack_params(data["feature_param"]))
            except ValueError:
                errors.append(f"feature extractor={data["feature_extraction"]}")
        else:
            feature_model = None

        if errors:
            if len(errors) == 1:
                raise ValueError("Model component " + errors[0] + " is not available.")
            else:
                raise ValueError(
                    "Model components " + ", ".join(errors) + " are not available."
                )

        return cls(
            query_strategy=query_model,
            classifier=classifier_model,
            balance_strategy=balance_model,
            feature_extraction=feature_model,
            # stopping=None,  # todo: implement stopping
            n_query=data.get("n_query", 1),
        )

    def to_dict(self):
        return {
            "query_strategy": _get_name_from_estimator(self.query_strategy),
            "query_param": self.query_strategy.get_params(),
            "classifier": _get_name_from_estimator(self.classifier),
            "classifier_param": self.classifier.get_params()
            if self.classifier is not None
            else None,
            "balance_strategy": _get_name_from_estimator(self.balance_strategy),
            "balance_param": self.balance_strategy.get_params()
            if self.balance_strategy is not None
            else None,
            "feature_extraction": _get_name_from_estimator(self.feature_extraction),
            "feature_param": self.feature_extraction.get_params()
            if self.feature_extraction is not None
            else None,
            "n_query": self.n_query,
        }

    def to_file(self, fp):
        data = self.to_dict()
        with open(fp, "w") as f:
            if Path(fp).suffix == ".toml":
                tomllib.dump(data, f)
            else:
                json.dump(data, f)
