#!/usr/bin/env python
# encoding: utf-8
"""Random sampling strategy."""
# Code based on https://modal-python.readthedocs.io/
# en/latest/content/overview/modAL-in-a-nutshell.html
# MIT license - Copyright (c) 2017 Tivadar Danka
import numpy as np


def random_sampling(classifier, X, pool_idx, n_instances=1, query_kwargs={},
                    **kwargs):
    n_samples = len(pool_idx)
    query_idx = np.random.choice(
        np.arange(n_samples),
        n_instances,
        replace=False
    )

    for idx in query_idx:
        query_kwargs['current_queries'][pool_idx[idx]] = "random"

    return pool_idx[query_idx], X[pool_idx[query_idx]]
