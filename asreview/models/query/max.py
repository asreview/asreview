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
"""Max sampling while saving prediction probabilities."""

import numpy as np

from asreview.models.query.base import ProbaQueryStrategy


class MaxQuery(ProbaQueryStrategy):
    """Maximum query strategy.

    Choose the most likely samples to be included according to the model.
    """

    name = "max"
    label = "Maximum"

    def _query(self, predictions, n_instances, X=None):
        query_indices = np.argsort(predictions[:, 0])[:n_instances]

        return query_indices
