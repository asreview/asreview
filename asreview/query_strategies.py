from asreview.models.deprecated import _moved_warning

from asreview.models.query.max import MaxQuery as _MaxQuery
from asreview.models.query.mixed import MixedQuery as _MixedQuery
from asreview.models.query.uncertainty import UncertaintyQuery as _UncertaintyQuery
from asreview.models.query.random import RandomQuery as _RandomQuery
from asreview.models.query.cluster import ClusterQuery as _ClusterQuery
from asreview.models.query.utils import get_query_model as _get_query_model
from asreview.models.query.utils import get_query_class as _get_query_class
from asreview.models.query.utils import list_query_strategies as _list_query_strategies

"""Deprecated, will be removed in version 1.0"""

MaxQuery = _moved_warning(
    _MaxQuery, "asreview.models.query.MaxQuery",
    "asreview.query_strategies.MaxQuery")
MixedQuery = _moved_warning(
    _MixedQuery, "asreview.models.query.MixedQuery",
    "asreview.query_strategies.MixedQuery")
UncertaintyQuery = _moved_warning(
    _UncertaintyQuery, "asreview.models.query.UncertaintyQuery",
    "asreview.query_strategies.UncertaintyQuery")
RandomQuery = _moved_warning(
    _RandomQuery, "asreview.models.query.RandomQuery",
    "asreview.query_strategies.RandomQuery")
ClusterQuery = _moved_warning(
    _ClusterQuery, "asreview.models.query.ClusterQuery",
    "asreview.query_strategies.ClusterQuery")
get_query_model = _moved_warning(
    _get_query_model, "asreview.models.query.get_query_model",
    "asreview.query_strategies.get_query_model")
get_query_class = _moved_warning(
    _get_query_class, "asreview.models.query.get_query_class",
    "asreview.query_strategies.get_query_class")
list_query_strategies = _moved_warning(
    _list_query_strategies, "asreview.models.query.list_query_strategies",
    "asreview.query_strategies.list_query_strategies")
