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

__all__ = ["DoubleBalance"]

from math import floor
from math import log

import numpy as np
from sklearn.utils import check_random_state

from asreview.models.balance.base import BaseBalance


def _rel_weight(n_one, n_zero, a, alpha):
    """Get the weight of the ones."""
    weight = a * (n_one / n_zero) ** (-alpha)
    return weight


def _irrel_weight(n_read, b, beta):
    """Get the weight of the zeros."""
    weight = 1 - (1 - b) * (1 + log(n_read)) ** (-beta)
    return weight


def _random_round(value, random_state):
    """Round up or down, depending on how far the value is.

    For example: 8.1 would be rounded to 8, 90% of the time, and rounded
    to 9, 10% of the time.
    """
    base = int(floor(value))
    if check_random_state(random_state).rand() < value - base:
        base += 1
    return base


class DoubleBalance(BaseBalance):
    """Double balance strategy (``double``).

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

    def __init__(self, a=2.155, alpha=0.94, b=0.789, beta=1.0, random_state=None):
        super().__init__()
        self.a = a
        self.alpha = alpha
        self.b = b
        self.beta = beta
        self._random_state = random_state

    def sample(self, labeled_idx, y):
        """Resample the training data.

        Arguments
        ---------
        labeled_idx: numpy.ndarray
            Training indices, that is all records that have been reviewed.
        y: numpy.ndarray
            Labels for all papers.

        Returns
        -------
        numpy.ndarray, numpy.ndarray
            idx_balance, y_balance: resampled training indices and labels.
        """

        rel_idx = labeled_idx[np.where(y == 1)]
        irrel_idx = labeled_idx[np.where(y == 0)]

        n_train = len(rel_idx) + len(irrel_idx)

        # Compute sampling weights.

        print(y.dtype, np.where(y == 1), len(irrel_idx))

        rel_weight = _rel_weight(len(rel_idx), len(irrel_idx), self.a, self.alpha)
        irrel_weight = _irrel_weight(len(rel_idx) + len(irrel_idx), self.b, self.beta)
        tot_zo_weight = rel_weight * len(rel_idx) + irrel_weight * len(irrel_idx)

        # Number of inclusions to sample.
        n_rel_train = _random_round(
            rel_weight * len(rel_idx) * n_train / tot_zo_weight, self._random_state
        )
        # Should be at least 1, and at least two spots should be for irrelevant.
        n_rel_train = max(1, min(n_train - 2, n_rel_train))
        # Number of irrelevant to sample
        n_irrel_train = n_train - n_rel_train

        # Sample records of ones and zeroes
        rel_train_idx = fill_training(rel_idx, n_rel_train, self._random_state)
        irrel_train_idx = fill_training(irrel_idx, n_irrel_train, self._random_state)

        p = check_random_state(self._random_state).permutation(
            len(rel_train_idx) + len(irrel_train_idx)
        )
        return (
            np.append(rel_train_idx, irrel_train_idx)[p],
            np.append(np.ones(len(rel_train_idx)), np.zeros(len(irrel_train_idx)))[p],
        )


def fill_training(src_idx, n_train, random_state):
    """Copy/sample until there are n_train indices sampled/copied."""
    # Number of copies needed.
    n_copy = int(n_train / len(src_idx))
    # For the remainder, use sampling.
    n_sample = n_train - n_copy * len(src_idx)

    # Copy indices
    dest_idx = np.tile(src_idx, n_copy).reshape(-1)
    # Add samples
    dest_idx = np.append(
        dest_idx,
        check_random_state(random_state).choice(src_idx, n_sample, replace=False),
    )
    return dest_idx
