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

from asreview.models.deprecated import _moved_warning

from asreview.models.balance import SimpleBalance as _SimpleBalance
from asreview.models.balance import DoubleBalance as _DoubleBalance
from asreview.models.balance import TripleBalance as _TripleBalance
from asreview.models.balance import UndersampleBalance as _UndersampleBalance
from asreview.models.balance import get_balance_model as _get_balance_model
from asreview.models.balance import get_balance_class as _get_balance_class
from asreview.models.balance import list_balance_strategies as _list_balance_strategies

"""Deprecated, will be removed in version 1.0"""

SimpleBalance = _moved_warning(
    _SimpleBalance, "asreview.models.balance.SimpleBalance",
    "asreview.balance_strategies.SimpleBalance")
DoubleBalance = _moved_warning(
    _DoubleBalance, "asreview.models.balance.DoubleBalance",
    "asreview.balance_strategies.DoubleBalance")
TripleBalance = _moved_warning(
    _TripleBalance, "asreview.models.balance.TripleBalance",
    "asreview.balance_strategies.TripleBalance")
UndersampleBalance = _moved_warning(
    _UndersampleBalance, "asreview.models.balance.UndersampleBalance",
    "asreview.balance_strategies.UndersampleBalance")
get_balance_model = _moved_warning(
    _get_balance_model, "asreview.models.balance.get_balance_model",
    "asreview.balance_strategies.get_balance_model")
get_balance_class = _moved_warning(
    _get_balance_class, "asreview.models.balance.get_balance_class",
    "asreview.balance_strategies.get_balance_class")
list_balance_strategies = _moved_warning(
    _list_balance_strategies,
    "asreview.models.balance.list_balance_strategies",
    "asreview.balance_strategies.list_balance_strategies")
