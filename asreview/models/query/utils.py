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

from asreview.utils import list_model_names
from asreview.utils import _model_class_from_entry_point


def list_query_strategies():
    """List available query strategies.

    This excludes all possible mixed query strategies.

    Returns
    -------
    list
        Names of available query strategies in alphabetical order.
    """
    return list_model_names(entry_name="asreview.models.query")


def get_query_class(name):
    """Get class of query strategy from its name.

    Arguments
    ---------
    name: str
        Name of the query strategy, e.g. 'max', 'uncertainty', 'random.
        A special mixed query strategy is als possible. The mix is denoted
        by an underscore: 'max_random' or 'max_uncertainty'.

    Returns
    -------
    class
        Class corresponding to the name name.
    """
    from asreview.models.query.mixed import MixedQuery

    # Try to split the query strategy if the string wasn't found.
    try:
        return _model_class_from_entry_point(
            name,
            entry_name="asreview.models.query")
    except ValueError:
        mix = name.split("_")
        if len(mix) == 2:
            return MixedQuery
        raise ValueError(f"Error: query name '{name}' is not implemented.")


def get_query_model(name, *args, random_state=None, **kwargs):
    """Get an instance of the query strategy.

    Arguments
    ---------
    name: str
        Name of the query strategy.
    *args:
        Arguments for the model.
    **kwargs:
        Keyword arguments for the model.

    Returns
    -------
    asreview.query.base.BaseQueryModel
        Initialized instance of query strategy.
    """
    from asreview.models.query.mixed import MixedQuery
    query_class = get_query_class(name)
    if query_class == MixedQuery:
        mix = name.split("_")
        for i in range(2):
            kwargs.pop("strategy_" + str(i + 1), None)
        try:
            return query_class(
                mix[0], mix[1], *args, random_state=random_state, **kwargs)
        except TypeError:
            return query_class(mix[0], mix[1], *args, **kwargs)
    try:
        return query_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return query_class(*args, **kwargs)
