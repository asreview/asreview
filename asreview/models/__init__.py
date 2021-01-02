# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

# import deprecated models for backwards compatibility
from asreview.models.deprecated import _moved_warning

from asreview.models.classifiers.nb import NaiveBayesClassifier
from asreview.models.classifiers.rf import RandomForestClassifier
from asreview.models.classifiers.svm import SVMClassifier
from asreview.models.classifiers.logistic import LogisticClassifier
from asreview.models.classifiers.lstm_base import LSTMBaseClassifier
from asreview.models.classifiers.lstm_pool import LSTMPoolClassifier
from asreview.models.classifiers.nn_2_layer import NN2LayerClassifier
from asreview.models.classifiers.utils import get_classifier
from asreview.models.classifiers.utils import get_classifier_class
from asreview.models.classifiers.utils import list_classifiers as _list_classifiers

NBModel = _moved_warning(
    NaiveBayesClassifier, "asreview.models.classifiers.NaiveBayesClassifier",
    "asreview.models.NBModel")
RFModel = _moved_warning(
    RandomForestClassifier, "asreview.models.classifiers.RandomForestClassifier",
    "asreview.models.RFModel")
SVMModel = _moved_warning(
    SVMClassifier, "asreview.models.classifiers.SVMClassifier",
    "asreview.models.SVMModel")
LogisticModel = _moved_warning(
    LogisticClassifier, "asreview.models.classifiers.LogisticClassifier",
    "asreview.models.LogisticModel")
LSTMBaseModel = _moved_warning(
    LSTMBaseClassifier, "asreview.models.classifiers.LSTMBaseClassifier",
    "asreview.models.LSTMBaseModel")
LSTMPoolModel = _moved_warning(
    LSTMPoolClassifier, "asreview.models.classifiers.LSTMPoolClassifier",
    "asreview.models.LSTMPoolModel")
NN2LayerModel = _moved_warning(
    NN2LayerClassifier, "asreview.models.classifiers.NN2LayerClassifier",
    "asreview.models.NN2LayerModel")
get_model = _moved_warning(
    get_classifier, "asreview.models.classifiers.get_classifier",
    "asreview.models.get_model")
get_model_class = _moved_warning(
    get_classifier_class, "asreview.models.classifiers.get_classifier_class",
    "asreview.models.get_model_class")
list_classifiers = _moved_warning(
    _list_classifiers, "asreview.models.classifiers.list_classifiers",
    "asreview.models.list_classifiers")
"""Active learning model components.

Components like classifiers, query strategies, balance strategies, and
feature_extraction techniques."""
