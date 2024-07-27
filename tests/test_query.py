import numpy as np
from pytest import mark

from asreview.extensions import extensions
from asreview.extensions import load_extension


@mark.parametrize(
    "query_strategy",
    [
        "max",
        "random",
        "max_random",
        "uncertainty",
        "max_uncertainty",
        "cluster",
    ],
)
def test_query(query_strategy):
    n_features = 50
    n_sample = 100
    classifier = load_extension("models.classifiers", "rf")()

    query_model = load_extension("models.query", query_strategy)()
    X = np.random.rand(n_sample, n_features)

    y = np.concatenate((np.zeros(n_sample // 2), np.ones(n_sample // 2)), axis=0)
    order = np.random.permutation(n_sample)
    X = X[order]
    y = y[order]

    classifier.fit(X, y)
    relevance_scores = classifier.predict_proba(X)

    assert isinstance(query_model.param, dict)
    assert query_model.name == query_strategy

    query_idx = query_model.query(feature_matrix=X, relevance_scores=relevance_scores)
    assert len(query_idx) == len(np.unique(query_idx))
    assert len(query_idx) == X.shape[0]


def test_query_general():
    assert len(extensions("models.query")) >= 4
