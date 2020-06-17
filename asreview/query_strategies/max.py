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

"""Max sampling while saving prediction probabilities."""

import numpy as np

from asreview.query_strategies.base import ProbaQueryStrategy


class MaxQuery(ProbaQueryStrategy):
    """Maximum sampling query strategy."""

    name = "max"

    def _query(self, X, pool_idx, n_instances=1, proba=None):
        proba = proba[pool_idx]
        query_idx = np.argsort(proba[:, 0])[:n_instances]

        return pool_idx[query_idx], X[pool_idx[query_idx]]
