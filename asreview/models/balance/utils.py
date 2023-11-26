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

__all__ = ["list_balance_strategies", "get_balance_class", "get_balance_model"]

from asreview.utils import _entry_points


def list_balance_strategies():
    """List available balancing strategy classes.

    Returns
    -------
    list:
        Classes of available balance strategies in alphabetical order.
    """
    return [e.load() for e in _entry_points(group="asreview.models.balance")]


def get_balance_class(name):
    """Get class of balance model from string.

    Arguments
    ---------
    name: str
        Name of the model, e.g. 'simple', 'double' or 'undersample'.

    Returns
    -------
    BaseBalanceModel:
        Class corresponding to the name.
    """
    return _entry_points(group="asreview.models.balance")[name].load()


def get_balance_model(name, *args, random_state=None, **kwargs):
    """Get an instance of a balance model from a string.

    Arguments
    ---------
    name: str
        Name of the balance model.
    *args:
        Arguments for the balance model.
    **kwargs:
        Keyword arguments for the balance model.

    Returns
    -------
    BaseFeatureExtraction:
        Initialized instance of features extraction algorithm.
    """
    balance_class = get_balance_class(name)
    try:
        return balance_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return balance_class(*args, **kwargs)
