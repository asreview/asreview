# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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
import logging
import sys
from pathlib import Path

from asreview.models.balance import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model
from asreview.project import ASReviewProject
from asreview.project import open_state
from asreview.review.base import BaseReview
from asreview.webapp.io import read_data
from asreview.webapp.sqlock import SQLiteLock


def get_lab_reviewer(as_data,
                     project,
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

    with open_state(project) as state:
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
        classifier_model.embedding_matrix = feature_model.get_embedding_matrix(
            as_data.texts, embedding_fp)

    # prior knowledge
    if prior_idx is not None and prior_record_id is not None and \
            len(prior_idx) > 0 and len(prior_record_id) > 0:
        raise ValueError(
            "Not possible to provide both prior_idx and prior_record_id"
        )

    reviewer = BaseReview(as_data,
                          project,
                          model=classifier_model,
                          query_model=query_model,
                          balance_model=balance_model,
                          feature_model=feature_model,
                          **kwargs)
    return reviewer


def train_model(project):
    """Add the new labels to the review and do the modeling.

    It uses a lock to ensure only one model is running at the same time.
    Old results directories are deleted after 4 iterations.

    It has one argument on the CLI, which is the base project directory.
    """

    logging.info(f"Project {project.project_path} - Train a new model for project")

    # get file locations
    lock_file = Path(project.project_path, "lock.sqlite")

    # Lock so that only one training run is running at the same time.
    # It doesn't lock the flask server/client.
    with SQLiteLock(
            lock_file, blocking=False, lock_name="training",
            project_id=project.project_id) as lock:

        # If the lock is not acquired, another training instance is running.
        if not lock.locked():
            logging.info(f"Project {project.project_path} - "
                         "Cannot acquire lock, other instance running.")
            return

        # Check if there are new labeled records.
        with open_state(project.project_path) as state:
            exist_new_labeled_records = state.exist_new_labeled_records

        if exist_new_labeled_records:
            # collect command line arguments and pass them to the reviewer
            as_data = read_data(project)

            reviewer = get_lab_reviewer(as_data, project)

            # Train the model.
            reviewer.train()
        else:
            logging.info(
                f"Project {project.project_path} - No new labels since last run.")
            return


def main(argv):

    # parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("project_path", type=str, help="Project id")
    parser.add_argument(
        "--output_error",
        dest='output_error',
        action='store_true',
        help="Save training error message to file.")
    parser.add_argument(
        "--first_run",
        dest='first_run',
        action='store_true',
        help="After first run, status is updated.")
    args = parser.parse_args(argv)

    project = ASReviewProject(args.project_path)

    try:
        train_model(project)

        # change the project status to review
        project.update_review(status="review")

    except Exception as err:

        # save the error to the project
        project.set_error(err, save_error_message=args.output_error)

        # raise the error for full traceback
        raise err
    else:
        project.update_review(status="review")


if __name__ == "__main__":

    main(sys.argv)
