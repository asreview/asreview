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

# Code based on https://github.com/modAL-python/
# modAL/blob/dev/modAL/uncertainty.py
#
# Documentation:
# https://modal-python.readthedocs.io/en/latest/
# content/apireference/uncertainty.html
#
# MIT license - Copyright (c) 2019 Tivadar Danka

'''
Max sampling while saving prediction probabilities.
'''

from typing import Tuple

import numpy as np
from modAL.utils.data import modALinput
from modAL.utils.selection import multi_argmax
from modAL.utils.selection import shuffled_argmax
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError


def max_sampling(classifier: BaseEstimator,
                 X: modALinput,
                 n_instances: int = 1,
                 random_tie_break: bool = False,
                 pool_idx=None,
                 query_kwargs={},
                 **kwargs
                 ) -> Tuple[np.ndarray, modALinput]:
    """
    Maximum sampling query strategy.
    Selects the samples with the highest prediction probability.

    Parameters
    ----------
    classifier: BaseEstimator
        The classifier for which the labels are to be queried.
    X: modALinput
        The pool of samples to query from.
    n_instances: int
        Number of samples to be queried.
    random_tie_break: bool
        If True, shuffles utility scores to randomize the order.
        This can be used to break the tie when the highest
        utility score is not unique.
    **kwargs:
        Keyword arguments to be passed for
        the prediction measure function.

    Returns
    -------
    np.ndarray, modALinput
        The indices of the instances from X chosen to be labelled;
        the instances from X chosen to be labelled.
    """
    n_samples = X.shape[0]
    if pool_idx is None:
        pool_idx = np.arange(n_samples)

    # First attempt to get the probabilities from the dictionary.
    proba = query_kwargs.get('pred_proba', [])
    if len(proba) != n_samples:
        try:
            proba = classifier.predict_proba(X, **kwargs)
        except NotFittedError:
            proba = np.ones(shape=(n_samples, ))
        query_kwargs['pred_proba'] = proba

    proba = proba[pool_idx]
    if not random_tie_break:
        query_idx = multi_argmax(proba[:, 1], n_instances=n_instances)
    else:
        query_idx = shuffled_argmax(proba[:, 1], n_instances=n_instances)

    for idx in query_idx:
        query_kwargs['current_queries'][pool_idx[idx]] = "max"

    return pool_idx[query_idx], X[pool_idx[query_idx]]
