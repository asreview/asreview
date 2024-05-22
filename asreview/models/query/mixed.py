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

    Use two different query strategies at the same time with a
    ratio of one to the other. A mix of two query strategies is used. For
    example mixing max and random sampling with a mix ratio of 0.95 would mean
    that at each query 95% of the instances would be sampled with the max
    query strategy after which the remaining 5% would be sampled with the
    random query strategy. It would be called the `max_random` query strategy.
    Every combination of primitive query strategy is possible.

    Arguments
    ---------
    query_model1: str
        Name of the first query strategy.
    query_model2: str
        Name of the second query strategy.
    mix_ratio: float
        Sampling from query_model1 and query_model2 according a Bernoulli
        distribution. E.g. for mix_ratio=0.95, this implies query_model1
        with probability 0.95 and query_model2 with probability 0.05.
        Default 0.95.
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
        mix_ratio=0.95,
        random_state=None,
    ):
        """Initialize the Mixed query strategy."""

        self.query_model1 = query_model1
        self.query_model2 = query_model2

        self.mix_ratio = mix_ratio
        self._random_state = random_state

    def query(
        self, X, classifier, n_instances=None, return_classifier_scores=False, **kwargs
    ):
        # set the number of instances to len(X) if None
        if n_instances is None:
            n_instances = X.shape[0]

        # compute the predictions
        predictions = classifier.predict_proba(X)

        # Perform the query with strategy 1.
        try:
            query_idx_1 = self.query_model1._query(predictions, n_instances=n_instances)
        except AttributeError:
            # for random for example
            query_idx_1 = self.query_model1.query(
                X, classifier, n_instances=n_instances, return_classifier_scores=False
            )

        # Perform the query with strategy 2.
        try:
            query_idx_2 = self.query_model2._query(predictions, n_instances=n_instances)
        except AttributeError:
            # for random for example
            query_idx_2 = self.query_model2.query(
                X, classifier, n_instances, return_classifier_scores=False
            )

        # mix the 2 query strategies into one list
        query_idx_mix = []
        i = 0
        j = 0

        while i < len(query_idx_1) and j < len(query_idx_2):
            if check_random_state(self._random_state).rand() < self.mix_ratio:
                query_idx_mix.append(query_idx_1[i])
                i = i + 1
            else:
                query_idx_mix.append(query_idx_2[j])
                j = j + 1

        indexes = np.unique(query_idx_mix, return_index=True)[1]
        ranking = [query_idx_mix[i] for i in sorted(indexes)][0:n_instances]

        if return_classifier_scores:
            return ranking, predictions
        else:
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

    def __init__(self, mix_ratio=0.95, random_state=None):
        """Initialize the Mixed (Maximum and Random) query strategy."""
        super().__init__(
            query_model1=MaxQuery(),
            query_model2=RandomQuery(),
            mix_ratio=mix_ratio,
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

    def __init__(self, mix_ratio=0.95, random_state=None):
        """Initialize the Mixed (Maximum and Uncertainty) query strategy."""
        super().__init__(
            query_model1=MaxQuery(),
            query_model2=UncertaintyQuery(),
            mix_ratio=mix_ratio,
            random_state=random_state,
        )
