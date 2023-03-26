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

"""Balance strategies to rebalance and reorder the training data.

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very imbalanced: there are many more papers that should be excluded than
included (otherwise, automation cannot help much anyway).

There are several balance strategies available. In configuration
files, parameters are found under the section ``[balance_param]``.
"""

from . import base
from . import double
from . import simple
from . import triple
from . import undersample
from . import utils
from .utils import get_balance_model
from .utils import list_balance_strategies
from .double import DoubleBalance
from .simple import SimpleBalance
from .triple import TripleBalance
from .undersample import UndersampleBalance
from .utils import get_balance_class
from .utils import get_balance_model
from .utils import list_balance_strategies


__all__ = [
    "base",
    "double",
    "simple",
    "triple",
    "undersample",
    "utils",
    "get_balance_model",
    "list_balance_strategies",
    "DoubleBalance",
    "SimpleBalance",
    "TripleBalance",
    "UndersampleBalance",
    "get_balance_class",
    "get_balance_model",
    "list_balance_strategies"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
for _item in __all__:
    assert _item in dir(), f"__all__ includes unknown item {_item} in {__package__}"
del _item
