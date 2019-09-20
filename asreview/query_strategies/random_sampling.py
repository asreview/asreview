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

    if len(query_idx) > 0:
        query_kwargs['last_query_type'].append(("random", len(query_idx)))
        query_kwargs['last_query_idx'].extend(pool_idx[query_idx].tolist())

    return pool_idx[query_idx], X[pool_idx[query_idx]]
