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

from asreview.query_strategies.utils import get_query_strategy
from asreview.query_strategies.max_sampling import max_sampling
from asreview.query_strategies.rand_max import rand_max_sampling
from asreview.query_strategies.random_sampling import random_sampling
from asreview.query_strategies.uncertainty_sampling \
    import uncertainty_sampling
