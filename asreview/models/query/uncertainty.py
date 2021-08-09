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
"""Uncertainty sampling while saving probabilities."""

import numpy as np

from asreview.models.query.base import ProbaQueryStrategy


class UncertaintyQuery(ProbaQueryStrategy):
    """Uncertainty query strategy.

    Choose the most uncertain samples according to the model (i.e. closest to
    0.5 probability). Doesn’t work very well in the case of LSTM’s, since the
    probabilities are rather arbitrary.

    """

    name = "uncertainty"
    label = "Uncertainty"

    def _query(self, X, pool_idx, n_instances=1, proba=None):
        uncertainty = 1 - np.max(proba[pool_idx], axis=1)
        query_idx = np.argsort(-uncertainty)[:n_instances]
        return pool_idx[query_idx], X[pool_idx[query_idx]]
