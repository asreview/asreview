#!/usr/bin/env python
# encoding: utf-8

"""Initial sample.

This module is used to draw an initial sample. This sample is the
so-called 'pre-knowledge' of the researcher.

"""

import numpy as np


def sample_prior_knowledge(
        labels, n_prior_included=10,
        n_prior_excluded=10, random_state=None):
    """Function to sample prelabelled articles.

    Arguments
    ---------
    labels: np.ndarray
        Labels in a 2d numpy array (the result of
        keras.utils.to_categorical).
    n_included: int
        The number of positive labels.
    n_excluded: int
        The number of negative labels.
    random_state : int, RandomState instance or None, optional (default=None)
        If int, random_state is the seed used by the random number generator;
        If RandomState instance, random_state is the random number generator;
        If None, the random number generator is the RandomState instance used
        by `np.random`.

    Returns
    -------
    np.ndarray:
        An array with n_included and n_excluded indices.

    """

    # set random state
    r = np.random.RandomState(random_state)

    # retrieve the index of included and excluded papers
    included_indexes = np.where(labels == 1)[0]
    excluded_indexes = np.where(labels == 0)[0]

#     print(n_prior_included)
#     print(included_indexes)
#     print(f"labels = {labels}")
    if len(included_indexes) < n_prior_included[0]:
        print(f"Found only {len(included_indexes)}, "
              f"when I need {n_prior_included[0]}.")
    # select randomly from included and excluded papers
    included_indexes_sample = r.choice(
        included_indexes, n_prior_included, replace=False)
    excluded_indexes_sample = r.choice(
        excluded_indexes, n_prior_excluded, replace=False)

    init = np.append(included_indexes_sample, excluded_indexes_sample)

    return init
