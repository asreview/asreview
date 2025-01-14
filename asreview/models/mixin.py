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

__all__ = ["QueryMixin"]


class QueryMixin:
    """Mixin class for all query strategies in ASReview."""

    def query(self, p):
        """Rank the instances of the feature matrix.

        Arguments
        ---------
        p: numpy.ndarray
            The probability of inclusion for each record in the feature matrix.

        Returns
        -------
        numpy.ndarray
            The QueryStrategy ranks the row numbers of the feature matrix. It returns
            an array of shape (len(X),) containing the row indices in ranked
            order.
        """
        raise NotImplementedError
