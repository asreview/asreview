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

__all__ = ["BaseQueryStrategy", "ProbaQueryStrategy"]

from abc import abstractmethod

from asreview.models.base import BaseModel


class BaseQueryStrategy(BaseModel):
    """Abstract class for query strategies."""

    name = "base-query"

    @abstractmethod
    def query(
        self,
        X,
        classifier=None,
        n_instances=None,
        return_classifier_scores=False,
        **kwargs
    ):
        """Put records in ranked order.

        Arguments
        ---------
        X: numpy.ndarray
            Feature matrix where every row contains the features of a record.
        classifier: SKLearnModel
            Trained classifier to compute relevance scores.
        n_instances: int
            Number of records to query. If None returns all records in ranked order.
        return_classifier_score : bool
            Return the relevance scores produced by the classifier.

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
        raise NotImplementedError


class ProbaQueryStrategy(BaseQueryStrategy):
    name = "proba"

    def query(
        self, X, classifier, n_instances=None, return_classifier_scores=False, **kwargs
    ):
        """Query method for strategies which use class probabilities."""
        if n_instances is None:
            n_instances = X.shape[0]

        predictions = classifier.predict_proba(X)

        query_idx = self._query(predictions, n_instances, X)

        if return_classifier_scores:
            return query_idx, predictions
        else:
            return query_idx

    @abstractmethod
    def _query(self, predictions, n_instances, X=None):
        raise NotImplementedError
