from pathlib import Path

import numpy as np

from asreview.review.factory import get_reviewer
from asreview.data import ASReviewData

data_fp = Path("tests", "demo_data", "generic_labels.csv")


def test_init_seed():

    base_start_idx = None
    n_test = 4
    seeds = np.random.randint(0, 2**63, 5)
    for _ in range(n_test):
        all_start_idx = []
        for seed in seeds:
            reviewer = get_reviewer(
                data_fp, mode="simulate", model="nb", state_file=None,
                init_seed=seed, n_prior_excluded=1, n_prior_included=1)
            assert len(reviewer.start_idx) == 2
            all_start_idx.append(reviewer.start_idx)
        if base_start_idx is None:
            base_start_idx = all_start_idx
            continue

        assert np.all(np.array(base_start_idx) == np.array(all_start_idx))


def test_no_seed():
    n_test_max = 100
    as_data = ASReviewData.from_file(data_fp)
    n_priored = np.zeros(len(as_data), dtype=int)

    for _ in range(n_test_max):
        reviewer = get_reviewer(
            data_fp, mode="simulate", model="nb", state_file=None,
            init_seed=None, n_prior_excluded=1, n_prior_included=1)
        assert len(reviewer.start_idx) == 2
        n_priored[reviewer.start_idx] += 1
        if np.all(n_priored > 0):
            return
    raise ValueError(f"Error getting all priors in {n_test_max} iterations.")
