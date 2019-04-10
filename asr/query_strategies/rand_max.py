'''
Created on 9 Apr 2019

@author: qubix
'''


from typing import Tuple

import numpy as np
from sklearn.base import BaseEstimator

from modAL.utils.data import modALinput
from math import floor

from asr.query_strategies.max_sampling import max_sampling
from asr.query_strategies.random_sampling import random_sampling


def rand_max_sampling(classifier: BaseEstimator,
                      X: modALinput,
                      pool_idx=None,
                      n_instances: int = 1,
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
        max_frac = extra_vars['max_frac']
    except KeyError:
        max_frac = 0.95
        extra_vars['max_frac'] = max_frac

    n_instance_max = floor(n_instances*max_frac)
    if np.random.random_sample() < n_instances*max_frac-n_instance_max:
        n_instance_max += 1
    n_instance_rand = n_instances-n_instance_max

    max_idx, _ = max_sampling(classifier, X, pool_idx=pool_idx,
                              n_instances=n_instance_max,
                              extra_vars=extra_vars,
                              **kwargs)

    new_pool_idx = np.delete(pool_idx, max_idx, axis=0)
    rand_idx, _ = random_sampling(classifier, X, pool_idx=new_pool_idx,
                                  n_instances=n_instance_rand,
                                  extra_results=extra_vars,
                                  **kwargs)

    extra_vars['last_max_idx'] = max_idx
    extra_vars['last_rand_idx'] = rand_idx
    query_idx = np.append(max_idx, rand_idx)

    return query_idx, X[query_idx]
