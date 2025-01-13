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
from asreview.models.query import TopDownQuery
from asreview.stopping import StoppingIsFittable


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

        labeled = s.get_results_table(columns=["record_id", "label"])

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

        if settings.balance_strategy is not None:
            balance_model = load_extension(
                "models.balance", settings.balance_strategy
            )()
        else:
            balance_model = None

        try:
            fm = project.get_feature_matrix(feature_model.name)
        except ValueError:
            fm = feature_model.fit_transform(project.data_store.get_df())
            project.add_feature_matrix(fm, feature_model.name)

        learner = asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", settings.query_strategy)(),
            classifier=load_extension("models.classifiers", settings.classifier)(),
            balance_strategy=balance_model,
            feature_extraction=None,  # directly from the feature matrix
        )

        learner.fit(
            fm[labeled["record_id"].values],
            labeled["label"].values,
        )

        ranked_record_ids = learner.rank(fm)

        with open_state(project) as state:
            state.add_last_ranking(
                ranked_record_ids,
                learner.classifier.name,
                learner.query_strategy.name,
                learner.balance_strategy.name
                if learner.balance_strategy is not None
                else None,
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

    learners = [
        asr.ActiveLearningCycle(
            query_strategy=TopDownQuery(),
            stopping=StoppingIsFittable(),
        ),
        asr.ActiveLearningCycle(
            query_strategy=load_extension("models.query", settings.query_strategy)(),
            classifier=load_extension("models.classifiers", settings.classifier)(),
            balance_strategy=load_extension(
                "models.balance", settings.balance_strategy
            )(),
            feature_extraction=load_extension(
                "models.feature_extraction", settings.feature_extraction
            )(),
        ),
    ]

    sim = Simulate(
        project.data_store.get_df(), project.data_store["included"], learners
    )
    try:
        sim.label(priors)
        sim.review()
    except Exception as err:
        project.set_review_error(err)
        raise err

    project.update_review(state=sim, status="finished")
