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

from asreview.balance_strategies.simple import SimpleBalance
from asreview.balance_strategies.triple import TripleBalance
from asreview.balance_strategies.undersample import UndersampleBalance
from asreview.balance_strategies.double import DoubleBalance


def get_balance_class(method):
    """Get class of balance model from string.

    Arguments
    ---------
    method: str
        Name of the model, e.g. 'simple', 'double' or 'undersample'.

    Returns
    -------
    BaseBalanceModel:
        Class corresponding to the method.
    """
    balance_models = {
        "simple": SimpleBalance,
        "double": DoubleBalance,
        "triple": TripleBalance,
        "undersample": UndersampleBalance,
    }
    try:
        return balance_models[method]
    except KeyError:
        raise ValueError(
            f"Error: balance method '{method}' is not implemented.")


def get_balance_model(method, *args, random_state=None, **kwargs):
    """Get an instance of a balance model from a string.

    Arguments
    ---------
    method: str
        Name of the balance model.
    *args:
        Arguments for the balance model.
    **kwargs:
        Keyword arguments for the balance model.
    """
    balance_class = get_balance_class(method)
    try:
        return balance_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return balance_class(*args, **kwargs)
