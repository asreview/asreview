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

from asreview.lib.models.classifiers.logistic import LogisticClassifier
from asreview.lib.models.classifiers.lstm_base import LSTMBaseClassifier
from asreview.lib.models.classifiers.lstm_pool import LSTMPoolClassifier
from asreview.lib.models.classifiers.nb import NaiveBayesClassifier
from asreview.lib.models.classifiers.nn_2_layer import NN2LayerClassifier
from asreview.lib.models.classifiers.rf import RandomForestClassifier
from asreview.lib.models.classifiers.svm import SVMClassifier
from asreview.lib.models.classifiers.utils import get_classifier
from asreview.lib.models.classifiers.utils import get_classifier_class
from asreview.lib.models.classifiers.utils import list_classifiers as _list_classifiers    # NOQA

"""Active learning model components.

Components like classifiers, query strategies, balance strategies, and
feature_extraction techniques."""
