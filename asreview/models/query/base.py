# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

import numpy as np
from sklearn.exceptions import NotFittedError

from asreview.models.base import BaseModel


class BaseQueryStrategy(BaseModel):
    """Abstract class for query strategies."""

    name = "base-query"

    @abstractmethod
    def query(self,
              X,
              classifier=None,
              pool_idx=None,
              n_instances=1,
              shared={}):
        """Query new instances.

        Arguments
        ---------
        X: numpy.ndarray
            Feature matrix to choose samples from.
        classifier: SKLearnModel
            Trained classifier to compute probabilities if they are necessary.
        pool_idx: numpy.ndarray
            Indices of samples that are still in the pool.
        n_instances: int
            Number of instances to query.
        shared: dict
            Dictionary for exchange between query strategies and others.
            It is mainly used to store the current class probabilities,
            and the source of the queries; which query strategy has produced
            which index.
        """
        raise NotImplementedError


class ProbaQueryStrategy(BaseQueryStrategy):
    name = "proba"

    def query(self, X, classifier, pool_idx=None, n_instances=1, shared={}):
        """Query method for strategies which use class probabilities.
        """
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        proba = shared.get('pred_proba', [])
        if len(proba) != n_samples:
            try:
                proba = classifier.predict_proba(X)
            except NotFittedError:
                proba = np.ones(shape=(n_samples, ))
            shared['pred_proba'] = proba
        query_idx, X_query = self._query(X, pool_idx, n_instances, proba)

        for idx in query_idx:
            shared['current_queries'][idx] = self.name

        return query_idx, X_query

    @abstractmethod
    def _query(self, X, pool_idx, n_instances, proba):
        raise NotImplementedError


class NotProbaQueryStrategy(BaseQueryStrategy):
    name = "not_proba"

    def query(self, X, classifier, pool_idx=None, n_instances=1, shared={}):
        """Query method for strategies which do not use class probabilities
        """
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        query_idx, X_query = self._query(X, pool_idx, n_instances)

        for idx in query_idx:
            shared['current_queries'][idx] = self.name

        return query_idx, X_query

    @abstractmethod
    def _query(self, X, pool_idx, n_instances, proba):
        raise NotImplementedError
