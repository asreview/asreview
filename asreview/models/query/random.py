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
"""Random sampling strategy."""

__all__ = ["RandomQuery"]

import numpy as np
from sklearn.utils import check_random_state


from asreview.models.query.base import BaseQueryStrategy


class RandomQuery(BaseQueryStrategy):
    """Random query strategy (``random``).

    Randomly select samples with no regard to model assigned probabilities.

    .. warning::
        Selecting this option means your review is not going to be
        accelerated by ASReview.

    """

    name = "random"
    label = "Random"

    def __init__(self, random_state=None):
        super().__init__()
        self._random_state = random_state

    def query(
        self,
        X,
        classifier=None,
        n_instances=None,
        return_classifier_scores=False,
        **kwargs,
    ):
        if n_instances is None:
            n_instances = X.shape[0]

        query_idx = check_random_state(self._random_state).choice(
            np.arange(X.shape[0]), n_instances, replace=False
        )

        if return_classifier_scores:
            return query_idx, None
        else:
            return query_idx
