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

__all__ = ["BaseQueryStrategy"]

from abc import abstractmethod

from asreview.models.base import BaseModel


class BaseQueryStrategy(BaseModel):
    """Abstract class for query strategies."""

    name = "base"

    @abstractmethod
    def query(self, feature_matrix, relevance_scores, **kwargs):
        """Put records in ranked order.

        Parameters
        ----------
        feature_matrix: numpy.ndarray
            Feature matrix where every row contains the features of a record.
        relevance_scores: numpy.ndarray
            Relevance scores as predicted by the classifier.

        Returns
        -------
        numpy.ndarray
            The QueryStrategy ranks the row numbers of the feature matrix. It returns
            an array of shape (len(feature_matrix),) containing the row indices in ranked
            order.
        """
        raise NotImplementedError
