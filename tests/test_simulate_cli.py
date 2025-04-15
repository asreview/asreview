import json
from dataclasses import asdict
from pathlib import Path

import pytest
from pandas.testing import assert_frame_equal

import asreview as asr
from asreview.simulation.cli import _cli_simulate


def test_dataset_not_found(tmp_project):
    argv = f"does_not.exist -o {tmp_project}".split()
    with pytest.raises(ValueError):
        _cli_simulate(argv)


def test_no_output(demo_data_path):
    _cli_simulate([str(demo_data_path)])


def test_simulate_review_finished(tmpdir, demo_data_path, tmp_project):
    _cli_simulate(f"{demo_data_path} -o {tmp_project}".split())

    Path(tmpdir, "test").mkdir(parents=True)
    project = asr.Project.load(tmp_project, Path(tmpdir, "test"))
    assert project.config["reviews"][0]["status"] == "finished"


def test_prior_idx(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --prior-idx 0 9".split()
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as state:
        results_table = state.get_results_table()

    assert results_table["record_id"].head(2).to_list() == [0, 9]
    assert results_table["querier"][:1].isnull().all()
    assert results_table["querier"][2:].notnull().all()


def test_n_prior_included(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --n-prior-included 2 --prior-seed 535".split()
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as state:
        result = state.get_results_table(["label", "querier"])

    prior_included = result["label"] & (result["querier"].isnull())
    assert sum(prior_included) >= 2


def test_n_prior_excluded(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --n-prior-excluded 2 --prior-seed 535".split()
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as state:
        result = state.get_results_table(["label", "querier"])

    prior_excluded = ~result["label"] & (result["querier"].isnull())
    assert sum(prior_excluded) >= 2


@pytest.mark.skip(reason="Not implemented yet.")
def test_seed(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --seed 535".split()
    _cli_simulate(argv)

    with open(tmp_project, "r") as f:
        settings_metadata = json.load(f)

    assert settings_metadata["random_seed"] == 535


def test_no_seed(tmpdir, demo_data_path):
    for i in range(10):
        project_fp = Path(tmpdir, f"tmp_state_{i}.asreview")

        argv = (
            f"{demo_data_path} -o {project_fp} -c nb -q max -e tfidf "
            f"--n-prior-excluded 1 --n-prior-included 1 --n-stop 4".split()
        )
        _cli_simulate(argv)
        with asr.open_state(project_fp) as s:
            priors = s.get_priors()

    assert len(priors) == 2


@pytest.mark.parametrize("seed", [(535), (165), (42)])
def test_model_and_prior_seed(tmpdir, seed, demo_data_path):
    project1_fp = Path(tmpdir, "tmp_state1.asreview")
    project2_fp = Path(tmpdir, "tmp_state2.asreview")

    # run the simulations
    _cli_simulate(
        f"{demo_data_path} -o {project1_fp} -c rf -e tfidf -q max --prior-seed {seed}"
        f" --seed {seed}"
        f" --n-prior-excluded 1 --n-prior-included 1".split()
    )
    _cli_simulate(
        f"{demo_data_path} -o {project2_fp} -c rf -e tfidf -q max --prior-seed {seed}"
        f" --seed {seed}"
        f" --n-prior-excluded 1 --n-prior-included 1".split()
    )

    # open the state file and extract the priors
    with asr.open_state(project1_fp) as s1:
        record_table1 = s1.get_results_table().drop("time", axis=1)

    with asr.open_state(project2_fp) as s2:
        record_table2 = s2.get_results_table().drop("time", axis=1)

    assert_frame_equal(record_table1, record_table2)


@pytest.mark.parametrize("model", ["logistic", "nb", "rf", "svm"])
def test_models(model, tmpdir, demo_data_path, tmp_project):
    _cli_simulate(
        f"{demo_data_path} -o {tmp_project} -c {model}".split()
        + "-e tfidf -q max -b balanced".split()
    )

    with asr.open_state(tmp_project) as state:
        results = state.get_results_table()

    assert all(results["classifier"][10:] == model)
    assert all(results["balancer"][10:] == "balanced")
    assert all(results["feature_extractor"][10:] == "tfidf")
    assert all(results["querier"][10:] == "max")


def test_no_balancing(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} -c nb -q max -e tfidf".split()
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as state:
        results_balance_strategies = state.get_results_table()["balancer"]
        last_ranking_balance_strategies = state.get_last_ranking_table()["balancer"]

    assert results_balance_strategies.isnull().all()
    assert last_ranking_balance_strategies.isnull().all()


def test_number_records_found(tmp_project, demo_data_path):
    _cli_simulate(
        f"{demo_data_path} -o {tmp_project} --n-stop 15"
        " --prior-idx 0 9 --seed 535".split()
    )

    with asr.open_state(tmp_project) as s:
        assert s.get_results_table("label")["label"].sum() == 9
        assert s.get_results_table("label").shape[0] == 15
        assert s.get_results_table().shape[0] == 15
        assert s.get_results_table()["label"].head(2).sum() == 1


def test_n_stop_min(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --prior-idx 0 9 --seed 535".split()
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as s:
        assert s.get_results_table("label")["label"].sum() == 10
        assert len(s.get_results_table("label")) == 51


def test_n_stop_all(tmp_project):
    argv = (
        "synergy:Sep_2021",
        "-o",
        f"{tmp_project}",
        "--n-stop",
        "-1",
        "--prior-idx",
        "116",
        "10",
        "--seed",
        "101",
    )
    _cli_simulate(argv)

    with asr.open_state(tmp_project) as s:
        assert s.get_results_table("label")["label"].sum() == 40
        assert len(s.get_results_table("label")) == 271


def test_project_already_exists_error(tmp_project, demo_data_path):
    argv = f"{demo_data_path} -o {tmp_project} --n-stop 100 --seed 535".split()
    _cli_simulate(argv)

    with pytest.raises(ValueError):
        # Simulate 100 queries in two steps of 50.
        argv = f"{demo_data_path} -o {tmp_project} --n-stop 50 --seed 535".split()
        _cli_simulate(argv)


def test_cycle_config(tmpdir, demo_data_path, tmp_project):
    cycle_meta = asr.ActiveLearningCycleData(
        querier="max",
        classifier="nb",
        balancer="balanced",
        feature_extractor="tfidf",
        classifier_param={"alpha": 5},
    )

    fp_cycle = Path(tmpdir, "cycle.json")

    with open(fp_cycle, "w") as f:
        json.dump(asdict(cycle_meta), f)

    _cli_simulate(f"{demo_data_path} -o {tmp_project} --config-file {fp_cycle}".split())

    with asr.open_state(tmp_project) as state:
        results = state.get_results_table()

    assert all(results["classifier"][10:] == "nb")
    assert all(results["balancer"][10:] == "balanced")
    assert all(results["feature_extractor"][10:] == "tfidf")
    assert all(results["querier"][10:] == "max")

    # todo save and test for params in simulation
