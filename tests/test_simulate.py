import shutil
from pathlib import Path

import numpy as np
import pandas as pd

import asreview as asr
from asreview.extensions import load_extension

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")


def test_simulate_basic(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )

    data_path = Path(project.project_path, "data") / "generic_labels.csv"
    shutil.copy(DATA_FP, data_path)
    project.add_dataset(data_path.name)

    as_data = project.read_data()

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(
        as_data.texts, as_data["title"], as_data["abstract"], as_data["keywords"]
    )
    project.add_feature_matrix(fm, feature_model)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=as_data["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "double")(),
        feature_extraction=feature_model,
    )
    sim.label([0, 1], prior=True)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6


def test_simulate_no_prior(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )

    data_path = Path(project.project_path, "data") / "generic_labels.csv"
    shutil.copy(DATA_FP, data_path)
    project.add_dataset(data_path.name)

    as_data = project.read_data()

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(
        as_data.texts, as_data["title"], as_data["abstract"], as_data["keywords"]
    )
    project.add_feature_matrix(fm, feature_model)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=as_data["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "double")(),
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

    data_path = Path(project.project_path, "data") / "generic_labels.csv"
    shutil.copy(DATA_FP, data_path)
    project.add_dataset(data_path.name)

    as_data = project.read_data()

    feature_model = load_extension("models.feature_extraction", "tfidf")()
    fm = feature_model.fit_transform(
        as_data.texts, as_data["title"], as_data["abstract"], as_data["keywords"]
    )
    project.add_feature_matrix(fm, feature_model)

    # set numpy seed
    np.random.seed(42)

    sim = asr.Simulate(
        fm,
        labels=as_data["included"],
        classifier=load_extension("models.classifiers", "svm")(),
        query_strategy=load_extension("models.query", "max_random")(),
        balance_strategy=load_extension("models.balance", "double")(),
        feature_extraction=feature_model,
    )
    sim.label_random(1, 1, prior=True, random_state=42)
    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6
