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

"""Default model for ASReview environment."""

from asreview.models.balance import Balanced
from asreview.models.classifiers import NaiveBayesClassifier
from asreview.models.feature_extraction import Tfidf
from asreview.models.query import MaxQuery


def default_model():
    return {
        "classifier": "nb",
        "query_strategy": "max",
        "balance_strategy": "balanced",
        "feature_extraction": "tfidf",
        "classifier_param": NaiveBayesClassifier().get_params(),
        "query_param": MaxQuery().get_params(),
        "balance_param": Balanced().get_params(),
        "feature_param": Tfidf().get_params(),
    }
