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

from math import ceil

import numpy as np

from asreview.balance_strategies.base import BaseTrainData


class UndersampleTD(BaseTrainData):
    """
    Balancing class that undersamples the data with a given ratio.
    """
    def __init__(self, balance_kwargs={}, **__):
        super(UndersampleTD, self).__init__(balance_kwargs)

    @staticmethod
    def function():
        return undersample

    @staticmethod
    def description():
        return "undersampled training data"

    def default_kwargs(self):
        defaults = {}
        defaults['ratio'] = 1.0
        return defaults

    def hyperopt_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_ratio": hp.lognormal('bal_ratio', 0, 1),
        }
        return parameter_space


def undersample(X, y, train_idx, ratio=1.0):
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
        shuf_ind = np.append(one_ind, zero_ind[zero_under])

    np.random.shuffle(shuf_ind)
    return X[shuf_ind], y[shuf_ind]
