'''
Max sampling while saving prediction probabilities.
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


def max_sampling(classifier: BaseEstimator, X: modALinput,
                 n_instances: int = 1, random_tie_break: bool = False,
                 pred_proba=None, **kwargs
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
    try:
        proba = classifier.predict_proba(X, **kwargs, verbose=1)
    except NotFittedError:
        proba = np.ones(shape=(X.shape[0], ))

    if pred_proba is not None:
        pred_proba.append(proba)

#     print(proba)
#     print(n_instances)
    if not random_tie_break:
        query_idx = multi_argmax(proba[:, 0], n_instances=n_instances)
    else:
        query_idx = shuffled_argmax(proba[:, 0], n_instances=n_instances)

    return query_idx, X[query_idx]
