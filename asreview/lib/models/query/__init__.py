# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

from asreview.lib.models.query.cluster import ClusterQuery
from asreview.lib.models.query.max import MaxQuery
from asreview.lib.models.query.mixed import MaxRandomQuery
from asreview.lib.models.query.mixed import MaxUncertaintyQuery
from asreview.lib.models.query.mixed import MixedQuery
from asreview.lib.models.query.random import RandomQuery
from asreview.lib.models.query.uncertainty import UncertaintyQuery
from asreview.lib.models.query.utils import get_query_class
from asreview.lib.models.query.utils import get_query_model
from asreview.lib.models.query.utils import list_query_strategies

"""Query strategies query records to label by the user.

There are several query strategies available. In configuration files,
parameters are found under the section ``[query_param]``.
"""
