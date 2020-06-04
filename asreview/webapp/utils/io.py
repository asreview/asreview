import json

import numpy as np

from asreview.config import LABEL_NA
from asreview.data import ASReviewData
from asreview.webapp.utils.paths import get_data_file_path
from asreview.webapp.utils.paths import get_labeled_path
from asreview.webapp.utils.paths import get_pool_path
from asreview.webapp.utils.paths import get_proba_path


def read_data(project_id):
    """Get ASReviewData object of the dataset"""
    dataset = get_data_file_path(project_id)
    return ASReviewData.from_file(dataset)


def read_pool(project_id):
    pool_fp = get_pool_path(project_id)
    try:
        with open(pool_fp, "r") as f:
            pool = json.load(f)
        pool = [int(x) for x in pool]
    except FileNotFoundError:
        pool = None
    return pool


def write_pool(project_id, pool):
    pool_fp = get_pool_path(project_id)
    with open(pool_fp, "w") as f:
        json.dump(pool, f)


def read_proba(project_id):
    proba_fp = get_proba_path(project_id)
    try:
        with open(proba_fp, "r") as f:
            proba = json.load(f)
        proba = [float(x) for x in proba]
    except FileNotFoundError:
        proba = None
    return proba


def write_proba(project_id, proba):
    proba_fp = get_proba_path(project_id)
    with open(proba_fp, "w") as f:
        json.dump(proba, f)


def read_label_history(project_id, subset=None):
    """Get all the newly labeled papers from the file.

    Make sure to lock the "active" lock.
    """

    try:
        with open(get_labeled_path(project_id), "r") as fp:
            labeled = json.load(fp)

        if subset is None:
            labeled = [[int(idx), int(label)] for idx, label in labeled]
        elif subset in ["included", "relevant"]:
            labeled = [
                [int(idx), int(label)]
                for idx, label in labeled if int(label) == 1
            ]
        elif subset in ["excluded", "irrelevant"]:
            labeled = [
                [int(idx), int(label)]
                for idx, label in labeled if int(label) == 0
            ]
        else:
            raise ValueError(f"Subset value '{subset}' not found.")

    except FileNotFoundError:
        # file not found implies that there is no file written yet
        labeled = []

    return labeled


def write_label_history(project_id, label_history):
    label_fp = get_labeled_path(project_id)

    with open(label_fp, "w") as f:
        json.dump(label_history, f)


def read_current_labels(project_id, as_data=None, label_history=None):
    if as_data is None:
        as_data = read_data(project_id)

    if label_history is None:
        label_history = read_label_history(project_id)
    labels = as_data.labels
    if labels is None:
        labels = np.full(len(as_data), LABEL_NA, dtype=int)

    for idx, inclusion in label_history:
        labels[idx] = inclusion

    return np.array(labels, dtype=int)
