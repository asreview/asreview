import pandas as pd
import pytest

import asreview as asr
from asreview.models.queriers import Random
from asreview.models.queriers import TopDown
from asreview.models.stoppers import IsFittable
from asreview.simulation.cli import _cli_simulate
from asreview.state.contextmanager import open_state


@pytest.mark.parametrize("balancer", ["balanced", None])
def test_simulate_basic(demo_data, balancer):
    if balancer is not None:
        balance_model = asr.load_extension("models.balancers", balancer)()
    else:
        balance_model = None

    cycle = asr.ActiveLearningCycle(
        querier=asr.load_extension("models.queriers", "max_random")(random_state=535),
        classifier=asr.load_extension("models.classifiers", "svm")(),
        balancer=balance_model,
        feature_extractor=asr.load_extension("models.feature_extractors", "tfidf")(),
    )

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycle)
    sim.label([0, 9])
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] < 60


@pytest.mark.parametrize("classifier", ["nb", "logistic", "svm"])
def test_simulate_basic_classifiers(demo_data, classifier):
    cycles = [
        asr.ActiveLearningCycle(querier=Random(random_state=165), stopper=IsFittable()),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max_random")(
                random_state=535
            ),
            classifier=asr.load_extension("models.classifiers", classifier)(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] < 60


def test_simulate_no_prior(demo_data):
    cycles = [
        asr.ActiveLearningCycle(querier=TopDown(), stopper=IsFittable()),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max_random")(),
            classifier=asr.load_extension("models.classifiers", "nb")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles)
    sim.review()

    assert sim._results["label"].to_list()[0:10] == [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]


def test_simulate_random_prior(demo_data):
    cycles = [
        asr.ActiveLearningCycle(querier=Random(random_state=535), stopper=IsFittable()),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max_random")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles)
    sim.review()

    assert sim._results["label"].to_list()[0:9] == [0, 0, 0, 0, 0, 0, 0, 0, 1]


def test_simulate_n_query(demo_data):
    cycles = [
        asr.ActiveLearningCycle(querier=TopDown(), stopper=IsFittable()),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
            n_query=2,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles)
    sim.review()

    assert sim._results.loc[10:, "training_set"].apply(lambda x: x % 2 == 0).all()


def test_simulate_n_query_callable(demo_data):
    cycles = [
        asr.ActiveLearningCycle(
            querier=TopDown(),
            stopper=IsFittable(),
            n_query=lambda x: 2,
        ),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
            n_query=lambda x: 2,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles, stopper=None)
    sim.review()

    assert sim._results["training_set"].apply(lambda x: x % 2 == 0).all()


def test_simulate_n_query_callable_with_args(demo_data):
    def n_query(x):
        return max(1, len(x))

    cycles = [
        asr.ActiveLearningCycle(
            querier=TopDown(),
            stopper=IsFittable(),
            n_query=n_query,
        ),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
            n_query=n_query,
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"], cycles, stopper=-1)
    sim.review()

    # the expected training set
    a = [0]
    while len(a) < 100:
        a.extend([len(a)] * min(len(a), 100 - len(a)))

    assert sim._results["training_set"].to_list() == a


def test_simulate_labels_input(demo_data):
    cycles = [
        asr.ActiveLearningCycle(querier=Random(random_state=535), stopper=IsFittable()),
        asr.ActiveLearningCycle(
            querier=asr.load_extension("models.queriers", "max_random")(),
            classifier=asr.load_extension("models.classifiers", "svm")(),
            balancer=asr.load_extension("models.balancers", "balanced")(),
            feature_extractor=asr.load_extension(
                "models.feature_extractors", "tfidf"
            )(),
        ),
    ]

    sim = asr.Simulate(demo_data, demo_data["label_included"].to_list(), cycles)
    sim.review()

    assert sim._results["label"].to_list()[0:9] == [0, 0, 0, 0, 0, 0, 0, 0, 1]


def test_simulate_labels_input_prior(demo_data):
    cycle = asr.ActiveLearningCycle(
        querier=asr.load_extension("models.queriers", "max_random")(random_state=535),
        classifier=asr.load_extension("models.classifiers", "svm")(),
        balancer=None,
        feature_extractor=asr.load_extension("models.feature_extractors", "tfidf")(),
    )

    sim = asr.Simulate(demo_data, demo_data["label_included"].to_list(), cycle)
    sim.label([0, 9])
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] < 60


def test_simulate_cli_vs_api(demo_data, demo_data_path, tmp_project):
    querier, classifier, balancer, feature_extractor = (
        "max",
        "svm",
        "balanced",
        "tfidf",
    )
    cycle = asr.ActiveLearningCycle(
        querier=asr.load_extension("models.queriers", querier)(),
        classifier=asr.load_extension("models.classifiers", classifier)(),
        balancer=asr.load_extension("models.balancers", balancer)(),
        feature_extractor=asr.load_extension(
            "models.feature_extractors", feature_extractor
        )(),
    )
    sim = asr.Simulate(demo_data, demo_data["label_included"], cycle)
    sim.label([0, 9])
    sim.review()
    used_columns = [
        "record_id",
        "label",
        "classifier",
        "querier",
        "balancer",
        "feature_extractor",
    ]
    api_dataframe = sim._results[used_columns]

    argv = (
        f"{demo_data_path} -o {tmp_project} -c {classifier} -q {querier} -b {balancer}"
        f" -e {feature_extractor} --prior-idx 0 9 --seed 535"
    ).split()
    _cli_simulate(argv)
    with open_state(tmp_project) as state:
        cli_dataframe = state.get_results_table(columns=used_columns)

    for col in ["record_id", "label"]:
        assert (api_dataframe[col] == cli_dataframe[col]).all()
