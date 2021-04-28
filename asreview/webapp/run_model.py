# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import argparse
import json
import logging
import sys

import numpy as np
import pandas as pd

from asreview.compat import convert_id_to_idx, convert_idx_to_id
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


def _get_diff_history(new_history, old_history):
    for i in range(len(new_history)):
        try:
            if old_history[i] != new_history[i]:
                return new_history[i:]
        except IndexError:
            return new_history[i:]
    return []


def _get_label_train_history(state):
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

    logging.info(f"Project {project_id} - Train a new model for project")

    # get file locations
    asr_kwargs_file = get_kwargs_path(project_id)
    lock_file = get_lock_path(project_id)

    # Lock so that only one training run is running at the same time.
    # It doesn't lock the flask server/client.
    with SQLiteLock(
            lock_file, blocking=False, lock_name="training",
            project_id=project_id) as lock:

        # If the lock is not acquired, another training instance is running.
        if not lock.locked():
            logging.info("Project {project_id} - "
                         "Cannot acquire lock, other instance running.")
            return

        # Lock the current state. We want to have a consistent active state.
        # This does communicate with the flask backend; it prevents writing and
        # reading to the same files at the same time.
        with SQLiteLock(
                lock_file,
                blocking=True,
                lock_name="active",
                project_id=project_id) as lock:
            # Get the all labels since last run. If no new labels, quit.
            new_label_history = read_label_history(project_id)

        data_fp = str(get_data_file_path(project_id))
        as_data = read_data(project_id)
        state_file = get_state_path(project_id)

        # collect command line arguments and pass them to the reviewer
        with open(asr_kwargs_file, "r") as fp:
            asr_kwargs = json.load(fp)

        try:
            del asr_kwargs["abstract_only"]
        except KeyError:
            pass

        asr_kwargs['state_file'] = str(state_file)
        reviewer = get_reviewer(dataset=data_fp, mode="minimal", **asr_kwargs)

        with open_state(state_file) as state:
            old_label_history = _get_label_train_history(state)

        diff_history = _get_diff_history(new_label_history, old_label_history)

        if len(diff_history) == 0:
            logging.info(
                "Project {project_id} - No new labels since last run.")
            return

        query_record_ids = np.array([x[0] for x in diff_history], dtype=int)
        inclusions = np.array([x[1] for x in diff_history], dtype=int)

        query_idx = convert_id_to_idx(as_data, query_record_ids)

        # Classify the new labels, train and store the results.
        with open_state(state_file) as state:
            reviewer.classify(
                query_idx, inclusions, state, method=label_method)
            reviewer.train()
            reviewer.log_probabilities(state)
            new_query_idx = reviewer.query(reviewer.n_pool()).tolist()
            reviewer.log_current_query(state)

            # write the proba to a pandas dataframe with record_ids as index
            proba = pd.DataFrame(
                {"proba": state.pred_proba.tolist()},
                index=pd.Index(as_data.record_ids, name="record_id")
            )

        # update the pool and output the proba's
        # important: pool is sorted on query
        with SQLiteLock(
                lock_file,
                blocking=True,
                lock_name="active",
                project_id=project_id) as lock:

            # read the pool
            current_pool = read_pool(project_id)

            # diff pool and new_query_ind
            current_pool_idx = convert_id_to_idx(as_data, current_pool)
            current_pool_idx = frozenset(current_pool_idx)
            new_pool_idx = [x for x in new_query_idx if x in current_pool_idx]

            # convert new_pool_idx back to record_ids
            new_pool = convert_idx_to_id(as_data, new_pool_idx)

            # write the pool and proba
            write_pool(project_id, new_pool)
            write_proba(project_id, proba)


def main(argv):

    # parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("project_id", type=str, help="Project id")
    parser.add_argument(
        "--label_method",
        type=str,
        default=None,
        help="Label method (for example 'prior')")
    args = parser.parse_args(argv)

    try:
        train_model(args.project_id, args.label_method)
    except Exception as err:
        err_type = type(err).__name__
        logging.error(f"Project {args.project_id} - {err_type}: {err}")

        # write error to file is label method is prior (first iteration)
        if args.label_method == "prior":
            message = {"message": f"{err_type}: {err}"}

            fp = get_project_path(args.project_id) / "error.json"
            with open(fp, 'w') as f:
                json.dump(message, f)

        # raise the error for full traceback
        raise err


if __name__ == "__main__":

    main(sys.argv)
