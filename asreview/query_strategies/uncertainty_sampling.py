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
Uncertainty sampling while saving probabilities.
'''

from typing import Tuple

import numpy as np
from modAL.utils.data import modALinput
from modAL.utils.selection import multi_argmax
from modAL.utils.selection import shuffled_argmax
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError


def classifier_uncertainty(
        classifier: BaseEstimator, X: modALinput, query_kwargs: dict = None,
        **predict_proba_kwargs
        ) -> np.ndarray:
    # calculate uncertainty for each point provided
    try:
        classwise_uncertainty = classifier.predict_proba(
            X, **predict_proba_kwargs)
    except NotFittedError:
        return np.ones(shape=(X.shape[0], ))
    if query_kwargs is not None:
        query_kwargs['pred_proba'] = classwise_uncertainty
    # for each point, select the maximum uncertainty
    uncertainty = 1 - np.max(classwise_uncertainty, axis=1)
    return uncertainty


def uncertainty_sampling(classifier: BaseEstimator,
                         X: modALinput,
                         n_instances: int = 1,
                         random_tie_break: bool = False,
                         pool_idx=None,
                         query_kwargs={},
                         **uncertainty_measure_kwargs
                         ) -> Tuple[np.ndarray, modALinput]:
    """
    Uncertainty sampling query strategy.
    Selects the least sure instances for labelling.

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
    **uncertainty_measure_kwargs:
        Keyword arguments to be passed for
        the uncertainty measure function.

    Returns
    -------
    np.ndarray, modALinput
        The indices of the instances from X chosen to be labelled;
        the instances from X chosen to be labelled.
    """
    n_samples = X.shape[0]
    if pool_idx is None:
        pool_idx = np.arange(n_samples)
    query_kwargs['pred_proba'] = []

    uncertainty = classifier_uncertainty(
        classifier, X[pool_idx], query_kwargs,
        **uncertainty_measure_kwargs)

    if not random_tie_break:
        query_idx = multi_argmax(uncertainty, n_instances=n_instances)
    else:
        query_idx = shuffled_argmax(uncertainty, n_instances=n_instances)

    return query_idx, X[query_idx]
