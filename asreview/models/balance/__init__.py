# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from asreview.models.balance.simple import SimpleBalance
from asreview.models.balance.double import DoubleBalance
from asreview.models.balance.triple import TripleBalance
from asreview.models.balance.undersample import UndersampleBalance
from asreview.models.balance.utils import get_balance_model
from asreview.models.balance.utils import get_balance_class
from asreview.models.balance.utils import list_balance_strategies

"""Balance strategies to rebalance and reorder the training data.

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very imbalanced: there are many more papers that should be excluded than
included (otherwise, automation cannot help much anyway).

There are several balance strategies available. In configuration
files, parameters are found under the section ``[balance_param]``.
"""
