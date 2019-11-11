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

from asreview.balance_strategies.full_sampling import FullSampleTD
from asreview.balance_strategies.triple_balance import TripleBalanceTD
from asreview.balance_strategies.undersampling import UndersampleTD


def get_balance_strategy(method, balance_param={},
                         query_kwargs={"query_src": {}}):
    if method == "simple":
        td_obj = FullSampleTD(balance_param)
    elif method == "triple_balance":
        td_obj = TripleBalanceTD(balance_param, query_kwargs)
    elif method in ["undersample", "undersampling"]:
        td_obj = UndersampleTD(balance_param)
    else:
        raise ValueError(f"Training data method {method} not found")
    return td_obj.func_kwargs_descr()


def get_balance_with_settings(settings):
    """ Function to get data rebalancing method. """

    method = getattr(settings, "balance_strategy", "simple")
    settings.balance_strategy = method

    func, settings.balance_kwargs, td_string = get_balance_strategy(
        method, settings.balance_param, settings.query_kwargs)
    return func, td_string


def get_balance_class(method):
    if method in ["simple", "full"]:
        return FullSampleTD
    if method in ["triple", "triple_balance"]:
        return TripleBalanceTD
    if method in ["undersample", "undersampling"]:
        return UndersampleTD
