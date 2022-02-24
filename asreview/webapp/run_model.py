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

from asreview.models.balance import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model
from asreview.review.base import BaseReview
from asreview.state.paths import get_lock_path
from asreview.state.utils import open_state
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils import read_data
from asreview.project import get_project_path


def get_lab_reviewer(as_data,
                     state_file=None,
                     embedding_fp=None,
                     verbose=0,
                     prior_idx=None,
                     prior_record_id=None,
                     seed=None,
                     **kwargs):
    """Get a review object from arguments.
    """

    if len(as_data) == 0:
        raise ValueError("Supply at least one dataset"
                         " with at least one record.")

    with open_state(state_file) as state:
        settings = state.settings

    # TODO: Set random seed.
    # Initialize models.
    # random_state = get_random_state(seed)
    classifier_model = get_classifier(settings.model)
    query_model = get_query_model(settings.query_strategy)
    balance_model = get_balance_model(settings.balance_strategy)
    feature_model = get_feature_model(settings.feature_extraction)

    # LSTM models need embedding matrices.
    if classifier_model.name.startswith("lstm-"):
        texts = as_data.texts
        classifier_model.embedding_matrix = feature_model.get_embedding_matrix(
            texts, embedding_fp)

    # prior knowledge
    if prior_idx is not None and prior_record_id is not None and \
            len(prior_idx) > 0 and len(prior_record_id) > 0:
        raise ValueError(
            "Not possible to provide both prior_idx and prior_record_id"
        )

    reviewer = BaseReview(as_data,
                          state_file,
                          model=classifier_model,
                          query_model=query_model,
                          balance_model=balance_model,
                          feature_model=feature_model,
                          **kwargs)
    return reviewer


def train_model(project_id):
    """Add the new labels to the review and do the modeling.

    It uses a lock to ensure only one model is running at the same time.
    Old results directories are deleted after 4 iterations.

    It has one argument on the CLI, which is the base project directory.
    """
    project_path = get_project_path(project_id)
    logging.info(f"Project {project_id} - Train a new model for project")

    # get file locations
    lock_file = get_lock_path(project_path)

    # Lock so that only one training run is running at the same time.
    # It doesn't lock the flask server/client.
    with SQLiteLock(
            lock_file, blocking=False, lock_name="training",
            project_id=project_id) as lock:

        # If the lock is not acquired, another training instance is running.
        if not lock.locked():
            logging.info(f"Project {project_id} - "
                         "Cannot acquire lock, other instance running.")
            return

        # Check if there are new labeled records.
        with open_state(project_path) as state:
            exist_new_labeled_records = state.exist_new_labeled_records

        if exist_new_labeled_records:
            # collect command line arguments and pass them to the reviewer
            as_data = read_data(project_id)

            reviewer = get_lab_reviewer(
                as_data=as_data,
                state_file=project_path
            )

            # Train the model.
            reviewer.train()
        else:
            logging.info(
                f"Project {project_id} - No new labels since last run.")
            return


def main(argv):

    # parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("project_id", type=str, help="Project id")
    parser.add_argument(
        "--output_error",
        dest='output_error',
        action='store_true',
        help="Save training error message to file.")
    args = parser.parse_args(argv)

    try:
        train_model(args.project_id)
    except Exception as err:
        err_type = type(err).__name__
        logging.error(f"Project {args.project_id} - {err_type}: {err}")

        # write error to file if label method is prior (first iteration)
        if args.output_error:
            message = {"message": f"{err_type}: {err}"}

            fp = get_project_path(args.project_id) / "error.json"
            with open(fp, 'w') as f:
                json.dump(message, f)

        # raise the error for full traceback
        raise err


if __name__ == "__main__":

    main(sys.argv)
