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


def max_sampling(classifier: BaseEstimator,
                 X: modALinput,
                 n_instances: int = 1,
                 random_tie_break: bool = False,
                 pool_idx=None,
                 extra_vars={},
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
    try:
        proba = classifier.predict_proba(X[pool_idx], **kwargs, verbose=1)
    except NotFittedError:
        proba = np.ones(shape=(len(pool_idx), ))

    extra_vars['pred_proba'] = proba

    if not random_tie_break:
        query_idx = multi_argmax(proba[:, 1], n_instances=n_instances)
    else:
        query_idx = shuffled_argmax(proba[:, 1], n_instances=n_instances)

    return pool_idx[query_idx], X[pool_idx[query_idx]]
