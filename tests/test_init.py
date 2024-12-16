from pathlib import Path

import pytest
from pandas.testing import assert_frame_equal

import asreview as asr
from asreview.simulation.cli import _cli_simulate

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")


@pytest.mark.parametrize(
    "seed",
    [
        (535),
        (165),
        (42),
    ],
)
def test_prior_seed(tmpdir, seed):
    project1_fp = Path(tmpdir, "tmp_state1.asreview")
    project2_fp = Path(tmpdir, "tmp_state2.asreview")

    # simulate run 1
    argv1 = (
        f"{DATA_FP} -o {project1_fp} -c nb --prior-seed"
        f" {seed} --n-prior-excluded 1 --n-prior-included 1 --n-stop 4".split()
    )

    # simulate run 2
    argv2 = (
        f"{DATA_FP} -o {project2_fp} -c nb --prior-seed"
        f" {seed} --n-prior-excluded 1 --n-prior-included 1  --n-stop 4".split()
    )

    # run the simulations
    _cli_simulate(argv1)
    _cli_simulate(argv2)

    # open the state file and extract the priors
    with asr.open_state(project1_fp) as s1:
        record_ids1 = s1.get_priors()["record_id"]

    with asr.open_state(project2_fp) as s2:
        record_ids2 = s2.get_priors()["record_id"]

    assert record_ids1.tolist() == record_ids2.tolist()


def test_no_seed(tmpdir):
    for i in range(20):
        # get project url
        project_fp = Path(tmpdir, f"tmp_state_{i}.asreview")

        argv = (
            f"{DATA_FP} -o {project_fp} -c nb "
            f"--n-prior-excluded 1 --n-prior-included 1 --n-stop 4".split()
        )
        _cli_simulate(argv)

        # open the state file and extract the priors
        with asr.open_state(project_fp) as s:
            priors = s.get_priors()

    assert len(priors) == 2


@pytest.mark.parametrize(
    "seed",
    [
        (535),
        (165),
        (42),
    ],
)
def test_model_seed(tmpdir, seed):
    project1_fp = Path(tmpdir, "tmp_state1.asreview")
    project2_fp = Path(tmpdir, "tmp_state2.asreview")

    # simulate run 1
    argv1 = (
        f"{DATA_FP} -o {project1_fp} -c rf --prior-seed {seed}"
        f" --seed {seed}"
        f" --n-prior-excluded 1 --n-prior-included 1".split()
    )

    # simulate run 2
    argv2 = (
        f"{DATA_FP} -o {project2_fp} -c rf --prior-seed {seed}"
        f" --seed {seed}"
        f" --n-prior-excluded 1 --n-prior-included 1".split()
    )

    # run the simulations
    _cli_simulate(argv1)
    _cli_simulate(argv2)

    # open the state file and extract the priors
    with asr.open_state(project1_fp) as s1:
        record_table1 = s1.get_results_table().drop("time", axis=1)

    with asr.open_state(project2_fp) as s2:
        record_table2 = s2.get_results_table().drop("time", axis=1)

    assert_frame_equal(record_table1, record_table2)
