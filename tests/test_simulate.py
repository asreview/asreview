from pathlib import Path

import numpy as np
import pandas as pd
import pytest

import asreview as asr
from asreview.extensions import load_extension

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")


@pytest.mark.parametrize("balance_strategy", ["balanced", None])
def test_simulate_basic(tmpdir, balance_strategy):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    # set numpy seed
    np.random.seed(42)

    if balance_strategy is not None:
        balance_model = load_extension("models.balance", balance_strategy)()
    else:
        balance_model = None

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=balance_model,
        feature_extraction=feature_model,
    )
    sim.label([0, 1], prior=True)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["label"].to_list() == [1, 0, 1, 1]


@pytest.mark.parametrize("classifier", ["nb", "logistic", "svm"])
def test_simulate_basic_classifiers(tmpdir, classifier):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    # set numpy seed
    np.random.seed(42)

    learner = asr.ActiveLearner(
        query_strategy=load_extension("models.query", "max_random")(),
        classifier=load_extension("models.classifiers", classifier)(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
    )

    sim = asr.Simulate(fm, project.data_store["included"], learner)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] <= 6


def test_simulate_no_prior(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["label"].to_list() == [1, 0, 1, 1]


def test_simulate_random_prior(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
    )
    sim.label_random(1, 1, prior=True, random_state=42)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["label"].to_list() == [1, 0, 1, 1]


def test_simulate_n_query(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
        n_query=2,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["label"].to_list() == [1, 0, 1, 1]


def test_simulate_n_query_callable(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
        n_query=lambda x: 2,
        n_stop=None,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["training_set"].to_list() == [None, None, 2, 2, 4, 4]


def test_simulate_n_query_callable_with_args(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(project.data_store.get_texts())
    project.add_feature_matrix(fm, feature_model.name)

    def n_query(x):
        return len(x) // 2

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
        n_query=n_query,
        n_stop=None,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["training_set"].to_list() == [None, None, 2, 3, 4, 4]
