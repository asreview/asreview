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
    Combination of random and maximum sampling.
    By default samples the 95% of the instances with max sampling,
    and 5% of the samples with random sampling.

    Parameters
    ----------
    classifier: BaseEstimator
        The classifier for which the labels are to be queried.
    X: modALinput
        The whole input matrix.
    pool_idx: np.array
        Indices of samples that are in the pool.
    n_instances: int
        Total number of samples to be queried.
    extra_vars: dict
        dictionary to pass through settings (such as the max/rand ratio),
        as well as the indices that were obtained using max & random sampling.
    **kwargs:
        Keyword arguments to be passed on to random/max sampling.

    Returns
    -------
    np.ndarray, modALinput
        The indices of the instances from X chosen to be labelled;
        the instances from X chosen to be labelled.
    """

    n_samples = X.shape[0]
    if pool_idx is None:
        pool_idx = np.arange(n_samples)

    # Set the fraction of maximum sampling. Defaults to 95% max, 5% rand.
    rand_max_frac = extra_vars.get('rand_max_frac', 0.05)
    max_frac = 1-rand_max_frac

    # Get the discrete number of instances for rand/max sampling.
    n_instance_max = floor(n_instances*max_frac)
    if np.random.random_sample() < n_instances*max_frac-n_instance_max:
        n_instance_max += 1
    n_instance_rand = n_instances-n_instance_max

    # Do max sampling.
    max_idx, _ = max_sampling(classifier, X, pool_idx=pool_idx,
                              n_instances=n_instance_max,
                              extra_vars=extra_vars,
                              **kwargs)

    # Remove indices found with max sampling from the pool.
    query_idx = np.delete(np.arange(n_samples), pool_idx, axis=0)
    query_idx = np.append(query_idx, max_idx)
    new_pool_idx = np.delete(np.arange(n_samples), query_idx, axis=0)

    # Random sampling.
    rand_idx, _ = random_sampling(classifier, X, pool_idx=new_pool_idx,
                                  n_instances=n_instance_rand,
                                  extra_results=extra_vars,
                                  **kwargs)

    extra_vars['last_max_idx'] = max_idx
    extra_vars['last_rand_idx'] = rand_idx
    extra_vars['rand_max_frac'] = rand_max_frac
    query_idx = np.append(max_idx, rand_idx)

    return query_idx, X[query_idx]
