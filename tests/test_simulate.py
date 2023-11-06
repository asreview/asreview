import json
from pathlib import Path

import pytest

from asreview.entry_points.simulate import SimulateEntryPoint
from asreview.entry_points.simulate import _simulate_parser
from asreview.project import ASReviewProject
from asreview.project import ProjectExistsError
from asreview.project import open_state

ADVANCED_DEPS = {"tensorflow": False}

try:
    import tensorflow  # noqa

    ADVANCED_DEPS["tensorflow"] = True
except ImportError:
    pass


DATA_FP = Path("tests", "demo_data", "generic_labels.csv")
DATA_FP_URL = "https://raw.githubusercontent.com/asreview/asreview/master/tests/demo_data/generic_labels.csv"  # noqa
DATA_FP_NO_ABS = Path("tests", "demo_data", "generic_labels_no_abs.csv")
DATA_FP_NO_TITLE = Path("tests", "demo_data", "generic_labels_no_title.csv")
EMBEDDING_FP = Path("tests", "demo_data", "generic.vec")
CFG_DIR = Path("tests", "cfg_files")
STATE_DIR = Path("tests", "state_files")
H5_STATE_FILE = Path(STATE_DIR, "test.h5")
JSON_STATE_FILE = Path(STATE_DIR, "test.json")


@pytest.mark.xfail(
    raises=FileNotFoundError,
    reason="File, URL, or dataset does not exist: " "'this_doesnt_exist.csv'",
)
def test_dataset_not_found(tmpdir):
    entry_point = SimulateEntryPoint()
    asreview_fp = Path(tmpdir, "project.asreview")
    argv = f"does_not.exist -s {asreview_fp}".split()
    entry_point.execute(argv)


def test_simulate_review_finished(tmpdir):
    # file path
    asreview_fp = Path(tmpdir, "test.asreview")

    # simulate entry point
    entry_point = SimulateEntryPoint()
    entry_point.execute(f"{DATA_FP} -s {asreview_fp}".split())

    Path(tmpdir, "test").mkdir(parents=True)
    project = ASReviewProject.load(asreview_fp, Path(tmpdir, "test"))

    assert project.config["reviews"][0]["status"] == "finished"


def test_prior_idx(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -s {asreview_fp} --prior_idx 1 4".split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as state:
        labeling_order = state.get_order_of_labeling()
        query_strategies = state.get_query_strategies()

    assert labeling_order[0] == 1
    assert labeling_order[1] == 4
    assert all(query_strategies[:1] == "prior")
    assert all(query_strategies[2:] != "prior")


def test_n_prior_included(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -s {asreview_fp} --n_prior_included 2".split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as state:
        result = state.get_dataset(["label", "query_strategy"])

    prior_included = result["label"] & (result["query_strategy"] == "prior")
    assert sum(prior_included) == 2

    Path(tmpdir, "test").mkdir(parents=True)
    project = ASReviewProject.load(asreview_fp, Path(tmpdir, "test"))

    settings_path = Path(
        project.project_path,
        "reviews",
        project.config["reviews"][0]["id"],
        "settings_metadata.json",
    )
    with open(settings_path, "r") as f:
        settings_metadata = json.load(f)

    assert settings_metadata["settings"]["n_prior_included"] == 2


def test_n_prior_excluded(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -s {asreview_fp} --n_prior_excluded 2".split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as state:
        result = state.get_dataset(["label", "query_strategy"])

    prior_excluded = ~result["label"] & (result["query_strategy"] == "prior")
    assert sum(prior_excluded) == 2

    Path(tmpdir, "test").mkdir(parents=True)
    project = ASReviewProject.load(asreview_fp, Path(tmpdir, "test"))

    settings_path = Path(
        project.project_path,
        "reviews",
        project.config["reviews"][0]["id"],
        "settings_metadata.json",
    )
    with open(settings_path, "r") as f:
        settings_metadata = json.load(f)

    assert settings_metadata["settings"]["n_prior_excluded"] == 2


# TODO: Add random seed to settings.
# def test_seed(tmpdir):
#     asreview_fp = Path(tmpdir, 'test.asreview')
#     argv = f'{str(DATA_FP)} -s {asreview_fp} --seed 42'.split()
#     entry_point = SimulateEntryPoint()
#     entry_point.execute(argv)
#
#     with open(get_settings_metadata_path(asreview_fp), 'r') as f:
#         settings_metadata = json.load(f)
#
#     assert settings_metadata['random_seed'] == 42


def test_non_tf_models(tmpdir):
    models = ["logistic", "nb", "rf", "svm"]
    for model in models:
        print(model)
        asreview_fp = Path(tmpdir, f"test_{model}.asreview")
        argv = f"{str(DATA_FP)} -s {asreview_fp} -m {model}".split()
        entry_point = SimulateEntryPoint()
        entry_point.execute(argv)

        with open_state(asreview_fp) as state:
            classifiers = state.get_classifiers()
        default_n_priors = 2
        assert all(classifiers[default_n_priors:] == model)

        Path(tmpdir, f"test_{model}").mkdir(parents=True)
        project = ASReviewProject.load(asreview_fp, Path(tmpdir, f"test_{model}"))

        settings_path = Path(
            project.project_path,
            "reviews",
            project.config["reviews"][0]["id"],
            "settings_metadata.json",
        )
        with open(settings_path, "r") as f:
            settings_metadata = json.load(f)

        assert settings_metadata["settings"]["model"] == model


def test_last_probabilities(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -s {asreview_fp}".split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as state:
        last_probabilities = state.get_last_probabilities()
    assert not last_probabilities.empty


def test_number_records_found(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    stop_if = 100
    priors = [116, 285]
    seed = 101

    argv = (
        f"{dataset} -s {asreview_fp} --stop_if {stop_if} "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as s:
        assert s.get_labels().sum() == 29


def test_stop_if_min(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    stop_if = "min"
    priors = [116, 285]
    seed = 101

    argv = (
        f"{dataset} -s {asreview_fp} --stop_if {stop_if} "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as s:
        assert s.get_labels().sum() == 38
        assert len(s.get_labels()) == 630


def test_stop_if_all(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    stop_if = -1
    priors = [116, 285]
    seed = 101

    argv = (
        f"{dataset} -s {asreview_fp} --stop_if {stop_if} "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as s:
        assert s.get_labels().sum() == 38
        assert len(s.get_labels()) == 4544


def test_write_interval(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    stop_if = 100
    priors = [116, 285]
    seed = 101
    write_interval = 20

    argv = (
        f"{dataset} -s {asreview_fp} --stop_if {stop_if} "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed} "
        f"--write_interval {write_interval}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp) as s:
        assert s.get_labels().sum() == 29


@pytest.mark.xfail(raises=ProjectExistsError, reason="Cannot continue simulation.")
def test_project_already_exists_error(tmpdir):
    asreview_fp1 = Path(tmpdir, "test1.asreview")

    argv = (
        f"synergy:van_de_Schoot_2018 -s {asreview_fp1} --stop_if 100"
        f" --seed 535".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    # Simulate 100 queries in two steps of 50.
    argv = (
        f"synergy:van_de_Schoot_2018 -s {asreview_fp1} --stop_if 50"
        f" --seed 535".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)


@pytest.mark.skip(reason="Partial simulations are not available.")
def test_partial_simulation(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp1 = Path(tmpdir, "test1.asreview")
    asreview_fp2 = Path(tmpdir, "test2.asreview")

    priors = [284, 285]
    seed = 101

    # Simulate 100 queries in one go.
    argv = (
        f"{dataset} -s {asreview_fp1} --stop_if 100 "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    # Simulate 100 queries in two steps of 50.
    argv = (
        f"{dataset} -s {asreview_fp2} --stop_if 50 "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    argv = (
        f"{dataset} -s {asreview_fp2} --stop_if 100 "
        f"--prior_idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(asreview_fp1) as state:
        dataset1 = state.get_dataset()

    with open_state(asreview_fp2) as state:
        dataset2 = state.get_dataset()

    assert dataset1.shape == dataset2.shape
    # All query strategies should match.
    assert dataset1["query_strategy"].to_list() == dataset2["query_strategy"].to_list()
    # The first 50 record ids and labels should match.
    assert (
        dataset1["record_id"].iloc[:50].to_list()
        == dataset2["record_id"].iloc[:50].to_list()
    )
    assert (
        dataset1["label"].iloc[:50].to_list() == dataset2["label"].iloc[:50].to_list()
    )

    # You expect many of the same records in the second 50 records.
    # With this initial seed there are 89 in the total.
    assert (
        len(dataset1["record_id"][dataset1["record_id"].isin(dataset2["record_id"])])
        == 89
    )


@pytest.mark.skip(reason="Partial simulations are not available.")
def test_is_partial_simulation(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")

    argv = f"{dataset} -s {asreview_fp} --stop_if 50".split()
    parser = _simulate_parser()
    args = parser.parse_args(argv)

    assert not _is_partial_simulation(args)  # noqa

    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    assert _is_partial_simulation(args)  # noqa
