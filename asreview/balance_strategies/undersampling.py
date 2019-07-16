from math import ceil

import numpy as np

from asr.balance_strategies.base import BaseTrainData


class UndersampleTD(BaseTrainData):
    """
    Balancing class that undersamples the data with a given ratio.
    """
    def __init__(self, balance_kwargs, fit_kwargs):
        super(UndersampleTD, self).__init__(balance_kwargs)
        if 'shuffle' in fit_kwargs:
            self.balance_kwargs['shuffle'] = fit_kwargs['shuffle']
            fit_kwargs['shuffle'] = False

    def func_kwargs(self):
        return undersample, self.balance_kwargs

    def default_kwargs(self):
        defaults = {}
        defaults['shuffle'] = True
        defaults['ratio'] = 1.0
        return defaults


def undersample(X, y, train_idx, ratio=1.0, shuffle=True):
    """ Undersample the training set to balance 1's and 0's. """

    one_ind = train_idx[np.where(y[train_idx] == 1)]
    zero_ind = train_idx[np.where(y[train_idx] == 0)]

    n_one = len(one_ind)
    n_zero = len(zero_ind)

    # If we don't have an excess of 0's, give back all training_samples.
    if n_one/n_zero >= ratio:
        shuf_ind = np.append(one_ind, zero_ind)
    else:
        n_zero_epoch = ceil(n_one/ratio)
        zero_under = np.random.choice(np.arange(n_zero), n_zero_epoch,
                                      replace=False)
        shuf_ind = np.append(one_ind, zero_under)

    if shuffle:
        np.random.shuffle(shuf_ind)
    return X[shuf_ind], y[shuf_ind]
