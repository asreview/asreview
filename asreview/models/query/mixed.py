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

import numpy as np

from asreview.models.query.base import BaseQueryStrategy
from asreview.models.query.utils import get_query_model
from asreview.utils import get_random_state


def _parse_mixed_kwargs(kwargs, strategy_name):

    kwargs_new = {}
    for key, value in kwargs.items():
        if key.startswith(strategy_name):
            new_key = key[len(strategy_name) + 1:]
            kwargs_new[new_key] = value

    return kwargs_new


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
    strategy_1: str
        Name of the first query strategy. Default 'max'.
    strategy_2: str
        Name of the second query strategy. Default 'random'
    mix_ratio: float
        Sampling from strategy_1 and strategy_2 according a Bernoulli
        distribution. E.g. for mix_ratio=0.95, this implies strategy_1
        with probability 0.95 and strategy_2 with probability 0.05.
        Default 0.95.
    random_state: float
        Seed for the numpy random number generator.
    **kwargs: dict
        Keyword arguments for the two strategy. To specify which of the
        strategies the argument is for, prepend with the name of the query
        strategy and an underscore, e.g. 'max' for maximal sampling.
    """

    def __init__(self,
                 strategy_1="max",
                 strategy_2="random",
                 mix_ratio=0.95,
                 random_state=None,
                 **kwargs):
        """Initialize the Mixed query strategy."""
        super(MixedQuery, self).__init__()

        self.strategy_1 = strategy_1
        self.strategy_2 = strategy_2

        self.mix_ratio = mix_ratio
        self._random_state = get_random_state(random_state)

        self.kwargs_1 = _parse_mixed_kwargs(kwargs, strategy_1)
        self.kwargs_2 = _parse_mixed_kwargs(kwargs, strategy_2)

        self.query_model1 = get_query_model(strategy_1, **self.kwargs_1)
        if "random_state" in self.query_model1.default_param:
            self.query_model1 = get_query_model(
                strategy_1, random_state=self._random_state, **self.kwargs_1)

        self.query_model2 = get_query_model(strategy_2, **self.kwargs_2)
        if "random_state" in self.query_model2.default_param:
            self.query_model2 = get_query_model(
                strategy_2, random_state=self._random_state, **self.kwargs_2)

    def query(self, X, classifier, n_instances=None, **kwargs):

        # set the number of instances to len(X) if None
        if n_instances is None:
            n_instances = X.shape[0]

        # compute the predictions
        predictions = classifier.predict_proba(X)

        # Perform the query with strategy 1.
        try:
            query_idx_1 = self.query_model1._query(
                predictions,
                n_instances=n_instances)
        except AttributeError:
            # for random for example
            query_idx_1 = self.query_model1.query(
                X, classifier, n_instances)

        # Perform the query with strategy 2.
        try:
            query_idx_2 = self.query_model2._query(
                predictions,
                n_instances=n_instances)
        except AttributeError:
            # for random for example
            query_idx_2 = self.query_model2.query(
                X, classifier, n_instances)

        # mix the 2 query strategies into one list
        query_idx_mix = []
        i = 0
        j = 0

        while i < len(query_idx_1) and j < len(query_idx_2):

            if self._random_state.rand() < self.mix_ratio:
                query_idx_mix.append(query_idx_1[i])
                i = i + 1
            else:
                query_idx_mix.append(query_idx_2[j])
                j = j + 1

        indexes = np.unique(query_idx_mix, return_index=True)[1]
        return [query_idx_mix[i] for i in sorted(indexes)][0:n_instances]

    def full_hyper_space(self):
        from hyperopt import hp

        space_1, choices_1 = self.query_model1.hyper_space()
        space_2, choices_2 = self.query_model2.hyper_space()
        parameter_space = {}
        hyper_choices = {}
        for key, value in space_1.items():
            new_key = "qry_" + self.strategy_1 + key[4:]
            parameter_space[new_key] = value
            hyper_choices[new_key] = choices_1[key]

        for key, value in space_2.items():
            new_key = "qry_" + self.strategy_2 + key[4:]
            parameter_space[new_key] = value
            hyper_choices[new_key] = choices_2[key]

        parameter_space["qry_mix_ratio"] = hp.uniform("qry_mix_ratio", 0, 1)

        return parameter_space, hyper_choices

    @property
    def name(self):
        return "_".join([self.strategy_1, self.strategy_2])


class MaxRandomQuery(MixedQuery):
    """Mixed (95% Maximum and 5% Random) query strategy.

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the random query strategy.
    """

    name = "max_random"
    label = "Mixed (95% Maximum and 5% Random)"

    def __init__(self,
                 mix_ratio=0.95,
                 random_state=None,
                 **kwargs):
        """Initialize the Mixed (Maximum and Random) query strategy."""
        super(MaxRandomQuery, self).__init__(
            strategy_1="max",
            strategy_2="random",
            mix_ratio=mix_ratio,
            random_state=random_state,
            **kwargs)


class MaxUncertaintyQuery(MixedQuery):
    """Mixed (95% Maximum and 5% Uncertainty) query strategy.

    A mix of maximum and random query strategies with a mix ratio of 0.95.
    At each query 95% of the instances would be sampled with the maximum
    query strategy after which the remaining 5% would be sampled with
    the uncertainty query strategy.
    """

    name = "max_uncertainty"
    label = "Mixed (95% Maximum and 5% Uncertainty)"

    def __init__(self,
                 mix_ratio=0.95,
                 random_state=None,
                 **kwargs):
        """Initialize the Mixed (Maximum and Uncertainty) query strategy."""
        super(MaxUncertaintyQuery, self).__init__(
            strategy_1="max",
            strategy_2="uncertainty",
            mix_ratio=mix_ratio,
            random_state=random_state,
            **kwargs)
