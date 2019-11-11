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

# Code based on https://modal-python.readthedocs.io/
# en/latest/content/overview/modAL-in-a-nutshell.html
# MIT license - Copyright (c) 2017 Tivadar Danka

"""Random sampling strategy."""

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
