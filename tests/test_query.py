import numpy as np
import pytest

from asreview.extensions import extensions
from asreview.extensions import load_extension


def test_classifiers():
    assert len(extensions("models.queriers")) >= 4


@pytest.mark.parametrize("query", extensions("models.queriers"))
def test_classifier_name(query):
    model = load_extension("models.queriers", query.name)()
    assert model.name == query.name


@pytest.mark.parametrize("query", extensions("models.queriers"))
def test_classifier_param(query):
    model = load_extension("models.queriers", query.name)()
    assert isinstance(model.get_params(), dict)


@pytest.mark.parametrize("query", extensions("models.queriers"))
def test_query(query):
    n_sample, n_features = 100, 50
    X = np.random.rand(n_sample, n_features)
    y = np.random.permutation([0] * (n_sample // 2) + [1] * (n_sample // 2))

    classifier = load_extension("models.classifiers", "rf")()
    classifier.fit(X, y)
    proba = classifier.predict_proba(X)

    querier = load_extension("models.queriers", query.name)()
    query_idx = querier.query(proba[:, 1])
    assert len(query_idx) == len(np.unique(query_idx))
    assert len(query_idx) == X.shape[0]
