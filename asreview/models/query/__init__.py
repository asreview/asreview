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

"""Query strategies query records to label by the user.

There are several query strategies available. In configuration files,
parameters are found under the section ``[query_param]``.
"""

from . import base
from .utils import get_query_model
from .utils import list_query_strategies
from . import max
from .cluster import ClusterQuery
from .max import MaxQuery
from .mixed import MaxRandomQuery
from .mixed import MaxUncertaintyQuery
from .mixed import MixedQuery
from .random import RandomQuery
from .uncertainty import UncertaintyQuery
from .utils import get_query_class
from .utils import get_query_model
from .utils import list_query_strategies


__all__ = [
    "base",
    "cluster",
    "ClusterQuery",
    "get_query_class",
    "get_query_model",
    "get_query_model",
    "list_query_strategies",
    "list_query_strategies",
    "max",
    "MaxQuery",
    "MaxRandomQuery",
    "MaxUncertaintyQuery",
    "mixed",
    "MixedQuery",
    "random",
    "RandomQuery",
    "uncertainty",
    "UncertaintyQuery",
    "utils"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
for _item in __all__:
    assert _item in dir(), f"__all__ includes unknown item {_item} in {__package__}"
del _item
