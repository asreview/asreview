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

from abc import ABC
import inspect

import numpy as np
from sklearn.exceptions import NotFittedError


class BaseQueryStrategy(ABC):
    "Abstract class for query strategies."
    name = "base"

    def query(self, classifier, X, pool_idx=None, n_instances=1, shared={}):
        n_samples = X.shape[0]
        if pool_idx is None:
            pool_idx = np.arange(n_samples)

        if self.use_proba:
            proba = shared.get('pred_proba', [])
            if len(proba) != n_samples:
                try:
                    proba = classifier.predict_proba(X)
                except NotFittedError:
                    proba = np.ones(shape=(n_samples, ))
                shared['pred_proba'] = proba
            query_idx, X_query = self._query(X, pool_idx, n_instances, proba)
        else:
            query_idx, X_query = self._query(X, pool_idx, n_instances)

        for idx in query_idx:
            shared['current_queries'][idx] = self.name

        return query_idx, X_query

    @property
    def default_param(self):
        signature = inspect.signature(self.__init__)
        return {
            k: v.default
            for k, v in signature.parameters.items()
            if v.default is not inspect.Parameter.empty
        }
