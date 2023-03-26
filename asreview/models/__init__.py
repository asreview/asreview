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

"""Active learning model components.

Components like classifiers, query strategies, balance strategies, and
feature_extraction techniques."""

from . import balance
from . import classifiers
from . import feature_extraction
from . import query
from . import base
from .classifiers.logistic import LogisticClassifier
from .classifiers.lstm_base import LSTMBaseClassifier
from .classifiers.lstm_pool import LSTMPoolClassifier
from .classifiers.nb import NaiveBayesClassifier
from .classifiers.nn_2_layer import NN2LayerClassifier
from .classifiers.rf import RandomForestClassifier
from .classifiers.svm import SVMClassifier
from .classifiers.utils import get_classifier
from .classifiers.utils import get_classifier_class
from .classifiers.utils import list_classifiers as _list_classifiers

__all__ = [
    "base",
    "balance",
    "classifiers",
    "feature_extraction",
    "query",
    "LogisticClassifier",
    "LSTMBaseClassifier",
    "LSTMPoolClassifier",
    "NaiveBayesClassifier",
    "NN2LayerClassifier",
    "RandomForestClassifier",
    "SVMClassifier",
    "get_classifier",
    "get_classifier_class",
    "_list_classifiers"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
for _item in __all__:
    assert _item in dir(), f"__all__ includes unknown item {_item} in {__package__}"
del _item
