__all__ = ["sample_prior_knowledge", "naive_prior_knowledge"]


import numpy as np

from asreview.utils import get_random_state


def sample_prior_knowledge(
    labels, n_prior_included=10, n_prior_excluded=10, random_state=None
):
    """Function to sample prelabelled articles.

    Arguments
    ---------
    labels: np.ndarray
        Array of labels, with 1 -> included, 0 -> excluded.
    n_prior_included: int
        The number of positive labels.
    n_prior_excluded: int
        The number of negative labels.
    random_state : int, asreview.utils.SeededRandomState instance or None,
        optional (default=None)
        Random state or it's seed.

    Returns
    -------
    np.ndarray:
        An array with n_included and n_excluded indices.

    """
    # set random state
    r = get_random_state(random_state)

    # retrieve the index of included and excluded papers
    included_idx = np.where(labels == 1)[0]
    excluded_idx = np.where(labels == 0)[0]

    if len(included_idx) < n_prior_included:
        raise ValueError(
            f"Number of included priors requested ({n_prior_included})"
            f" is bigger than number of included papers "
            f"({len(included_idx)})."
        )
    if len(excluded_idx) < n_prior_excluded:
        raise ValueError(
            f"Number of excluded priors requested ({n_prior_excluded})"
            f" is bigger than number of excluded papers "
            f"({len(excluded_idx)})."
        )
    # select randomly from included and excluded papers
    included_indexes_sample = r.choice(included_idx, n_prior_included, replace=False)
    excluded_indexes_sample = r.choice(excluded_idx, n_prior_excluded, replace=False)

    init = np.append(included_indexes_sample, excluded_indexes_sample)

    return init


def naive_prior_knowledge(labels):
    """Select top records until the first 0 and 1 are found.

    Arguments
    ---------
    labels: np.ndarray
        Array of labels, with 1 -> included, 0 -> excluded.

    Returns
    -------
    np.ndarray:
        An array with prior indices from top dataset.

    """

    # retrieve the index of included and excluded papers
    first_included_idx = np.where(labels == 1)[0].min()
    first_excluded_idx = np.where(labels == 0)[0].min()

    return np.arange(max(first_included_idx, first_excluded_idx) + 1)
