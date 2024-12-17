from pathlib import Path
import pytest

import numpy as np
import pandas as pd

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
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

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
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6


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
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", classifier)(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "balanced")(),
        feature_extraction=feature_model,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] <= 6

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6


def test_simulate_no_prior(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

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
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6


def test_simulate_random_prior(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

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
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6


def test_simulate_n_query(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

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
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6
