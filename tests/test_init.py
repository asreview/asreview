from pathlib import Path

import pytest
from pandas.testing import assert_frame_equal

from asreview.entry_points.simulate import SimulateEntryPoint
from asreview.project import open_state

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")


@pytest.mark.parametrize(
    "seed",
    [
        (535),
        (165),
        (42),
    ],
)
def test_init_seed(tmpdir, seed):
    project1_fp = Path(tmpdir, "tmp_state1.asreview")
    project2_fp = Path(tmpdir, "tmp_state2.asreview")

    entry_point = SimulateEntryPoint()

    # simulate run 1
    argv1 = (
        f"{DATA_FP} -s {project1_fp} -m nb --init_seed"
        f" {seed} --n_prior_excluded 1 --n_prior_included 1 -n 2".split()
    )

    # simulate run 2
    argv2 = (
        f"{DATA_FP} -s {project2_fp} -m nb --init_seed"
        f" {seed} --n_prior_excluded 1 --n_prior_included 1  -n 2".split()
    )

    # run the simulations
    entry_point.execute(argv1)
    entry_point.execute(argv2)

    # open the state file and extract the priors
    with open_state(project1_fp) as s1:
        record_ids1 = s1.get_priors()["record_id"]

    with open_state(project2_fp) as s2:
        record_ids2 = s2.get_priors()["record_id"]

    assert record_ids1.tolist() == record_ids2.tolist()


def test_no_seed(tmpdir):
    priors = []
    for i in range(20):
        # get project url
        project_fp = Path(tmpdir, f"tmp_state_{i}.asreview")

        entry_point = SimulateEntryPoint()
        argv = (
            f"{DATA_FP} -s {project_fp} -m nb "
            f"--n_prior_excluded 1 --n_prior_included 1 -n 2".split()
        )
        entry_point.execute(argv)

        # open the state file and extract the priors
        with open_state(project_fp) as s:
            priors.extend(s.get_priors()["record_id"].tolist())

    assert len(set(priors)) > 2


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

    entry_point = SimulateEntryPoint()

    # simulate run 1
    argv1 = (
        f"{DATA_FP} -s {project1_fp} -m rf --init_seed {seed}"
        f" --seed {seed}"
        f" --n_prior_excluded 1 --n_prior_included 1".split()
    )

    # simulate run 2
    argv2 = (
        f"{DATA_FP} -s {project2_fp} -m rf --init_seed {seed}"
        f" --seed {seed}"
        f" --n_prior_excluded 1 --n_prior_included 1".split()
    )

    # run the simulations
    entry_point.execute(argv1)
    entry_point.execute(argv2)

    # open the state file and extract the priors
    with open_state(project1_fp) as s1:
        record_table1 = s1.get_dataset().drop("labeling_time", axis=1)

    with open_state(project2_fp) as s2:
        record_table2 = s2.get_dataset().drop("labeling_time", axis=1)

    assert_frame_equal(record_table1, record_table2)
