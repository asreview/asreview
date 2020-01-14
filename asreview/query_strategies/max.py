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

'''
Max sampling while saving prediction probabilities.
'''

from modAL.utils.selection import multi_argmax
from modAL.utils.selection import shuffled_argmax

from asreview.query_strategies.base import ProbaQueryStrategy


class MaxQuery(ProbaQueryStrategy):
    "Maximum sampling query strategy."
    name = "max"

    def __init__(self, random_tie_break=False):
        """Initialize the max query strategy.

        Arguments:
        ----------
        random_tie_break: bool
            If true randomly decide which ones to include by tie-break.
        """
        super(MaxQuery, self).__init__()
        self.random_tie_break = random_tie_break

    def _query(self, X, pool_idx, n_instances=1, proba=None):
        proba = proba[pool_idx]
        if not self.random_tie_break:
            query_idx = multi_argmax(proba[:, 1], n_instances=n_instances)
        else:
            query_idx = shuffled_argmax(proba[:, 1], n_instances=n_instances)

        return pool_idx[query_idx], X[pool_idx[query_idx]]
