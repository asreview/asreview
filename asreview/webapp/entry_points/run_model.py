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
from pathlib import Path

import numpy as np
import pandas as pd
from filelock import FileLock
from filelock import Timeout

from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.models.balance import get_balance_model
from asreview.models.classifiers import get_classifier
from asreview.models.feature_extraction import get_feature_model
from asreview.models.query import get_query_model
from asreview.project import ASReviewProject
from asreview.project import open_state
from asreview.review.simulate import Simulate


def _run_model_start(project, output_error=True):
    project = ASReviewProject(project)

    try:
        # Check if there are new labeled records to train with
        with open_state(project.project_path) as state:
            if not state.exist_new_labeled_records:
                return

        # Lock so that only one training run is running at the same time.
        lock = FileLock(Path(project.project_path, "training.lock"), timeout=0)

        with lock:
            as_data = project.read_data()

            with open_state(project) as state:
                settings = state.settings

            feature_model = get_feature_model(settings.feature_extraction)

            # get the feature matrix
            try:
                fm = project.get_feature_matrix(feature_model.name)
            except FileNotFoundError:
                fm = feature_model.fit_transform(
                    as_data.texts, as_data.headings, as_data.bodies, as_data.keywords
                )

                if fm.shape[0] != len(as_data):
                    raise ValueError(
                        f"Dataset has {len(as_data)} records while feature "
                        f"extractor returns {fm.shape[0]} records"
                    )

                project.add_feature_matrix(fm, feature_model.name)

            with open_state(project) as state:
                record_table = state.get_record_table()
                labeled = state.get_labeled()
                labels = labeled["label"].to_list()
                training_set = len(labeled)
                if not (0 in labels and 1 in labels):
                    raise ValueError(
                        "Not both labels available. " "Stopped training the model"
                    )

            # TODO: Simplify balance model input.
            # Use the balance model to sample the trainings data.
            y_sample_input = (
                pd.DataFrame(record_table)
                .merge(labeled, how="left", on="record_id")
                .loc[:, "label"]
                .fillna(LABEL_NA)
                .to_numpy()
            )
            train_idx = np.where(y_sample_input != LABEL_NA)[0]

            balance_model = get_balance_model(settings.balance_strategy)
            X_train, y_train = balance_model.sample(fm, y_sample_input, train_idx)

            classifier = get_classifier(settings.model)
            classifier.fit(X_train, y_train)

            query_strategy = get_query_model(settings.query_strategy)
            ranked_record_ids, relevance_scores = query_strategy.query(
                fm, classifier=classifier, return_classifier_scores=True
            )

            with open_state(project, read_only=False) as state:
                state.add_last_ranking(
                    ranked_record_ids,
                    classifier.name,
                    query_strategy.name,
                    balance_model.name,
                    feature_model.name,
                    training_set,
                )

                if relevance_scores is not None:
                    state.add_last_probabilities(relevance_scores[:, 1])

        project.update_review(status="review")

    except Timeout:
        logging.debug("Another iteration is training")

    except Exception as err:
        project.set_error(err, save_error_message=output_error)
        raise err

    else:
        project.update_review(status="review")


def _simulate_start(project):
    with open_state(project) as state:
        settings = state.settings
        priors = state.get_priors()["record_id"].tolist()

    reviewer = Simulate(
        project.read_data(),
        project=project,
        classifier=get_classifier(settings.model),
        query_model=get_query_model(settings.query_strategy),
        balance_model=get_balance_model(settings.balance_strategy),
        feature_model=get_feature_model(settings.feature_extraction),
        prior_indices=priors,
        write_interval=100,
    )

    try:
        project.update_review(status="review")
        reviewer.review()

    except Exception as err:
        project.set_error(err)
        raise err

    project.mark_review_finished()


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("project", type=ASReviewProject, help="Project path")
    args = parser.parse_args(argv)

    if args.project.config["mode"] == PROJECT_MODE_SIMULATE:
        _simulate_start(args.project)
    else:
        _run_model_start(args.project, output_error=args.output_error)
