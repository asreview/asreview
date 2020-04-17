#!/usr/bin/env python
import argparse
import json
import logging
import sys
from pathlib import Path

import numpy as np

from asreview.review.factory import get_reviewer
from asreview.state.utils import open_state
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils import get_lock_path
from asreview.webapp.utils import get_state_path
from asreview.webapp.utils.io import read_label_history
from asreview.webapp.utils.io import read_pool
from asreview.webapp.utils.io import write_pool
from asreview.webapp.utils.io import write_proba
from asreview.webapp.utils.paths import get_data_file_path
from asreview.webapp.utils.paths import get_project_path
from asreview.webapp.utils.paths import get_kwargs_path
from asreview.webapp.utils.project import read_data


def get_diff_history(new_history, old_history):
    for i in range(len(new_history)):
        try:
            if old_history[i] != new_history[i]:
                return new_history[i:]
        except IndexError:
            return new_history[i:]
    return []


def get_label_train_history(state):
    label_idx = []
    inclusions = []
    for query_i in range(state.n_queries()):
        try:
            new_labels = state.get("label_idx", query_i=query_i)
            new_inclusions = state.get("inclusions", query_i=query_i)
        except KeyError:
            new_labels = None
        if new_labels is not None:
            label_idx.extend(new_labels)
            inclusions.extend(new_inclusions)

    return list(zip(label_idx, inclusions))


def train_model(project_id, label_method=None):
    """Add the new labels to the review and do the modeling.

    It uses a lock to ensure only one model is running at the same time.
    Old results directories are deleted after 4 iterations.

    It has one argument on the CLI, which is the base project directory.
    """

    print(f"Train a new model for project {project_id}")

    # get file locations
    asr_kwargs_file = get_kwargs_path(project_id)
    lock_file = get_lock_path(project_id)

    # Lock so that only one training run is running at the same time.
    # It doesn't lock the flask server/client.
    with SQLiteLock(lock_file, blocking=False, lock_name="training") as lock:

        # If the lock is not acquired, another training instance is running.
        if not lock.locked():
            logging.info("Cannot acquire lock, other instance running.")
            return

        # Lock the current state. We want to have a consistent active state.
        # This does communicate with the flask backend; it prevents writing and
        # reading to the same files at the same time.
        with SQLiteLock(lock_file, blocking=True, lock_name="active") as lock:
            # Get the all labels since last run. If no new labels, quit.
            new_label_history = read_label_history(project_id)

        data_fp = str(get_data_file_path(project_id))
        as_data = read_data(project_id)
        state_file = get_state_path(project_id)

        # collect command line arguments and pass them to the reviewer
        with open(asr_kwargs_file, "r") as fp:
            asr_kwargs = json.load(fp)
        asr_kwargs['state_file'] = str(state_file)
        reviewer = get_reviewer(dataset=data_fp,
                                mode="minimal",
                                **asr_kwargs)

        with open_state(state_file) as state:
            old_label_history = get_label_train_history(state)

        diff_history = get_diff_history(new_label_history, old_label_history)

        if len(diff_history) == 0:
            logging.info("No new labels since last run.")
            return

        query_idx = np.array([x[0] for x in diff_history], dtype=int)
        inclusions = np.array([x[1] for x in diff_history], dtype=int)

        # Classify the new labels, train and store the results.
        with open_state(state_file) as state:
            reviewer.classify(query_idx, inclusions, state, method=label_method)
            reviewer.train()
            reviewer.log_probabilities(state)
            new_query_idx = reviewer.query(reviewer.n_pool()).tolist()
            reviewer.log_current_query(state)
            proba = state.pred_proba.tolist()

        with SQLiteLock(lock_file, blocking=True, lock_name="active") as lock:
            current_pool = read_pool(project_id)
            in_current_pool = np.zeros(len(as_data))
            in_current_pool[current_pool] = 1
            new_pool = [x for x in new_query_idx
                        if in_current_pool[x]]
            write_pool(project_id, new_pool)
            write_proba(project_id, proba)


def main(argv):

    # parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "project_id",
        type=str,
        help="Project id"
    )
    parser.add_argument(
        "--label_method",
        type=str,
        default=None,
        help="Label method (for example 'prior')"
    )
    args = parser.parse_args(argv)

    try:
        train_model(args.project_id, args.label_method)
    except Exception as err:
        logging.error(err)

        # write error to file is label method is prior (first iteration)
        if args.label_method == "prior":
            message = {"message": str(err)}

        fp = get_project_path(args.project_id) / "error.json"
        with open(fp, 'w') as f:
            json.dump(message, f)


if __name__ == "__main__":

    main(sys.argv)
