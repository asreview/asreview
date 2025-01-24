# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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
from asreview.models.query import TopDownQuery
from asreview.simulation.simulate import Simulate
from asreview.state.contextmanager import open_state
from asreview.stopping import StoppingIsFittable
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

        labeled = s.get_results_table(columns=["record_id", "label"])

    try:
        learner = asr.ActiveLearningCycle.from_file(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            )
        )
        try:
            fm = project.get_feature_matrix(learner.feature_extraction.name)
        except ValueError:
            fm = learner.transform(project.data_store.get_df())
            project.add_feature_matrix(fm, learner.feature_extraction.name)

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
                learner.feature_extraction.name,
                len(labeled),
            )

        project.remove_review_error()

    except Exception as err:
        project.set_review_error(err)
        raise err


def run_simulation(project):
    learner = asr.ActiveLearningCycle.from_file(
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
        learner,
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
