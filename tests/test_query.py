import numpy as np
from pytest import mark

from asreview.extensions import extensions
from asreview.extensions import load_extension
from asreview.learner import ActiveLearner


@mark.parametrize(
    "query_strategy_name",
    [
        "max",
        "random",
        "max_random",
        "uncertainty",
        "max_uncertainty",
        "cluster",
    ],
)
def test_query(query_strategy_name):
    n_sample, n_features = 100, 50
    X = np.random.rand(n_sample, n_features)
    y = np.random.permutation([0] * (n_sample // 2) + [1] * (n_sample // 2))

    classifier = load_extension("models.classifiers", "rf")()
    query_strategy = load_extension("models.query", query_strategy_name)()

    classifier.fit(X, y)
    learner = ActiveLearner(query_strategy, classifier)

    assert isinstance(query_strategy.param, dict)
    assert query_strategy.name == query_strategy_name

    query_idx = query_strategy.query(learner=learner, X=X)
    assert len(query_idx) == len(np.unique(query_idx))
    assert len(query_idx) == X.shape[0]


def test_query_general():
    assert len(extensions("models.query")) >= 4
