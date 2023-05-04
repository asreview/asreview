import pytest

from asreview.models.balance.utils import get_balance_class
from asreview.models.classifiers.utils import get_classifier_class
from asreview.models.feature_extraction.utils import get_feature_class
from asreview.models.query.utils import get_query_class


@pytest.mark.parametrize(
    "name,init_settings",
    [
        ("double", {"a": 2, "alpha": 1, "b": 1, "beta": 1, "random_seed": 42}),
        ("simple", {}),
        # ("triple", {'a': 2, "alpha": 1, "b": 1, "beta": 1, "c": 1, "gamma": 2,
        #             "shuffle": False, "random_seed": 42}),
        ("undersample", {"ratio": 5, "random_seed": 42}),
    ],
)
def test_balance_settings(name, init_settings):
    model = get_balance_class(name)(**init_settings)
    assert model.settings["name"] == name
    for key, value in init_settings.items():
        assert model.settings[key] == value


@pytest.mark.parametrize(
    "name,init_settings",
    [
        ("logistic", {"C": 2, "class_weight": 2, "random_seed": 42, "n_jobs": 1}),
        (
            "lstm-base",
            {
                "embedding_matrix": None,
                "backwards": False,
                "dropout": 0.7,
                "optimizer": "rmsprop",
                "lstm_out_width": 10,
                "learn_rate": 0.8,
                "dense_width": 64,
                "verbose": 1,
                "batch_size": 16,
                "epochs": 2,
                "shuffle": False,
                "class_weight": 15,
            },
        ),
        (
            "lstm-pool",
            {
                "embedding_matrix": None,
                "backwards": False,
                "dropout": 0.7,
                "optimizer": "rmsprop",
                "lstm_out_width": 10,
                "lstm_pool_size": 64,
                "learn_rate": 0.8,
                "verbose": 1,
                "batch_size": 16,
                "epochs": 2,
                "shuffle": False,
                "class_weight": 15,
            },
        ),
        ("nb", {"alpha": 3}),
        (
            "nn-2-layer",
            {
                "dense_width": 64,
                "optimizer": "rmsprop",
                "learn_rate": 0.8,
                "regularization": 0.05,
                "verbose": 2,
                "epochs": 3,
                "batch_size": 16,
                "shuffle": True,
                "class_weight": 15,
            },
        ),
        (
            "rf",
            {
                "n_estimators": 50,
                "max_features": 5,
                "class_weight": 15,
                "random_seed": 42,
            },
        ),
        (
            "svm",
            {
                "gamma": "auto",
                "class_weight": 0.2,
                "C": 10,
                "kernel": "linear",
                "random_seed": 42,
            },
        ),
    ],
)
def test_classifier_settings(name, init_settings):
    model = get_classifier_class(name)(**init_settings)
    assert model.settings["name"] == name
    for key, value in init_settings.items():
        assert model.settings[key] == value


@pytest.mark.parametrize(
    "name,init_settings",
    [
        (
            "doc2vec",
            {
                "args": (),
                "vector_size": 30,
                "epochs": 3,
                "min_count": 2,
                "n_jobs": 1,
                "window": 6,
                "dm_concat": 0,
                "dm": 3,
                "dbow_words": 0,
                "kwargs": {},
            },
        ),
        (
            "embedding-idf",
            {"args": (), "embedding_fp": None, "random_seed": 42, "kwargs": {}},
        ),
        (
            "embedding-lstm",
            {
                "args": (),
                "loop_sequence": 2,
                "num_words": 1000,
                "max_sequence_length": 10,
                "padding": "post",
                "truncating": "post",
                "n_jobs": 1,
                "kwargs": {},
            },
        ),
        ("sbert", {"args": (), "transformer_model": "fake-model-name", "kwargs": {}}),
        ("tfidf", {"args": (), "ngram_max": 2, "stop_words": "english", "kwargs": {}}),
    ],
)
def test_feature_settings(name, init_settings):
    args = init_settings["args"]
    kwargs = init_settings["kwargs"]
    rest = {
        key: val for key, val in init_settings.items() if key not in ["args", "kwargs"]
    }
    model = get_feature_class(name)(*args, **{**rest, **kwargs})
    assert model.settings["name"] == name
    for key, value in init_settings.items():
        assert model.settings[key] == value


@pytest.mark.parametrize(
    "name,init_settings",
    [
        ("cluster", {"cluster_size": 100, "update_interval": 100, "random_seed": 42}),
        ("max", {}),
        ("max_random", {"mix_ratio": 0.5, "random_seed": 42, "kwargs": {}}),
        ("random", {"random_seed": 42}),
        ("uncertainty", {}),
    ],
)
def test_query_settings(name, init_settings):
    if "kwargs" in init_settings:
        kwargs = init_settings["kwargs"]
        rest = {
            key: val
            for key, val in init_settings.items()
            if key not in ["args", "kwargs"]
        }
        model = get_query_class(name)(**{**rest, **kwargs})
    else:
        model = get_query_class(name)(**init_settings)
    assert model.settings["name"] == name
    for key, value in init_settings.items():
        assert model.settings[key] == value
