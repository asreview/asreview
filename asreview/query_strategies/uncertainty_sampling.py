'''
Uncertainty sampling while saving probabilities.
'''

# Code based on https://github.com/modAL-python/
# modAL/blob/dev/modAL/uncertainty.py
#
# Documentation:
# https://modal-python.readthedocs.io/en/latest/
# content/apireference/uncertainty.html
#
# MIT license - Copyright (c) 2019 Tivadar Danka

from typing import Tuple

import numpy as np
from sklearn.exceptions import NotFittedError
from sklearn.base import BaseEstimator

from modAL.utils.data import modALinput
from modAL.utils.selection import multi_argmax, shuffled_argmax


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
