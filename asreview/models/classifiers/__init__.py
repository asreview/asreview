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

"""Machine learning classifiers to classify the documents.

There are several machine learning classifiers available. In configuration
files, parameters are found under the section ``[model_param]``.
"""

from . import base
from .utils import get_classifier
from .utils import list_classifiers
from .nb import NaiveBayesClassifier
from .logistic import LogisticClassifier
from .lstm_base import LSTMBaseClassifier
from .lstm_pool import LSTMPoolClassifier
from .nb import NaiveBayesClassifier
from .nn_2_layer import NN2LayerClassifier
from .rf import RandomForestClassifier
from .svm import SVMClassifier
from .utils import get_classifier
from .utils import get_classifier_class
from .utils import list_classifiers


__all__ = [
    "base",
    "get_classifier_class",
    "get_classifier",
    "get_classifier",
    "list_classifiers",
    "list_classifiers",
    "logistic",
    "LogisticClassifier",
    "lstm_base",
    "lstm_pool",
    "LSTMBaseClassifier",
    "LSTMPoolClassifier",
    "NaiveBayesClassifier",
    "NaiveBayesClassifier",
    "nb",
    "nn_2_layer",
    "NN2LayerClassifier",
    "RandomForestClassifier",
    "rf",
    "svm",
    "SVMClassifier",
    "utils"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
for _item in __all__:
    assert _item in dir(), f"__all__ includes unknown item {_item} in {__package__}"
del _item
