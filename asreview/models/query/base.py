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

    def query(self, feature_matrix, relevance_scores, n_instances=None, **kwargs):
        """Put records in ranked order.

        Arguments
        ---------
        feature_matrix: numpy.ndarray
            Feature matrix where every row contains the features of a record.
        relevance_scores: numpy.ndarray
            Relevance scores as predicted by the classifier.
        n_instances: int
            Number of records to query. If None returns all records in ranked order.

        Returns
        -------
        numpy.ndarray or (numpy.ndarray, np.ndarray)
            The QueryStrategy ranks the row numbers of the feature matrix. It returns
            an array of shape (n_instances,) containing the row indices in ranked
            order.
            If n_instances is None, returns all row numbers in ranked order. If
            n_instances is an integer, it only returns the top n_instances.
            If return_classifier_scores=True, also returns a second array with the same
            number of rows as the feature matrix, containing the relevance scores
            predicted by the classifier. If the classifier is not used, this will be
            None.
        """
        if n_instances is None:
            n_instances = feature_matrix.shape[0]

        return self._query(
            feature_matrix=feature_matrix,
            relevance_scores=relevance_scores,
            n_instances=n_instances,
            **kwargs,
        )

    @abstractmethod
    def _query(self, feature_matrix, relevance_scores, n_instances, **kwargs):
        raise NotImplementedError
