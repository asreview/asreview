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


def get_query_class(method):
    """Get class of query strategy from its name.


    Arguments
    ---------
    method: str
        Name of the query strategy, e.g. 'max', 'uncertainty', 'random.
        A special mixed query strategy is als possible. The mix is denoted
        by an underscore: 'max_random' or 'max_uncertainty'.

    Returns
    -------
    BaseQueryModel:
        Class corresponding to the method name.
    """
    from asreview.query_strategies.cluster import ClusterQuery
    from asreview.query_strategies.max import MaxQuery
    from asreview.query_strategies.uncertainty import UncertaintyQuery
    from asreview.query_strategies.random import RandomQuery
    from asreview.query_strategies.mixed import MixedQuery
    query_models = {
        "cluster": ClusterQuery,
        "max": MaxQuery,
        "uncertainty": UncertaintyQuery,
        "random": RandomQuery,
    }

    # Try to split the query strategy if the string wasn't found.
    try:
        return query_models[method]
    except KeyError:
        mix = method.split("_")
        if len(mix) == 2:
            return MixedQuery
        raise ValueError(f"Error: query method '{method}' is not implemented.")


def get_query_model(method, *args, random_state=None, **kwargs):
    """Get an instance of the query strategy.

    Arguments
    ---------
    method: str
        Name of the query strategy.
    *args:
        Arguments for the model.
    **kwargs:
        Keyword arguments for the model.

    Returns
    -------
    BaseQueryModel:
        Initialized instance of query strategy.
    """
    from asreview.query_strategies.mixed import MixedQuery
    query_class = get_query_class(method)
    if query_class == MixedQuery:
        mix = method.split("_")
        for i in range(2):
            kwargs.pop("strategy_" + str(i+1), None)
        try:
            return query_class(mix[0], mix[1], *args,
                               random_state=random_state, **kwargs)
        except TypeError:
            return query_class(mix[0], mix[1], *args, **kwargs)
    try:
        return query_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return query_class(*args, **kwargs)
