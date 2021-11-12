from pathlib import Path

import numpy as np

from asreview.data import ASReviewData
from asreview.review.factory import get_simulate_reviewer
from asreview.state.utils import init_project_folder_structure

data_fp = Path('tests', "demo_data", "generic_labels.csv")


def test_init_seed(tmpdir):
    project_fp = Path(tmpdir, 'tmp_state.asreview')
    init_project_folder_structure(project_fp)

    base_start_idx = None
    n_test = 4
    seeds = np.random.randint(0, 2**63, 5, dtype=np.int64)
    for _ in range(n_test):
        all_start_idx = []
        for seed in seeds:
            reviewer = get_simulate_reviewer(data_fp,
                                             model="nb",
                                             state_file=project_fp,
                                             init_seed=seed,
                                             n_prior_excluded=1,
                                             n_prior_included=1)
            assert len(reviewer.prior_indices) == 2
            all_start_idx.append(reviewer.prior_indices)
        if base_start_idx is None:
            base_start_idx = all_start_idx
            continue

        assert np.all(np.array(base_start_idx) == np.array(all_start_idx))


def test_no_seed(tmpdir):
    project_fp = Path(tmpdir, 'tmp_state.asreview')
    init_project_folder_structure(project_fp)

    n_test_max = 100
    as_data = ASReviewData.from_file(data_fp)
    n_priored = np.zeros(len(as_data), dtype=int)

    for _ in range(n_test_max):
        reviewer = get_simulate_reviewer(data_fp,
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
        reviewer = get_simulate_reviewer(data_fp,
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
