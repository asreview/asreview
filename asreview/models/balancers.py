# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

from sklearn.base import BaseEstimator
from sklearn.utils.class_weight import compute_sample_weight as _compute_sample_weight

__all__ = [
    "Balanced",
]


class Balanced(BaseEstimator):
    """Balanced sample weight

    Parameters
    ----------
    ratio: float
        The ratio of the number of samples in class 0 to the number of samples
        in class 1.

    """

    name = "balanced"
    label = "Balanced Sample Weight"

    def __init__(self, ratio=1.0):
        self.ratio = ratio

    def compute_sample_weight(self, y):
        if len(set(y)) != 2:
            raise ValueError("Only binary classification is supported.")

        weights = _compute_sample_weight(
            {1: 1.0, 0: sum(y == 1) / (self.ratio * sum(y == 0))}, y=y
        )
        return weights * (len(y) / sum(weights))
