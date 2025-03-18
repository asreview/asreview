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


import numpy as np
from sklearn.base import BaseEstimator
from sklearn.utils import check_random_state

from asreview.models.mixin import QueryMixin

__all__ = [
    "Max",
    "HybridMaxRandom",
    "HybridMaxUncertainty",
    "Uncertainty",
    "Random",
    "TopDown",
]


def _random_array(n, random_state=None):
    row_indices = np.arange(n)
    check_random_state(random_state).shuffle(row_indices)
    return row_indices


def _mix_indices(query_idx_1, query_idx_2, mix_probability=0.95, random_state=None):
    query_idx_mix = []
    i = 0
    j = 0

    while i < len(query_idx_1) and j < len(query_idx_2):
        if check_random_state(random_state).rand() < mix_probability:
            query_idx_mix.append(query_idx_1[i])
            i = i + 1
        else:
            query_idx_mix.append(query_idx_2[j])
            j = j + 1

    indexes = np.unique(query_idx_mix, return_index=True)[1]
    return [query_idx_mix[i] for i in sorted(indexes)]


class Random(QueryMixin, BaseEstimator):
    """Random query strategy.

    Choose the samples to be included at random.
    """

    name = "random"
    label = "Random"

    def __init__(self, random_state=None):
        self.random_state = random_state

    def query(self, p):
        """Query instances.

        Arguments
        ---------
        p: np.array
            The probabilities of the instances.
        random_state: int, RandomState
            Random state for shuffling the indices.

        Returns
        -------
        np.array:
            The indices of the instances to be queried.
        """
        return _random_array(len(p), random_state=self.random_state)


class TopDown(QueryMixin, BaseEstimator):
    """Top-down query strategy.

    Query the records in a top-down fashion.
    """

    name = "top_down"
    label = "Top-down"

    def query(self, p):
        """Query instances.

        Arguments
        ---------
        p: np.array
            The probabilities of the instances.

        Returns
        -------
        np.array:
            The indices of the instances to be queried.
        """
        return np.arange(len(p))


class Uncertainty(QueryMixin, BaseEstimator):
    """Uncertainty query strategy.

    Choose the most uncertain samples according to the model (i.e. closest to
    0.5 probability). If decision functions are used, the samples closest to
    the decision boundary are chosen (0).

    """

    name = "uncertainty"
    label = "Uncertainty"

    def __init__(self, u: float = None, proba: bool = True):
        self.u = u
        self.proba = proba

    def query(self, p):
        """Query instances.

        Arguments
        ---------
        p: np.array
            The probabilities of the instances.

        Returns
        -------
        np.array:
            The indices of the instances to be queried.
        """

        if self.u is None and self.proba:
            u = 0.5
        elif self.u is None and not self.proba:
            u = 0
        else:
            u = self.u

        try:
            return np.argsort(np.abs(p - u))
        except TypeError:
            raise TypeError("Probabilities or decision functions should be provided")


class Max(QueryMixin, BaseEstimator):
    """Maximum query strategy.

    Choose the most likely samples to be included according to the model.
    """

    name = "max"
    label = "Maximum"

    def query(self, p):
        try:
            return np.argsort(-p)
        except TypeError:
            raise TypeError("Probabilities or decision functions should be provided")


class HybridMaxUncertainty(QueryMixin, BaseEstimator):
    """95% Maximum and 5% Uncertainty query strategy.

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the uncertainty query strategy.
    """

    name = "max_uncertainty"
    label = "Mixed (95% Maximum and 5% Uncertainty)"

    def __init__(self, probability=0.95, u=None, proba=None, random_state=None):
        self.probability = probability
        self.u = u
        self.proba = proba
        self.random_state = random_state

    def query(self, p):
        return _mix_indices(
            Max().query(p),
            Uncertainty(u=self.u, proba=self.proba).query(p),
            self.probability,
            self.random_state,
        )


class HybridMaxRandom(QueryMixin, BaseEstimator):
    """95% Maximum and 5% Random query strategy.

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the random query strategy.

    Arguments
    ---------
    probability: float
        The probability of sampling with the maximum query strategy.
    random_state: int, RandomState
        Random

    """

    name = "max_random"
    label = "Mixed (95% Maximum and 5% Random)"

    def __init__(self, probability=0.95, random_state=None):
        self.probability = probability
        self.random_state = random_state

    def query(self, p):
        return _mix_indices(
            Max().query(p),
            _random_array(len(p), self.random_state),
            self.probability,
            self.random_state,
        )
