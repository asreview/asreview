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

from asreview.balance_strategies.base import BaseBalance


class SimpleBalance(BaseBalance):
    name = "simple"

    def sample(self, X, y, train_idx, shared):
        """
        Function that does not resample the training set.

        Arguments
        ---------
        X: np.array
            Complete matrix of all samples.
        y: np.array
            Classified results of all samples.
        extra_vars: dict:
            Extra variables that can be passed around between functions.

        Returns
        -------
        np.array:
            Training samples.
        np.array:
            Classification of training samples.
        """
        return X[train_idx], y[train_idx]
