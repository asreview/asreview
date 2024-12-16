import json
from pathlib import Path

import pytest

import asreview as asr
from asreview.simulation.cli import _cli_simulate

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")
DATA_FP_URL = "https://raw.githubusercontent.com/asreview/asreview/master/tests/demo_data/generic_labels.csv"  # noqa
DATA_FP_NO_ABS = Path("tests", "demo_data", "generic_labels_no_abs.csv")
DATA_FP_NO_TITLE = Path("tests", "demo_data", "generic_labels_no_title.csv")
CFG_DIR = Path("tests", "cfg_files")
STATE_DIR = Path("tests", "state_files")
H5_STATE_FILE = Path(STATE_DIR, "test.h5")
JSON_STATE_FILE = Path(STATE_DIR, "test.json")


def test_dataset_not_found(tmpdir):
    asreview_fp = Path(tmpdir, "project.asreview")
    argv = f"does_not.exist -o {asreview_fp}".split()
    with pytest.raises(ValueError):
        _cli_simulate(argv)


def test_no_output():
    _cli_simulate([str(DATA_FP)])


def test_simulate_review_finished(tmpdir):
    # file path
    asreview_fp = Path(tmpdir, "test.asreview")

    # simulate entry point
    _cli_simulate(f"{DATA_FP} -o {asreview_fp}".split())

    Path(tmpdir, "test").mkdir(parents=True)
    project = asr.Project.load(asreview_fp, Path(tmpdir, "test"))

    assert project.config["reviews"][0]["status"] == "finished"


def test_prior_idx(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} --prior-idx 1 4".split()
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as state:
        results_table = state.get_results_table()

    print(results_table.iloc[:, 0:4])

    assert results_table["record_id"][0] == 1
    assert results_table["record_id"][1] == 4
    assert results_table["query_strategy"][:1].isnull().all()
    assert results_table["query_strategy"][2:].notnull().all()


def test_n_prior_included(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} --n-prior-included 2".split()
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as state:
        result = state.get_results_table(["label", "query_strategy"])

    prior_included = result["label"] & (result["query_strategy"].isnull())
    assert sum(prior_included) >= 2


def test_n_prior_excluded(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} --n-prior-excluded 2".split()
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as state:
        result = state.get_results_table(["label", "query_strategy"])

    prior_excluded = ~result["label"] & (result["query_strategy"].isnull())
    assert sum(prior_excluded) >= 2


@pytest.mark.skip(reason="Not implemented yet.")
def test_seed(tmpdir):
    asreview_fp = Path(tmpdir, "test.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} --seed 42".split()
    _cli_simulate(argv)

    with open(asreview_fp, "r") as f:
        settings_metadata = json.load(f)

    assert settings_metadata["random_seed"] == 42


@pytest.mark.parametrize("model", ["logistic", "nb", "rf", "svm"])
def test_models(model, tmpdir):
    asreview_fp = Path(tmpdir, f"test_{model}.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} -c {model}".split()
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as state:
        results = state.get_results_table()
    default_n_priors = 2
    assert all(results["classifier"][default_n_priors:] == model)
    assert all(results["balance_strategy"][default_n_priors:] == "balanced")

    Path(tmpdir, f"test_{model}").mkdir(parents=True)
    project = asr.Project.load(asreview_fp, Path(tmpdir, f"test_{model}"))

    with open(
        Path(
            project.project_path,
            "reviews",
            project.config["reviews"][0]["id"],
            "settings_metadata.json",
        )
    ) as f:
        settings_metadata = json.load(f)
        print(settings_metadata)

    settings = asr.ReviewSettings.from_file(
        Path(
            project.project_path,
            "reviews",
            project.config["reviews"][0]["id"],
            "settings_metadata.json",
        )
    )

    assert settings.classifier == model


def test_no_balancing(tmpdir):
    asreview_fp = Path(tmpdir, "test_no_balance.asreview")
    argv = f"{str(DATA_FP)} -o {asreview_fp} --no-balance-strategy".split()
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as state:
        results_balance_strategies = state.get_results_table()["balance_strategy"]
        last_ranking_balance_strategies = state.get_last_ranking_table()[
            "balance_strategy"
        ]

    assert results_balance_strategies.isnull().all()
    assert last_ranking_balance_strategies.isnull().all()


def test_number_records_found(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    n_stop = 100
    priors = [116, 285]
    seed = 101

    argv = (
        f"{dataset} -o {asreview_fp} --n-stop {n_stop} "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as s:
        assert s.get_results_table("label")["label"].sum() == 25
        assert s.get_results_table("label").shape[0] == n_stop
        assert s.get_results_table().shape[0] == n_stop
        assert s.get_results_table()["record_id"].head(2).to_list() == [116, 285]


def test_n_stop_min(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    n_stop = "min"
    priors = [116, 285]
    seed = 535

    argv = (
        f"{dataset} -o {asreview_fp} --n-stop {n_stop} "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as s:
        assert s.get_results_table("label")["label"].sum() == 38
        assert len(s.get_results_table("label")) == 919


def test_n_stop_all(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp = Path(tmpdir, "test.asreview")
    n_stop = -1
    priors = [116, 285]
    seed = 101

    argv = (
        f"{dataset} -o {asreview_fp} --n-stop {n_stop} "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    with asr.open_state(asreview_fp) as s:
        assert s.get_results_table("label")["label"].sum() == 38
        assert len(s.get_results_table("label")) == 4544


@pytest.mark.xfail(raises=ValueError, reason="Cannot continue simulation.")
def test_project_already_exists_error(tmpdir):
    asreview_fp1 = Path(tmpdir, "test1.asreview")

    argv = (
        f"synergy:van_de_Schoot_2018 -o {asreview_fp1} --n-stop 100"
        f" --seed 535".split()
    )
    _cli_simulate(argv)

    # Simulate 100 queries in two steps of 50.
    argv = (
        f"synergy:van_de_Schoot_2018 -o {asreview_fp1} --n-stop 50"
        f" --seed 535".split()
    )
    _cli_simulate(argv)


@pytest.mark.skip(reason="Partial simulations are not available.")
def test_partial_simulation(tmpdir):
    dataset = "synergy:van_de_Schoot_2018"
    asreview_fp1 = Path(tmpdir, "test1.asreview")
    asreview_fp2 = Path(tmpdir, "test2.asreview")

    priors = [284, 285]
    seed = 101

    # Simulate 100 queries in one go.
    argv = (
        f"{dataset} -o {asreview_fp1} --n-stop 100 "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    # Simulate 100 queries in two steps of 50.
    argv = (
        f"{dataset} -o {asreview_fp2} --n-stop 50 "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    argv = (
        f"{dataset} -o {asreview_fp2} --n-stop 100 "
        f"--prior-idx {priors[0]} {priors[1]} --seed {seed}".split()
    )
    _cli_simulate(argv)

    with asr.open_state(asreview_fp1) as state:
        dataset1 = state.get_results_table()

    with asr.open_state(asreview_fp2) as state:
        dataset2 = state.get_results_table()

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
