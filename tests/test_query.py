import numpy as np
from pytest import mark

from asreview.models.classifiers import get_classifier
from asreview.models.query import get_query_model
from asreview.models.query import list_query_strategies


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
@mark.parametrize("n_instances", [0, 1, 5, 50])
@mark.parametrize("n_train", [0, 1, 5, 50])
def test_query(query_strategy, n_instances, n_train):
    n_features = 50
    n_sample = 100
    classifier = get_classifier("rf")

    query_model = get_query_model(query_strategy)
    X = np.random.rand(n_sample, n_features)

    y = np.concatenate((np.zeros(n_sample // 2), np.ones(n_sample // 2)), axis=0)
    order = np.random.permutation(n_sample)
    X = X[order]
    y = y[order]

    classifier.fit(X, y)

    assert isinstance(query_model.param, dict)
    assert query_model.name == query_strategy

    query_idx = query_model.query(X, classifier, n_instances=n_instances)
    assert len(query_idx) == n_instances
    assert len(query_idx) == len(np.unique(query_idx))

    query_idx, relevance_scores = query_model.query(X, classifier,
                                                    return_classifier_scores=True)
    assert len(query_idx) == X.shape[0]
    if relevance_scores is not None:
        assert relevance_scores.shape == (X.shape[0], 2)


def test_query_general():
    assert len(list_query_strategies()) >= 4
