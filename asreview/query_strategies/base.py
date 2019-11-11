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

'''
Expose selection of query methods.
'''
from asreview.query_strategies.max_sampling import max_sampling
from asreview.query_strategies.rand_max import rand_max_sampling
from asreview.query_strategies.random_sampling import random_sampling
from asreview.query_strategies.uncertainty_sampling import uncertainty_sampling
from asreview.utils import _unsafe_dict_update


def get_query_strategy(method):
    """Function to get the query method"""

    if method in ['max', 'max_sampling']:
        return max_sampling, "Maximum inclusion sampling"
    if method in ['rand_max', 'rand_max_sampling']:
        return rand_max_sampling, "Mix of random and max inclusion sampling"

    if method in ['lc', 'sm', 'uncertainty', 'uncertainty_sampling']:
        return uncertainty_sampling, 'Least confidence / Uncertainty sampling'

    if method == 'random':
        return random_sampling, 'Random sampling'

    raise ValueError(
        f"Query strategy '{method}' not found."
    )


def get_query_with_settings(settings):
    """Function to get the query method"""

    method = settings.query_strategy

    if method in ['rand_max', 'rand_max_sampling']:
        settings.query_kwargs['rand_max_frac'] = 0.05
        settings.query_kwargs = _unsafe_dict_update(
            settings.query_kwargs, settings.query_param)

    return get_query_strategy(method)
