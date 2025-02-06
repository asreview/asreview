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

from asreview.learner import ActiveLearningCycleData

AI_MODEL_CONFIGURATIONS = [
    {
        "name": "elas_u4",
        "label": "ELAS u4",
        "type": "ultra",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    },
    {
        "name": "elas_u3",
        "label": "ELAS u3",
        "type": "ultra",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    },
    {
        "name": "elas_l2",
        "label": "ELAS l2",
        "type": "lang",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    },
    {
        "name": "elas_h3",
        "label": "ELAS h3",
        "type": "heavy",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    },
    {
        "name": "elas_h2",
        "label": "ELAS h2",
        "type": "heavy",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    },
]


def get_ai_config(name=None):
    """Get the AI configuration.

    Parameters
    ----------
    name: str
        The name of the AI configuration. If None, the default AI
        configuration is returned.

    Returns
    -------
    dict:
        The default AI configuration.
    """

    if name is None:
        return filter(
            lambda x: x["type"] == "ultra", AI_MODEL_CONFIGURATIONS
        ).__next__()

    for model_config in AI_MODEL_CONFIGURATIONS:
        if model_config["name"] == name:
            return model_config

    raise ValueError(f"Model configuration {name} not found.")
