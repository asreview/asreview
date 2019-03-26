#!/usr/bin/env python
# encoding: utf-8

"""Random sampling strategy."""

# Code based on https://modal-python.readthedocs.io/
# en/latest/content/overview/modAL-in-a-nutshell.html
# MIT license - Copyright (c) 2017 Tivadar Danka


import numpy as np


def random_sampling(classifier, X_pool, n_instances=1, **kwargs):
    n_samples = len(X_pool)
    query_idx = np.random.choice(
        np.arange(n_samples),
        n_instances,
        replace=False
    )
    return query_idx, X_pool[query_idx]
