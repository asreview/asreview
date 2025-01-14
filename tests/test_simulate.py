from pathlib import Path

import numpy as np
import pandas as pd
import pytest

import asreview as asr
from asreview.extensions import load_extension
from asreview.models.query import RandomQuery
from asreview.models.query import TopDownQuery
from asreview.stopping import StoppingIsFittable

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

    # set numpy seed
    np.random.seed(42)

    if balance_strategy is not None:
        balance_model = load_extension("models.balance", balance_strategy)()
    else:
        balance_model = None

    learner = asr.ActiveLearningCycle(
        query_strategy=load_extension("models.query", "max_random")(),
        classifier=load_extension("models.classifiers", "svm")(),
        balance_strategy=balance_model,
        feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
    )

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learner,
    )
    sim.label([0, 1])
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

    # set numpy seed
    np.random.seed(42)

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=RandomQuery(random_state=42), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max_random")(),
            classifier=load_extension("models.classifiers", classifier)(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(), project.data_store["included"], learners
    )
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

    # set numpy seed
    np.random.seed(42)

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max_random")(),
            classifier=load_extension("models.classifiers", "nb")(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learners,
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

    # set numpy seed
    np.random.seed(42)

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=RandomQuery(random_state=535), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max_random")(),
            classifier=load_extension("models.classifiers", "svm")(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learners,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["label"].to_list() == [0, 1, 1, 1]


def test_simulate_n_query(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max")(),
            classifier=load_extension("models.classifiers", "svm")(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
            n_query=2,
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learners,
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

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(),
            stopping=StoppingIsFittable(),
            n_query=lambda x: 2,
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max")(),
            classifier=load_extension("models.classifiers", "svm")(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
            n_query=lambda x: 2,
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learners,
        stopping=None,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["training_set"].to_list() == [0, 0, 2, 2, 4, 4]


def test_simulate_n_query_callable_with_args(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )
    project.add_dataset(DATA_FP)

    def n_query(x):
        return len(x) // 2

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", "max")(),
            classifier=load_extension("models.classifiers", "svm")(),
            balance_strategy=load_extension("models.balance", "balanced")(),
            feature_extraction=load_extension("models.feature_extraction", "tfidf")(),
            n_query=n_query,
        ),
    ]

    sim = asr.Simulate(
        project.data_store.get_df(),
        project.data_store["included"],
        learners,
        stopping=None,
    )
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results["training_set"].to_list() == [0, 1, 2, 3, 4, 4]
