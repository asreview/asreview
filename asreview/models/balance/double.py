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

from math import log, floor

import numpy as np

from asreview.models.balance.base import BaseBalance
from asreview.models.balance.simple import SimpleBalance
from asreview.utils import get_random_state


class DoubleBalance(BaseBalance):
    """Double balance strategy.

    Class to get the two way rebalancing function and arguments.
    It super samples ones depending on the number of 0's and total number
    of samples in the training data.

    Arguments
    ---------
    a: float
        Governs the weight of the 1's. Higher values mean linearly more 1's
        in your training sample.
    alpha: float
        Governs the scaling the weight of the 1's, as a function of the
        ratio of ones to zeros. A positive value means that the lower the
        ratio of zeros to ones, the higher the weight of the ones.
    b: float
        Governs how strongly we want to sample depending on the total
        number of samples. A value of 1 means no dependence on the total
        number of samples, while lower values mean increasingly stronger
        dependence on the number of samples.
    beta: float
        Governs the scaling of the weight of the zeros depending on the
        number of samples. Higher values means that larger samples are more
        strongly penalizing zeros.
    """

    name = "double"
    label = "Dynamic resampling (Double)"

    def __init__(self,
                 a=2.155,
                 alpha=0.94,
                 b=0.789,
                 beta=1.0,
                 random_state=None):
        super(DoubleBalance, self).__init__()
        self.a = a
        self.alpha = alpha
        self.b = b
        self.beta = beta
        self.fallback_model = SimpleBalance()
        self._random_state = get_random_state(random_state)

    def sample(self, X, y, train_idx, shared):
        """Resample the training data.

        Arguments
        ---------
        X: numpy.ndarray
            Complete feature matrix.
        y: numpy.ndarray
            Labels for all papers.
        train_idx: numpy.ndarray
            Training indices, that is all papers that have been reviewed.
        shared: dict
            Dictionary to share data between balancing models and other models.

        Returns
        -------
        numpy.ndarray,numpy.ndarray:
            X_train, y_train: the resampled matrix, labels.
        """
        # Get inclusions and exclusions
        one_idx = train_idx[np.where(y[train_idx] == 1)]
        zero_idx = train_idx[np.where(y[train_idx] == 0)]

        # Fall back to simple sampling if we have only ones or zeroes.
        if len(one_idx) == 0 or len(zero_idx) == 0:
            self.fallback_model.sample(X, y, train_idx, shared)

        n_one = len(one_idx)
        n_zero = len(zero_idx)
        n_train = n_one + n_zero

        # Compute sampling weights.
        one_weight = _one_weight(n_one, n_zero, self.a, self.alpha)
        zero_weight = _zero_weight(n_one + n_zero, self.b, self.beta)
        tot_zo_weight = one_weight * n_one + zero_weight * n_zero
        # Number of inclusions to sample.
        n_one_train = random_round(
            one_weight * n_one * n_train / tot_zo_weight, self._random_state)
        # Should be at least 1, and at least two spots should be for exclusions.
        n_one_train = max(1, min(n_train - 2, n_one_train))
        # Number of exclusions to sample
        n_zero_train = n_train - n_one_train

        # Sample records of ones and zeroes
        one_train_idx = fill_training(one_idx, n_one_train, self._random_state)
        zero_train_idx = fill_training(zero_idx, n_zero_train,
                                       self._random_state)
        # Merge and shuffle.
        all_idx = np.concatenate([one_train_idx, zero_train_idx])
        self._random_state.shuffle(all_idx)

        # Return resampled feature matrix and labels.
        return X[all_idx], y[all_idx]

    def full_hyper_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_a": hp.lognormal("bal_a", 0, 1),
            "bal_alpha": hp.uniform("bal_alpha", 0, 2),
            "bal_b": hp.uniform("bal_b", 0, 1),
            # "bal_beta": hp.uniform("bal_beta", 0, 2),
        }
        return parameter_space, {}


def _one_weight(n_one, n_zero, a, alpha):
    """Get the weight of the ones."""
    weight = a * (n_one / n_zero)**(-alpha)
    return weight


def _zero_weight(n_read, b, beta):
    """Get the weight of the zeros."""
    weight = 1 - (1 - b) * (1 + log(n_read))**(-beta)
    return weight


def random_round(value, random_state):
    """Round up or down, depending on how far the value is.

    For example: 8.1 would be rounded to 8, 90% of the time, and rounded
    to 9, 10% of the time.
    """
    base = int(floor(value))
    if random_state.rand() < value - base:
        base += 1
    return base


def fill_training(src_idx, n_train, random_state):
    """Copy/sample until there are n_train indices sampled/copied.
    """
    # Number of copies needed.
    n_copy = np.int(n_train / len(src_idx))
    # For the remainder, use sampling.
    n_sample = n_train - n_copy * len(src_idx)

    # Copy indices
    dest_idx = np.tile(src_idx, n_copy).reshape(-1)
    # Add samples
    dest_idx = np.append(dest_idx,
                         random_state.choice(src_idx, n_sample, replace=False))
    return dest_idx
