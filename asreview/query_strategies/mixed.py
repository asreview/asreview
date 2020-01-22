# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

from asreview.query_strategies.base import BaseQueryStrategy
from asreview.query_strategies.utils import get_query_model


class MixedQuery(BaseQueryStrategy):
    """Class for mixed query strategy.

    The idea is to use two different query strategies at the same time with a
    ratio of one to the other.
    """
    name = "mixed"

    def __init__(self, strategy_1="max", strategy_2="random", mix_ratio=0.95,
                 **kwargs):
        """Initialize the Mixed query strategy

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
            strategy and an underscore, e.g. 'max_' for maximal sampling.
        """
        super(MixedQuery, self).__init__()
        kwargs_1 = {}
        kwargs_2 = {}
        for key, value in kwargs.items():
            if key.startswith(strategy_1):
                new_key = key[len(strategy_1)+1:]
                kwargs_1[new_key] = value
            elif key.starts_with(strategy_2):
                new_key = key[len(strategy_2)+1:]
                kwargs_2[new_key] = value
            else:
                logging.warn(f"Key {key} is being ignored for the mixed "
                             "({strategy_1}, {strategy_2}) query strategy.")

        self.query_model1 = get_query_model(strategy_1)
        self.query_model2 = get_query_model(strategy_2)
        self.mix_ratio = mix_ratio

    def query(self, X, classifier, pool_idx=None, n_instances=1, shared={}):
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        # Split the number of instances for the query strategies.
        n_instances_1 = floor(n_instances*self.mix_ratio)
        leftovers = n_instances*self.mix_ratio-n_instances_1
        if np.random.random_sample() < leftovers:
            n_instances_1 += 1
        n_instances_2 = n_instances-n_instances_1

        # Perform the query with strategy 1.
        query_idx_1, X_1 = self.query_model1.query(
            X, classifier, pool_idx=pool_idx, n_instances=n_instances_1,
            shared=shared)

        # Remove the query indices from the pool.
        train_idx = np.delete(np.arange(n_samples), pool_idx, axis=0)
        train_idx = np.append(train_idx, query_idx_1)
        new_pool_idx = np.delete(np.arange(n_samples), train_idx, axis=0)

        # Perform the query with strategy 2.
        query_idx_2, X_2 = self.query_model2.query(
            X, classifier, pool_idx=new_pool_idx, n_instances=n_instances_2,
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

        return query_idx, X

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

        parameter_space["qry_mix_ratio"] = hp.uniform(
            "qry_mix_ratio", 0, 1)

        return parameter_space, hyper_choices
