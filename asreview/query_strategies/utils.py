from asreview.query_strategies.cluster_sampling import QueryCluster
from asreview.query_strategies.max_sampling import QueryMax
from asreview.query_strategies.rand_max import QueryRandMax
from asreview.query_strategies.uncertainty_sampling import QueryUncertainty
from asreview.query_strategies.random_sampling import QueryRandom


def get_query_class(method):
    if method in ['cluster', 'clusters', 'cluster_sampling']:
        return QueryCluster

    if method in ['max', 'max_sampling']:
        return QueryMax

    if method in ['rand_max', 'rand_max_sampling']:
        return QueryRandMax

    if method in ['lc', 'sm', 'uncertainty', 'uncertainty_sampling']:
        return QueryUncertainty

    if method == 'random':
        return QueryRandom

    raise ValueError(f"Query strategy '{method}' not found.")


def get_query_strategy(method, *args, **kwargs):
    """Function to get the query method"""
    return get_query_class(method)(*args, **kwargs)


def get_query_with_settings(settings, *args, **kwargs):
    """Function to get the query method"""

    query_func, settings.query_kwargs, description = get_query_strategy(
        settings.query_strategy, settings.query_param, *args, **kwargs
    ).func_kwargs_descr()

    return query_func, description
