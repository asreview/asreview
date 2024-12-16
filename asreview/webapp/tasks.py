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

from pathlib import Path

import asreview as asr
from asreview.extensions import load_extension
from asreview.settings import ReviewSettings
from asreview.simulation.simulate import Simulate
from asreview.state.contextmanager import open_state
from asreview.webapp.utils import get_project_path


def run_task(project_id, simulation=False):
    project_path = get_project_path(project_id)
    project = asr.Project(project_path, project_id=project_id)

    if simulation:
        run_simulation(project)
    else:
        run_model(project)

    return True


def run_model(project):
    with open_state(project) as s:
        if not s.exist_new_labeled_records:
            return

        if s.get_results_table("label")["label"].value_counts().shape[0] < 2:
            return

    try:
        settings = ReviewSettings.from_file(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            )
        )

        feature_model = load_extension(
            "models.feature_extraction", settings.feature_extraction
        )()
        try:
            fm = project.get_feature_matrix(feature_model)
        except FileNotFoundError:
            fm = feature_model.from_data_store(project.data_store)
            project.add_feature_matrix(fm, feature_model)

        with open_state(project) as state:
            labeled = state.get_results_table(columns=["record_id", "label"])

            if settings.balance_strategy is not None:
                balance_model = load_extension(
                    "models.balance", settings.balance_strategy
                )()
                balance_model_name = balance_model.name
                sample_weight = balance_model.compute_sample_weight(
                    labeled["label"].values
                )
            else:
                sample_weight = None
                balance_model_name = None

            classifier = load_extension("models.classifiers", settings.classifier)()
            classifier.fit(
                fm[labeled["record_id"].values],
                labeled["label"].values,
                sample_weight=sample_weight,
            )
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
                balance_model_name,
                feature_model.name,
                len(labeled),
            )

        project.remove_review_error()

    except Exception as err:
        project.set_review_error(err)
        raise err


def run_simulation(project):
    settings = ReviewSettings.from_file(
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
    fm = feature_model.from_data_store(project.data_store)
    project.add_feature_matrix(fm, feature_model)

    if settings.balance_strategy is not None:
        balance_model = load_extension("models.balance", settings.balance_strategy)()
    else:
        balance_model = None

    sim = Simulate(
        fm,
        labels=project.data_store["included"],
        classifier=load_extension("models.classifiers", settings.classifier)(),
        query_strategy=load_extension("models.query", settings.query_strategy)(),
        balance_strategy=balance_model,
        feature_extraction=feature_model,
    )
    try:
        sim.label(priors, prior=True)
        sim.review()
    except Exception as err:
        project.set_review_error(err)
        raise err

    project.update_review(state=sim, status="finished")
