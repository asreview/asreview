from pathlib import Path

import numpy as np
import pytest

from asreview.data import ASReviewData
from asreview.entry_points.simulate import SimulateEntryPoint
from asreview.state.utils import init_project_folder_structure
from asreview.state import open_state

DATA_FP = Path('tests', "demo_data", "generic_labels.csv")


@pytest.mark.parametrize("seed", [
    (535),
    (165),
    (42),
])
def test_init_seed(tmpdir, seed):
    project1_fp = Path(tmpdir, 'tmp_state1.asreview')
    project2_fp = Path(tmpdir, 'tmp_state2.asreview')

    entry_point = SimulateEntryPoint()

    # simulate run 1
    argv1 = f'{DATA_FP} -s {project1_fp} -m nb --init_seed' \
        f' {seed} --n_prior_excluded 1 --n_prior_included 1 -n 2'.split()

    # simulate run 2
    argv2 = f'{DATA_FP} -s {project2_fp} -m nb --init_seed' \
        f' {seed} --n_prior_excluded 1 --n_prior_included 1  -n 2'.split()

    # run the simulations
    entry_point.execute(argv1)
    entry_point.execute(argv2)

    # open the state file and extract the priors
    with open_state(project1_fp) as s1:
        record_ids1 = s1.get_priors()

    with open_state(project2_fp) as s2:
        record_ids2 = s2.get_priors()

    assert record_ids1.tolist() == record_ids2.tolist()


def test_no_seed(tmpdir):
    project_fp = Path(tmpdir, 'tmp_state.asreview')
    init_project_folder_structure(project_fp)

    n_test_max = 100
    as_data = ASReviewData.from_file(DATA_FP)
    n_priored = np.zeros(len(as_data), dtype=int)

    for _ in range(n_test_max):
        reviewer = get_simulate_reviewer(DATA_FP,
                                         model="nb",
                                         state_file=project_fp,
                                         init_seed=None,
                                         n_prior_excluded=1,
                                         n_prior_included=1)
        assert len(reviewer.prior_indices) == 2
        n_priored[reviewer.prior_indices] += 1
        if np.all(n_priored > 0):
            return
    raise ValueError(f"Error getting all priors in {n_test_max} iterations.")


def test_model_seed(tmpdir):
    project_fp = Path(tmpdir, 'tmp_state.asreview')
    init_project_folder_structure(project_fp)

    n_test = 4
    seed = 192874123
    # last_train_idx = None
    for _ in range(n_test):
        reviewer = get_simulate_reviewer(DATA_FP,
                                         model="rf",
                                         query_strategy="random",
                                         state_file=project_fp,
                                         init_seed=seed,
                                         seed=seed,
                                         n_prior_excluded=1,
                                         n_prior_included=1)
        reviewer.review()
        # TODO: What is being tested here? Review no longer has train_idx.
        # if last_train_idx is None:
        #     last_train_idx = reviewer.train_idx
        # assert np.all(last_train_idx == reviewer.train_idx)
