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

__all__ = ["BaseBalance"]

from abc import abstractmethod

from asreview.models.base import BaseModel


class BaseBalance(BaseModel):
    """Abstract class for balance strategies."""

    name = "base-balance"

    @abstractmethod
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
        raise NotImplementedError
