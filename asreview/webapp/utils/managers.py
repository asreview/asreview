import logging

import numpy as np

from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils.io import read_label_history
from asreview.webapp.utils.io import read_pool
from asreview.webapp.utils.io import write_label_history
from asreview.webapp.utils.io import write_pool
from asreview.webapp.utils.paths import get_lock_path


def add_to_pool(project_id, paper_i):

    # load the papers from the pool
    pool_list = read_pool(project_id)
    pool_list.append(paper_i)

    # write the papers to the label dataset
    write_pool(project_id, pool_list)


def remove_from_pool(project_id, paper_i, raise_on_missing=False):

    logging.info(f"Remove {paper_i} from pool")

    # load the papers from the pool
    pool_idx = read_pool(project_id)

    # Remove the paper from the pool.
    try:
        pool_idx.remove(int(paper_i))
    except (IndexError, ValueError):
        logging.info(f"{paper_i} not found in pool")
        if raise_on_missing:
            raise IndexError(f"{paper_i} not found in pool")
        return

    write_pool(project_id, pool_idx)


def get_random_from_pool(project_id):

    lock_fp = get_lock_path(project_id)
    with SQLiteLock(lock_fp, blocking=True, lock_name="active"):
        pool = read_pool(project_id)

    try:
        pool_random = np.random.choice(pool, 1, replace=False)[0]
    except Exception:
        raise ValueError("Not enough random indices to sample from.")

    return pool_random


def add_to_labeled(project_id, paper_i, label):

    labeled = read_label_history(project_id)
    labeled.append({"index": int(paper_i), "label": int(label)})

    write_label_history(project_id, labeled)


def remove_from_labeled(project_id, paper_i):

    logging.info(f"Remove {paper_i} from labeled")

    # Add the paper to the reviewed papers.
    labeled_list = read_label_history(project_id)

    labeled_list_new = []

    for item_id, item_label in labeled_list:

        item_id = int(item_id)
        item_label = int(item_label)
        paper_i = int(paper_i)

        if paper_i != item_id:
            labeled_list_new.append([item_id, item_label])

    # load the papers from the pool
    write_label_history(project_id, labeled_list_new)


def get_labeled(project_id):

    label_history = read_label_history(project_id)

    return ([x["index"] for x in label_history],
            [x["label"] for x in label_history])


def get_labeled_indices(project_id, subset=None):

    label_history = read_label_history(project_id, subset=subset)

    return [x["index"] for x in label_history]


def get_labeled_labels(project_id):

    label_history = read_label_history(project_id)

    return [x["label"] for x in label_history]


def move_label_from_pool_to_labeled(project_id, paper_i, label):

    remove_from_pool(project_id, paper_i)

    add_to_labeled(project_id, paper_i, label)


def move_label_from_labeled_to_pool(project_id, paper_i):

    remove_from_labeled(project_id, paper_i)

    add_to_pool(project_id, paper_i)
