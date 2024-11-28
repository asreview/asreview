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

__all__ = ["MixedQuery", "MaxRandomQuery", "MaxUncertaintyQuery"]

import numpy as np
from sklearn.utils import check_random_state

from asreview.models.query.base import BaseQueryStrategy
from asreview.models.query.max_prob import MaxQuery
from asreview.models.query.random import RandomQuery
from asreview.models.query.uncertainty import UncertaintyQuery


class MixedQuery(BaseQueryStrategy):
    """Mixed query strategy.

    Apply two query strategies and mix the rankings produced by both into a single
    joined ranking. If for example the `max` and `random` query strategies are used, it
    would be called the `max_random` query strategy. Every combination of primitive
    query strategy is possible.
    It uses a parameter `mix_probability` which determines how often the first versus
    the second query strategy should be used. Intuitively, if `mix_probability` is 0.95
    then a record has a 95% chance to come from the first query strategy and a 5% chance
    to come from the second query strategy. What actually happens is close to this, but
    for full details look at the implemenatation of the algorithm in the code.

    Parameters
    ----------
    query_model1: str
        Name of the first query strategy.
    query_model2: str
        Name of the second query strategy.
    mix_probability: float
        Number between 0 and 1. A variable used in the algorithm to combine the outputs
        of query_model1 and query_model2. It is the probability that a record is taken
        from the output of query_model1 in each iteration of the algorithm. Note that it
        is not the ratio, or fraction of records taken from query_model1 vs
        query_model2.
    random_state: float
        Seed for the numpy random number generator.
    **kwargs: dict
        Keyword arguments for the two strategy. To specify which of the
        strategies the argument is for, prepend with the name of the query
        strategy and an underscore, e.g. 'max' for maximal sampling.
    """

    def __init__(
        self,
        query_model1,
        query_model2,
        mix_probability=0.95,
        random_state=None,
    ):
        """Initialize the Mixed query strategy."""

        self.query_model1 = query_model1
        self.query_model2 = query_model2

        self.mix_probability = mix_probability
        self._random_state = random_state

    def query(self, feature_matrix, relevance_scores):
        query_idx_1 = self.query_model1.query(
            feature_matrix=feature_matrix, relevance_scores=relevance_scores
        )
        query_idx_2 = self.query_model2.query(
            feature_matrix=feature_matrix, relevance_scores=relevance_scores
        )

        # mix the 2 query strategies into one list
        query_idx_mix = []
        i = 0
        j = 0

        while i < len(query_idx_1) and j < len(query_idx_2):
            if check_random_state(self._random_state).rand() < self.mix_probability:
                query_idx_mix.append(query_idx_1[i])
                i = i + 1
            else:
                query_idx_mix.append(query_idx_2[j])
                j = j + 1

        indexes = np.unique(query_idx_mix, return_index=True)[1]
        ranking = [query_idx_mix[i] for i in sorted(indexes)]

        return ranking

    @property
    def name(self):
        return "_".join([self.query_model1, self.query_model2])


class MaxRandomQuery(MixedQuery):
    """Mixed (95% Maximum and 5% Random) query strategy (``max_random``).

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the random query strategy.
    """

    name = "max_random"
    label = "Mixed (95% Maximum and 5% Random)"

    def __init__(self, mix_probability=0.95, random_state=None):
        """Initialize the Mixed (Maximum and Random) query strategy."""
        super().__init__(
            query_model1=MaxQuery(),
            query_model2=RandomQuery(),
            mix_probability=mix_probability,
            random_state=random_state,
        )


class MaxUncertaintyQuery(MixedQuery):
    """Mixed (95% Maximum and 5% Uncertainty) query strategy (``max_uncertainty``).

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the uncertainty query strategy.
    """

    name = "max_uncertainty"
    label = "Mixed (95% Maximum and 5% Uncertainty)"

    def __init__(self, mix_probability=0.95, random_state=None):
        """Initialize the Mixed (Maximum and Uncertainty) query strategy."""
        super().__init__(
            query_model1=MaxQuery(),
            query_model2=UncertaintyQuery(),
            mix_probability=mix_probability,
            random_state=random_state,
        )
