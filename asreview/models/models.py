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

MODELS_CONFIG = [
    {
        "name": "elas_u4",
        "label": "ELAS u4",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            balancer="balanced",
            feature_extractor="tfidf",
        ),
    }
]

DEFAULT_MODEL_NAME = "elas_u4"


def get_model_config(name=None):
    """Get the model configuration.

    Parameters
    ----------
    name: str
        The name of the model configuration. If None, the default model
        configuration is returned.

    Returns
    -------
    dict:
        The default model configuration.
    """

    if name is None:
        name = DEFAULT_MODEL_NAME

    for model_config in MODELS_CONFIG:
        if model_config["name"] == name:
            return model_config["value"]

    return None
