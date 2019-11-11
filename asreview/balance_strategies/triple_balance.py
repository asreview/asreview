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
from math import log

import numpy as np

from asreview.balance_strategies.base import BaseTrainData
from asreview.balance_strategies.full_sampling import full_sample


class TripleBalanceTD(BaseTrainData):
    """
    Class to get the three way rebalancing function and arguments.
    It divides the data into three groups: 1's, 0's from random sampling,
    and 0's from max sampling. Thus it only makes sense to use this class in
    combination with the rand_max query strategy.
    """
    def __init__(self, balance_kwargs={}, query_kwargs={}, **__):
        super(TripleBalanceTD, self).__init__(balance_kwargs)
        self.balance_kwargs['query_kwargs'] = query_kwargs

    @staticmethod
    def function():
        return triple_balance

    @staticmethod
    def description():
        return "triple balanced (max,rand) training data."

    def default_kwargs(self):
        defaults = {}
        defaults['one_a'] = 2.155
        defaults['one_alpha'] = 0.94
        defaults['zero_b'] = 0.789
        defaults['zero_beta'] = 1.0
        defaults['zero_max_c'] = 0.835
        defaults['zero_max_gamma'] = 2.0
        defaults['shuffle'] = True
        return defaults

    def hyperopt_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_one_a": hp.lognormal("bal_one_a", 2, 2),
            "bal_one_alpha": hp.uniform("bal_one_alpha", -2, 2),
            "bal_zero_b": hp.uniform("bal_zero_b", 0, 1),
            # "bal_zero_beta": hp.uniform("bal_zero_beta", 0, 2),
            "bal_zero_max_c": hp.uniform("bal_zero_max_c", 0, 1),
            # "bal_zero_max_gamma": hp.uniform("bal_zero_max_gamma", 0.01, 2)
        }
        return parameter_space


def _one_weight(n_one, n_zero, a, alpha):
    """
    Get the weight ratio between random and max samples.

    Parameters
    ----------
    b: float
        Ratio between rand/max at 0% queried.
    alpha: float
        Power law governing the transition.

    Returns
    -------
    float:
        Weight ratio between random/max instances.
    """
    weight = a * (n_one/n_zero)**(-alpha)
    return weight


def _zero_weight(n_read, b, beta):
    weight = 1 - (1-b) * (1+log(n_read))**(-beta)
    return weight


def _zero_max_weight(fraction_read, c, gamma):
    """
    Get the weight ratio between ones and zeros.

    Parameters
    ----------
    beta:
        Exponent governing decay of 1's to 0's.
    delta:
        Asymptotic ratio for infinite number of samples.

    Returns
    -------
    float:
        Weight ratio between 1's and 0's
    """
    weight = 1 - (1-c)*(1-fraction_read)**gamma
    return weight


def random_round(value):
    base = int(floor(value))
    if np.random.rand() < value-base:
        base += 1
    return base


def _get_triple_dist(n_one, n_zero_rand, n_zero_max, n_samples, n_train,
                     one_a, one_alpha,
                     zero_b, zero_beta,
                     zero_max_c, zero_max_gamma):
    " Get the number of 1's, random 0's and max 0's in each mini epoch. "
    n_zero = n_zero_rand + n_zero_max
    n_read = n_one + n_zero
    one_weight = _one_weight(n_one, n_zero, one_a, one_alpha)
    zero_weight = _zero_weight(n_read, zero_b, zero_beta)
    zero_max_weight = _zero_max_weight(
        n_read/n_samples, zero_max_c, zero_max_gamma)

    tot_zo_weight = one_weight * n_one + zero_weight * n_zero

    n_one_train = random_round(one_weight*n_one*n_train/tot_zo_weight)
    n_one_train = max(1, min(n_train-2, n_one_train))
    n_zero_train = n_train-n_one_train

    tot_rm_weight = 1*n_zero_rand + zero_max_weight*n_zero_max
    n_zero_rand_train = random_round(
        n_zero_train * 1*n_zero_rand/tot_rm_weight)
    n_zero_rand_train = max(1, min(n_zero_rand-1, n_zero_rand_train))
    n_zero_max_train = n_zero_train - n_zero_rand_train

    return n_one_train, n_zero_rand_train, n_zero_max_train


def fill_training(src_idx, n_train):
    n_copy = np.int(n_train/len(src_idx))
    n_sample = n_train - n_copy*len(src_idx)
    dest_idx = np.tile(src_idx, n_copy).reshape(-1)
    dest_idx = np.append(dest_idx,
                         np.random.choice(src_idx, n_sample, replace=False))
    return dest_idx


def triple_balance(X, y, train_idx, query_kwargs={"query_src": {}},
                   shuffle=True, **dist_kwargs):
    """
    A more advanced function that does resample the training set.
    Most likely only useful in combination with NN's, and possibly other
    stochastic classification methods.
    """
    # We want to know which training indices are from rand/max sampling.
    # If we have no information, assume everything is random.

    max_idx = np.array(query_kwargs["query_src"].get("max", []), dtype=np.int)
    rand_idx = np.array([], dtype=np.int)
    for qtype in query_kwargs["query_src"]:
        if qtype != "max":
            rand_idx = np.append(rand_idx, query_kwargs["query_src"][qtype])

    rand_idx = rand_idx.astype(int)
    # Write them back for next round.
    if shuffle:
        np.random.shuffle(rand_idx)
        np.random.shuffle(max_idx)

    if len(rand_idx) == 0 or len(max_idx) == 0:
        logging.debug("Warning: trying to use triple balance, but unable to"
                      f", because we have {len(max_idx)} max samples and "
                      f"{len(rand_idx)} random samples.")
        return full_sample(X, y, train_idx)

    # Split the idx into three groups: 1's, random 0's, max 0's.
    one_idx = train_idx[np.where(y[train_idx] == 1)]
    zero_max_idx = max_idx[np.where(y[max_idx] == 0)]
    zero_rand_idx = rand_idx[np.where(y[rand_idx] == 0)]

    if len(zero_rand_idx) == 0 or len(zero_max_idx) == 0:
        logging.debug("Warning: trying to use triple balance, but unable to"
                      f", because we have {len(zero_max_idx)} zero max samples"
                      f" and {len(zero_rand_idx)} random samples.")
        return full_sample(X, y, train_idx)

    n_one = len(one_idx)
    n_zero_rand = len(zero_rand_idx)
    n_zero_max = len(zero_max_idx)
    n_samples = len(y)
    n_train = len(train_idx)

    # Get the distribution of 1's, and random 0's and max 0's.
    n_one_train, n_zero_rand_train, n_zero_max_train = _get_triple_dist(
        n_one, n_zero_rand, n_zero_max, n_samples, n_train, **dist_kwargs)
    logging.debug(f"(1, 0_rand, 0_max) = "
                  f"({n_one_train}, {n_zero_rand_train}, {n_zero_max_train})")

    one_train_idx = fill_training(one_idx, n_one_train)
    zero_rand_train_idx = fill_training(zero_rand_idx, n_zero_rand_train)
    zero_max_train_idx = fill_training(zero_max_idx, n_zero_max_train)

#     print(one_train_idx, zero_rand_train_idx, zero_max_train_idx)
    all_idx = np.concatenate(
        [one_train_idx, zero_rand_train_idx, zero_max_train_idx])
    np.random.shuffle(all_idx)

    return X[all_idx], y[all_idx]
