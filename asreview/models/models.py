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
        # ELAS u4 is the default model for this version ASReview LAB. The model
        # parameters have been optimized on the SYNERGY dataset. After expert
        # elicitation, the model and parameters have been chosen.
        # Optimization setup: https://github.com/asreview/asreview-optuna/releases/tag/ASReview2_0b4-nb-tfidf-full-1
        "name": "elas_u4",
        "label": "ELAS u4",
        "type": "ultra",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="svm",
            classifier_param={"loss": "squared_hinge", "C": 0.11},
            balancer="balanced",
            balancer_param={"ratio": 9.8},
            feature_extractor="tfidf",
            feature_extractor_param={
                "ngram_range": (1, 2),
                "sublinear_tf": True,
                "min_df": 1,
                "max_df": 0.95,
            },
        ),
    },
    {
        # ELAS u3 mimics the performance of ASReview LAB version 1. The model
        # has an updated and optimized balancer, as "double" balance has been
        # deprecated in this version of ASReview LAB.
        "name": "elas_u3",
        "label": "ELAS u3",
        "type": "ultra",
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="nb",
            classifier_param={"alpha": 3.822},
            balancer="balanced",
            balancer_param={"ratio": 1.2},
            feature_extractor="tfidf",
            feature_extractor_param={"stop_words": "english"},
        ),
    },
    # ELAS u2 refers to the model that was used in the ASReview LAB version 1. The
    # model is not available in the current version of ASReview LAB.
    # ELAS u1 refers to the model that was used in the ASReview LAB version 0. The
    # model is not available in the current version of ASReview LAB.
    {
        # ELAS l2 is the multilingual model for this version ASReview LAB. The model
        # parameters have been optimized on the SYNERGY dataset. After expert
        # elicitation, the model and parameters have been chosen.
        # Optimization setup: https://github.com/asreview/asreview-optuna/releases/tag/ASReview2_0b4-svm-e5-full-1
        "name": "elas_l2",
        "label": "ELAS l2",
        "type": "lang",
        "extensions": ["asreview-dory"],
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="svm",
            classifier_param={"loss": "squared_hinge", "C": 0.106, "max_iter": 5000},
            balancer="balanced",
            balancer_param={"ratio": 9.707},
            feature_extractor="multilingual-e5-large",
            feature_extractor_param={"normalize": True},
        ),
    },
    {
        # ELAS h3 is the heavy model for this version ASReview LAB. The model
        # parameters have been optimized on the SYNERGY dataset. After expert
        # elicitation, the model and parameters have been chosen.
        # Optimization setup: https://github.com/asreview/asreview-optuna/releases/tag/ASReview2_0b4-svm-mxbai-full-1
        "name": "elas_h3",
        "label": "ELAS h3",
        "type": "heavy",
        "extensions": ["asreview-dory"],
        "value": ActiveLearningCycleData(
            querier="max",
            classifier="svm",
            classifier_param={"loss": "squared_hinge", "C": 0.067, "max_iter": 5000},
            balancer="balanced",
            balancer_param={"ratio": 9.724},
            feature_extractor="mxbai",
            feature_extractor_param={"normalize": True},
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
