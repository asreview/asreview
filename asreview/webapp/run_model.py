#!/usr/bin/env python

import json
import os
from os.path import join
from pathlib import Path
import sys

import numpy as np
import shutil

from asreview.webapp.utils import get_active_iteration_index
from asreview.webapp.utils import get_iteration_path
from asreview.webapp.utils import get_lock_path
from asreview.webapp.utils import get_active_path
from asreview.webapp.utils import get_new_labels
from asreview.webapp.utils import get_pool_path
from asreview.webapp.utils import get_labeled_path
from asreview.webapp.sqlock import SQLiteLock
from asreview.logging.utils import open_logger
from asreview.review.factory import get_reviewer


def delete_dir(dir_):
    """Safely delete a result sub directory.

    First delete all expected files, then the directory.
    If there are unexpected files, don't delete the directory.

    Arguments
    ---------
    dir_: str, Path
        Directory to delete.
    """
    files = ["labeled.json", "pool.json", "result.json", "current_query.json"]
    for file in files:
        try:
            os.remove(Path(dir_, file))
        except FileNotFoundError:
            pass
    try:
        os.rmdir(dir_)
    except (FileNotFoundError, OSError):
        pass


def _wipe_old_states(project_id, current_open, remove_iterations=[7, 8]):

    for i in remove_iterations:
        # Delete some old directories.
        state_to_delete = get_iteration_path(project_id, current_open - i)
        delete_dir(state_to_delete)


def main():
    """Add the new labels to the review and do the modeling.

    It uses a lock to ensure only one model is running at the same time.
    Old results directories are deleted after 4 iterations.

    It has one argument on the CLI, which is the base project directory.
    """

    # pass the project_id the script
    project_id = sys.argv[1]

    # get file locations
    asr_kwargs_file = Path(project_id, "kwargs.json")
    lock_file = get_lock_path(project_id)
    active_file = get_active_path(project_id)

    # Lock so that only one training run is running at the same time.
    # It doesn't lock the flask server/client.
    with SQLiteLock(lock_file, blocking=False, lock_name="training") as lock:

        # If the lock is not acquired, another training instance is running.
        if not lock.locked():
            sys.exit(0)

        # Lock the current state. We want to have a consistent active state.
        # This does communicate with the flask backend; it prevents writing and
        # reading to the same files at the same time.
        with SQLiteLock(lock_file, blocking=True, lock_name="active") as lock:

            # Get the directory that is currently active.
            i_current_open = get_active_iteration_index(project_id)
            current_dir = get_iteration_path(project_id, i_current_open)

            # Get the new labels since last run. If no new labels, quit.
            labeled = get_new_labels(project_id, i_current_open)
            if len(labeled) == 0:
                sys.exit(0)

            # Make a new directory (current+1), and set it to active.
            i_next_open = i_current_open + 1
            get_iteration_path(project_id, i_next_open).mkdir(exist_ok=True)
            shutil.copy(
                get_pool_path(project_id, i_current_open),
                get_pool_path(project_id, i_next_open)
            )
            with open(active_file, "w") as fp:
                json.dump({"current_open": i_next_open}, fp)

        # Make a training directory (current+2) for modeling.
        i_train_open = i_next_open + 1
        train_dir = get_iteration_path(project_id, i_train_open)
        train_dir.mkdir(exist_ok=True)

        # copy the results to this folder
        state_file = train_dir / "result.json"
        shutil.copy(
            current_dir / "result.json",
            train_dir / "result.json"
        )

        # collect command line arguments and pass them to the reviewer
        with open(asr_kwargs_file, "r") as fp:
            asr_kwargs = json.load(fp)
        asr_kwargs['log_file'] = str(state_file)
        reviewer = get_reviewer(mode="minimal", **asr_kwargs)

        # Get the query indices and their inclusions.
        query_idx = []
        inclusions = []
        for idx, included in labeled.items():
            query_idx.append(idx)
            inclusions.append(included)
        query_idx = np.array(query_idx, dtype=np.int)
        inclusions = np.array(inclusions, dtype=np.int)

        # This is a bit of a hack (probably means core can use improvement).
        # The problem is to remember the origin of the query.
        try:
            with open(join(current_dir, "current_query.json"), "r") as fp:
                current_queries = json.load(fp)
            current_queries = {
                int(key): value for key, value in current_queries.items()}
        except FileNotFoundError:
            current_queries = {}

        reviewer.query_kwargs["current_queries"] = current_queries

        # Classify the new labels, train and store the results.
        with open_logger(state_file) as logger:
            reviewer.classify(query_idx, inclusions, logger)
            reviewer.train()
            reviewer.log_probabilities(logger)
        new_query_idx = reviewer.query(reviewer.n_pool())
        current_queries = reviewer.query_kwargs["current_queries"]
        current_queries = {
            str(key): str(value) for key, value in current_queries.items()}

        # Write back the current queries, pool indices.
        with open(Path(train_dir, "current_query.json"), "w") as fp:
            json.dump(current_queries, fp)

        with open(Path(train_dir, "pool.json"), "w") as fp:
            json.dump(new_query_idx.tolist(), fp)

        with SQLiteLock(lock_file, blocking=True, lock_name="active") as lock:
            # If in the mean time more papers are labeled, copy them.
            try:
                shutil.copy(
                    get_labeled_path(project_id, i_current_open),
                    get_labeled_path(project_id, i_next_open)
                )
            except FileNotFoundError:
                pass

            # Change the active directory to the training dir.
            with open(active_file, "w") as fp:
                json.dump({"current_open": i_train_open}, fp)

        # Delete some old directories.
        _wipe_old_states(project_id, i_current_open)


if __name__ == "__main__":
    main()
