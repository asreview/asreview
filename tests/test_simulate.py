import pandas as pd
import pytest

import asreview as asr
from asreview.models.query import RandomQuery
from asreview.models.query import TopDownQuery
from asreview.stopping import StoppingIsFittable


@pytest.mark.parametrize("balance_strategy", ["balanced", None])
def test_simulate_basic(demo_data, balance_strategy):
    if balance_strategy is not None:
        balance_model = asr.load_extension("models.balance", balance_strategy)()
    else:
        balance_model = None

    learner = asr.ActiveLearningCycle(
        query_strategy=asr.load_extension("models.query", "max_random")(
            random_state=535
        ),
        classifier=asr.load_extension("models.classifiers", "svm")(),
        balance_strategy=balance_model,
        feature_extraction=asr.load_extension("models.feature_extraction", "tfidf")(),
    )

    sim = asr.Simulate(demo_data, demo_data["label_included"], learner)
    sim.label([0, 9])
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] < 35


@pytest.mark.parametrize("classifier", ["nb", "logistic", "svm"])
def test_simulate_basic_classifiers(demo_data, classifier):
    learners = [
        asr.ActiveLearningCycle(
            query_strategy=RandomQuery(random_state=165), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max_random")(
                random_state=535
            ),
            classifier=asr.load_extension("models.classifiers", classifier)(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] < 35


def test_simulate_no_prior(demo_data):
    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max_random")(),
            classifier=asr.load_extension("models.classifiers", "nb")(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners)
    sim.review()

    assert sim._results["label"].to_list()[0:10] == [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]


def test_simulate_random_prior(demo_data):
    learners = [
        asr.ActiveLearningCycle(
            query_strategy=RandomQuery(random_state=535), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max_random")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners)
    sim.review()

    assert sim._results["label"].to_list()[0:9] == [0, 0, 0, 0, 0, 0, 0, 0, 1]


def test_simulate_n_query(demo_data):
    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(), stopping=StoppingIsFittable()
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
            n_query=2,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners)
    sim.review()

    assert sim._results.loc[10:, "training_set"].apply(lambda x: x % 2 == 0).all()


def test_simulate_n_query_callable(demo_data):
    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(),
            stopping=StoppingIsFittable(),
            n_query=lambda x: 2,
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
            n_query=lambda x: 2,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners, stopping=None)
    sim.review()

    assert sim._results["training_set"].apply(lambda x: x % 2 == 0).all()


def test_simulate_n_query_callable_with_args(demo_data):
    def n_query(x):
        return max(1, len(x))

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(),
            stopping=StoppingIsFittable(),
            n_query=n_query,
        ),
        asr.ActiveLearningCycle(
            query_strategy=asr.load_extension("models.query", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balance_strategy=asr.load_extension("models.balance", "balanced")(),
            feature_extraction=asr.load_extension(
                "models.feature_extraction", "tfidf"
            )(),
            n_query=n_query,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], learners, stopping=None)
    sim.review()

    # the expected training set
    a = [0]
    while len(a) < 100:
        a.extend([len(a)] * min(len(a), 100 - len(a)))

    assert sim._results["training_set"].to_list() == a
