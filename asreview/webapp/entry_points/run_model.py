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

import pandas as pd
from filelock import FileLock
from filelock import Timeout

import asreview as asr
from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.extensions import load_extension
from asreview.settings import ReviewSettings
from asreview.simulation.simulate import Simulate
from asreview.state.contextmanager import open_state


def _run_model_start(project):
    with open_state(project) as s:
        if not s.exist_new_labeled_records:
            return

        if s.get_results_table("label")["label"].value_counts().shape[0] < 2:
            return

    try:
        lock = FileLock(Path(project.project_path, "training.lock"), timeout=0)

        settings = ReviewSettings().from_file(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            )
        )

        with lock:
            as_data = project.read_data()

            feature_model = load_extension(
                "models.feature_extraction", settings.feature_extraction
            )()
            try:
                fm = project.get_feature_matrix(feature_model)
            except FileNotFoundError:
                fm = feature_model.fit_transform(
                    as_data.texts, as_data.title, as_data.abstract, as_data.keywords
                )
                project.add_feature_matrix(fm, feature_model)

            with open_state(project) as state:
                labeled = state.get_results_table(columns=["record_id", "label"])

            y_input = (
                pd.DataFrame({"record_id": as_data.record_ids})
                .merge(labeled, how="left", on="record_id")["label"]
                .fillna(LABEL_NA)
            )

            balance_model = load_extension(
                "models.balance", settings.balance_strategy
            )()
            X_train, y_train = balance_model.sample(
                fm, y_input, labeled["record_id"].values
            )

            classifier = load_extension("models.classifiers", settings.classifier)()
            classifier.fit(X_train, y_train)
            relevance_scores = classifier.predict_proba(fm)

            query_strategy = load_extension("models.query", settings.query_strategy)()
            ranked_record_ids = query_strategy.query(
                feature_matrix=fm, relevance_scores=relevance_scores
            )

            with open_state(project) as state:
                state.add_last_ranking(
                    ranked_record_ids,
                    classifier.name,
                    query_strategy.name,
                    balance_model.name,
                    feature_model.name,
                    len(labeled),
                )

            project.remove_review_error()

    except Timeout:
        logging.debug("Another iteration is training")

    except Exception as err:
        project.set_review_error(err)
        raise err


def _simulate_start(project):
    as_data = project.read_data()

    settings = ReviewSettings().from_file(
        Path(
            project.project_path,
            "reviews",
            project.reviews[0]["id"],
            "settings_metadata.json",
        )
    )

    with open_state(project) as state:
        priors = state.get_priors()["record_id"].tolist()

    feature_model = load_extension(
        "models.feature_extraction", settings.feature_extraction
    )()
    fm = feature_model.fit_transform(
        as_data.texts, as_data.title, as_data.abstract, as_data.keywords
    )
    project.add_feature_matrix(fm, feature_model)

    sim = Simulate(
        fm,
        labels=as_data.labels,
        classifier=load_extension("models.classifiers", settings.classifier)(),
        query_strategy=load_extension("models.query", settings.query_strategy)(),
        balance_strategy=load_extension("models.balance", settings.balance_strategy)(),
        feature_extraction=feature_model,
    )
    try:
        sim.label(priors, prior=True)
        sim.review()
    except Exception as err:
        project.set_review_error(err)
        raise err

    project.update_review(state=sim, status="finished")


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("project", type=asr.Project, help="Project path")
    args = parser.parse_args(argv)

    if args.project.config["mode"] == PROJECT_MODE_SIMULATE:
        _simulate_start(args.project)
    else:
        _run_model_start(args.project)
