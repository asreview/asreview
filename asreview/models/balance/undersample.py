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

__all__ = ["UndersampleBalance"]

from math import ceil

import numpy as np
from sklearn.utils import check_random_state

from asreview.models.balance.base import BaseBalance


class UndersampleBalance(BaseBalance):
    """Undersampling balance strategy (``undersample``).

    This undersamples the data, leaving out irrelevant records so that the
    relevant and irrelevant records are in some particular ratio (closer to one).

    Parameters
    ----------
    ratio: float
        Undersampling ratio relevant to irrelevant. If for example we set a ratio of
        0.25, we would sample all the relevant and 4 times irrelevant.
    """

    name = "undersample"
    label = "Undersampling"

    def __init__(self, ratio=1.0, random_state=None):
        """Initialize the undersampling balance strategy."""
        super().__init__()
        self.ratio = ratio
        self._random_state = check_random_state(random_state)

    def sample(self, labeled_idx, y):
        """Resample the training data.

        Parameters
        ----------
        labeled_idx: numpy.ndarray
            Training indices, that is all records that have been reviewed.
        y: numpy.ndarray
            Labels for all records.

        Returns
        -------
        numpy.ndarray, numpy.ndarray
            idx_balance, y_balance: resampled training indices and labels.
        """

        if self.ratio == 0:
            raise ValueError("Ratio cannot be zero.")

        rel_idx = labeled_idx[np.where(y == 1)]
        irrel_idx = labeled_idx[np.where(y == 0)]

        if len(rel_idx) == 0 or len(irrel_idx) == 0:
            return labeled_idx, y

        # If we don't have an enough 0's, give back all.
        if len(rel_idx) / len(irrel_idx) >= self.ratio:
            return labeled_idx, y

        rn = check_random_state(self._random_state)

        n_irrel_epoch = ceil(len(rel_idx) / self.ratio)
        zero_under_ind = rn.choice(irrel_idx, n_irrel_epoch, replace=False)

        p = rn.permutation(len(rel_idx) + n_irrel_epoch)
        return (
            np.append(rel_idx, zero_under_ind)[p],
            np.append(np.ones(len(rel_idx)), np.zeros(n_irrel_epoch))[p],
        )
