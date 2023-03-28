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

from asreview.models.balance.base import BaseBalance


class SimpleBalance(BaseBalance):
    """No balance strategy (``simple``).

    Use all training data.
    """

    name = "simple"
    label = "Simple (no balancing)"

    def sample(self, X, y, train_idx):
        """
        Function that does not resample the training set.

        Arguments
        ---------
        X: numpy.ndarray
            Complete matrix of all samples.
        y: numpy.ndarray
            Classified results of all samples.

        Returns
        -------
        numpy.ndarray:
            Training samples.
        numpy.ndarray:
            Classification of training samples.
        """
        return X[train_idx], y[train_idx]
