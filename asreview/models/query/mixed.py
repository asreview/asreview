# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

import logging
from math import floor

import numpy as np
from scipy.sparse import issparse
from scipy.sparse import vstack

from asreview.models.query.base import BaseQueryStrategy
from asreview.models.query.utils import get_query_model
from asreview.utils import get_random_state


def interleave(n_samples, n_strat_1, random_state):
    """Interleave the order of the samples of two different strategies.

    While the decisions of which indices to sample are made one after
    the other, it is nicer if the order of the actual samples is mixed up.
    Instead of mixing it the easy way, I decided it should be as nice as
    possible.

    Parameters
    ----------
    n_samples: int
        Total number of samples to mix.
    n_strat_1: int
        Number of samples of the first strategy.
    random_state: int, numpy.RandomState
        RNG.

    Returns
    -------
    numpy.array:
        Order of samples, [0, n_samples).
    """
    n_strat_2 = n_samples - n_strat_1

    # Determine which of the strategies has more samples.
    if n_strat_1 >= n_strat_2:
        max_idx = np.arange(n_strat_1)
        min_idx = n_strat_1 + np.arange(n_strat_2)
    else:
        max_idx = n_strat_1 + np.arange(n_strat_2)
        min_idx = np.arange(n_strat_1)

    # Insert the strategy with less samples at these positions.
    insert_positions = np.sort(
        random_state.choice(
            np.arange(len(max_idx)), len(min_idx), replace=False))

    # Actually do the inserts.
    new_positions = np.zeros(n_samples, dtype=int)
    i_strat_min = 0
    for i_strat_max in range(len(max_idx)):
        new_positions[i_strat_max + i_strat_min] = max_idx[i_strat_max]
        if (i_strat_min < len(min_idx) and
                insert_positions[i_strat_min] == i_strat_max):
            new_positions[i_strat_min + i_strat_max + 1] = min_idx[i_strat_min]
            i_strat_min += 1
    return new_positions


class MixedQuery(BaseQueryStrategy):
    """Mixed query strategy.

    The idea is to use two different query strategies at the same time with a
    ratio of one to the other. A mix of two query strategies is used. For
    example mixing max and random sampling with a mix ratio of 0.95 would mean
    that at each query 95% of the instances would be sampled with the max
    query strategy after which the remaining 5% would be sampled with the
    random query strategy. It would be called the `max_random` query strategy.
    Every combination of primitive query strategy is possible.

    Arguments
    ---------
    strategy_1: str
        Name of the first query strategy.
    strategy_2: str
        Name of the second query strategy.
    mix_ratio: float
        Portion of queries done by the first strategy. So a mix_ratio of
        0.95 means that 95% of the time query strategy 1 is used and 5% of
        the time query strategy 2.
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
        kwargs_1 = {}
        kwargs_2 = {}
        for key, value in kwargs.items():
            if key.startswith(strategy_1):
                new_key = key[len(strategy_1) + 1:]
                kwargs_1[new_key] = value
            elif key.starts_with(strategy_2):
                new_key = key[len(strategy_2) + 1:]
                kwargs_2[new_key] = value
            else:
                logging.warn(f"Key {key} is being ignored for the mixed "
                             "({strategy_1}, {strategy_2}) query strategy.")

        self.strategy_1 = strategy_1
        self.strategy_2 = strategy_2

        self.query_model1 = get_query_model(strategy_1, **kwargs_1)
        self.query_model2 = get_query_model(strategy_2, **kwargs_2)

        self._random_state = get_random_state(random_state)
        if "random_state" in self.query_model1.default_param:
            self.query_model1 = get_query_model(
                strategy_1, **kwargs_1, random_state=self._random_state)
        if "random_state" in self.query_model2.default_param:
            self.query_model2 = get_query_model(
                strategy_2, **kwargs_2, random_state=self._random_state)
        self.mix_ratio = mix_ratio

    def query(self, X, classifier, pool_idx=None, n_instances=1, shared={}):
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        # Split the number of instances for the query strategies.
        n_instances_1 = floor(n_instances * self.mix_ratio)
        leftovers = n_instances * self.mix_ratio - n_instances_1
        if self._random_state.random_sample() < leftovers:
            n_instances_1 += 1
        n_instances_2 = n_instances - n_instances_1

        # Perform the query with strategy 1.
        query_idx_1, X_1 = self.query_model1.query(
            X,
            classifier,
            pool_idx=pool_idx,
            n_instances=n_instances_1,
            shared=shared)

        # Remove the query indices from the pool.
        train_idx = np.delete(np.arange(n_samples), pool_idx, axis=0)
        train_idx = np.append(train_idx, query_idx_1)
        new_pool_idx = np.delete(np.arange(n_samples), train_idx, axis=0)

        # Perform the query with strategy 2.
        query_idx_2, X_2 = self.query_model2.query(
            X,
            classifier,
            pool_idx=new_pool_idx,
            n_instances=n_instances_2,
            shared=shared)

        query_idx = np.append(query_idx_1, query_idx_2)

        if n_instances_1 == 0:
            X = X_2
        elif n_instances_2 == 0:
            X = X_1
        else:
            if issparse(X_1) and issparse(X_2):
                X = vstack([X_1, X_2]).tocsr()
            else:
                X = np.concatenate((X_1, X_2), axis=0)

        # Remix the two strategies without changing the order within.
        new_order = interleave(
            len(query_idx), len(query_idx_1), self._random_state)
        return query_idx[new_order], X[new_order]

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
