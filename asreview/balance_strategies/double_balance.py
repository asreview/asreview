from math import log, floor

import numpy as np

from asreview.balance_strategies.base import BaseTrainData


class DoubleBalanceTD(BaseTrainData):
    """
    Class to get the three way rebalancing function and arguments.
    It divides the data into three groups: 1's, 0's from random sampling,
    and 0's from max sampling. Thus it only makes sense to use this class in
    combination with the rand_max query strategy.
    """
    def __init__(self, balance_kwargs={}, **__):
        super(DoubleBalanceTD, self).__init__(balance_kwargs)

    @staticmethod
    def function():
        return double_balance

    @staticmethod
    def description():
        return "double balanced (max,rand) training data."

    def default_kwargs(self):
        defaults = {}
        defaults['a'] = 2.155
        defaults['alpha'] = 0.94
        defaults['b'] = 0.789
        defaults['beta'] = 1.0
        defaults['shuffle'] = True
        return defaults

    def hyperopt_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_a": hp.lognormal("bal_a", 0, 1),
            "bal_alpha": hp.uniform("bal_alpha", 0, 2),
            "bal_b": hp.uniform("bal_b", 0, 1),
            # "bal_beta": hp.uniform("bal_beta", 0, 2),
        }
        return parameter_space


def double_balance(X, y, train_idx, a=2.155, alpha=0.94, b=0.789, beta=1.0):
    one_idx = train_idx[np.where(y[train_idx] == 1)]
    zero_idx = train_idx[np.where(y[train_idx] == 0)]
    n_one = len(one_idx)
    n_zero = len(zero_idx)
    n_train = n_one + n_zero

    one_weight = _one_weight(n_one, n_zero, a, alpha)
    zero_weight = _zero_weight(n_one+n_zero, b, beta)
    tot_zo_weight = one_weight * n_one + zero_weight * n_zero
    n_one_train = random_round(one_weight*n_one*n_train/tot_zo_weight)
    n_one_train = max(1, min(n_train-2, n_one_train))
    n_zero_train = n_train-n_one_train

    one_train_idx = fill_training(one_idx, n_one_train)
    zero_train_idx = fill_training(zero_idx, n_zero_train)

    all_idx = np.concatenate([one_train_idx, zero_train_idx])
    np.random.shuffle(all_idx)

    return X[all_idx], y[all_idx]


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


def random_round(value):
    base = int(floor(value))
    if np.random.rand() < value-base:
        base += 1
    return base


def fill_training(src_idx, n_train):
    n_copy = np.int(n_train/len(src_idx))
    n_sample = n_train - n_copy*len(src_idx)
    dest_idx = np.tile(src_idx, n_copy).reshape(-1)
    dest_idx = np.append(dest_idx,
                         np.random.choice(src_idx, n_sample, replace=False))
    return dest_idx
