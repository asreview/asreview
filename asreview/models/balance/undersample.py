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

from math import ceil

import numpy as np

from asreview.models.balance.base import BaseBalance
from asreview.utils import get_random_state


class UndersampleBalance(BaseBalance):
    """Undersampling balance strategy.

    This undersamples the data, leaving out excluded papers so that the
    included and excluded papers are in some particular ratio (closer to one).

    Arguments
    ---------
    ratio: double
        Undersampling ratio of the zero's. If for example we set a ratio of
        0.25, we would sample only a quarter of the zeros and all the ones.
    """

    name = "undersample"
    label = "Undersampling"

    def __init__(self, ratio=1.0, random_state=None):
        """Initialize the undersampling balance strategy."""
        super(UndersampleBalance, self).__init__()
        self.ratio = ratio
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
        one_ind = train_idx[np.where(y[train_idx] == 1)]
        zero_ind = train_idx[np.where(y[train_idx] == 0)]

        n_one = len(one_ind)
        n_zero = len(zero_ind)

        # If we don't have an excess of 0's, give back all training_samples.
        if n_one / n_zero >= self.ratio:
            shuf_ind = np.append(one_ind, zero_ind)
        else:
            n_zero_epoch = ceil(n_one / self.ratio)
            zero_under = self._random_state.choice(
                np.arange(n_zero), n_zero_epoch, replace=False)
            shuf_ind = np.append(one_ind, zero_ind[zero_under])

        self._random_state.shuffle(shuf_ind)
        return X[shuf_ind], y[shuf_ind]

    def full_hyper_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_ratio": hp.lognormal('bal_ratio', 0, 1),
        }
        return parameter_space, {}
