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
"""Random sampling strategy."""

import numpy as np

from asreview.models.query.base import NotProbaQueryStrategy
from asreview.utils import get_random_state


class RandomQuery(NotProbaQueryStrategy):
    """Random query strategy.

    Randomly select samples with no regard to model assigned probabilities.

    .. warning::
        Selecting this option means your review is not going to be
        accelerated by ASReview.

    """
    name = "random"
    label = "Random"

    def __init__(self, random_state=None):
        super(RandomQuery, self).__init__()
        self._random_state = get_random_state(random_state)

    def _query(self, X, pool_idx, n_instances=1):
        n_samples = len(pool_idx)
        query_idx = self._random_state.choice(
            np.arange(n_samples), n_instances, replace=False)
        return pool_idx[query_idx], X[pool_idx[query_idx]]
