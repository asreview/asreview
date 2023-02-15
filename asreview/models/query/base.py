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

from abc import abstractmethod

from asreview.models.base import BaseModel


class BaseQueryStrategy(BaseModel):
    """Abstract class for query strategies."""

    name = "base-query"

    @abstractmethod
    def query(self,
              X,
              classifier=None,
              n_instances=None,
              **kwargs):
        """Query new instances.

        Arguments
        ---------
        X: numpy.ndarray
            Feature matrix to choose samples from.
        classifier: SKLearnModel
            Trained classifier to compute probabilities if they are necessary.
        n_instances: int
            Number of instances to query.

        Returns
        -------
        (numpy.ndarray, numpy.ndarray)
            The first is an array of shape (n_instances,) containing the row
            indices of the new instances in query order. The second is an array
            of shape (n_instances, n_feature_matrix_columns), containing the
            feature vectors of the new instances.
        """
        raise NotImplementedError


class ProbaQueryStrategy(BaseQueryStrategy):
    name = "proba"

    def query(self, X, classifier, n_instances=None, **kwargs):
        """Query method for strategies which use class probabilities.
        """
        if n_instances is None:
            n_instances = X.shape[0]

        predictions = classifier.predict_proba(X)

        query_idx = self._query(predictions, n_instances, X)

        return query_idx

    @abstractmethod
    def _query(self, predictions, n_instances, X=None):
        raise NotImplementedError
