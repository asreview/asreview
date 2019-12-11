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

from asreview.query_strategies.cluster_sampling import QueryCluster
from asreview.query_strategies.max_sampling import QueryMax
from asreview.query_strategies.rand_max import QueryRandMax
from asreview.query_strategies.uncertainty_sampling import QueryUncertainty
from asreview.query_strategies.random_sampling import QueryRandom


def get_query_class(method):
    if method in ['cluster', 'clusters', 'cluster_sampling']:
        return QueryCluster

    if method in ['max', 'max_sampling']:
        return QueryMax

    if method in ['rand_max', 'rand_max_sampling']:
        return QueryRandMax

    if method in ['lc', 'sm', 'uncertainty', 'uncertainty_sampling']:
        return QueryUncertainty

    if method == 'random':
        return QueryRandom

    raise ValueError(f"Query strategy '{method}' not found.")


def get_query_strategy(method, *args, **kwargs):
    """Function to get the query method"""
    return get_query_class(method)(*args, **kwargs)


def get_query_with_settings(settings, *args, **kwargs):
    """Function to get the query method"""

    query_func, settings.query_kwargs, description = get_query_strategy(
        settings.query_strategy, settings.query_param, *args, **kwargs
    ).func_kwargs_descr()

    return query_func, description
