# Copyright 2019 The ASReview Authors. All Rights Reserved.
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
'''Deprecated, will be removed in the future.'''

import warnings

from asreview.models.classifiers import NBModel as _NBModel
from asreview.models.classifiers import RFModel as _RFModel
from asreview.models.classifiers import SVMModel as _SVMModel
from asreview.models.classifiers import LogisticModel as _LogisticModel
from asreview.models.classifiers import LSTMBaseModel as _LSTMBaseModel
from asreview.models.classifiers import LSTMPoolModel as _LSTMPoolModel
from asreview.models.classifiers import NN2LayerModel as _NN2LayerModel
from asreview.models.classifiers import get_classifier
from asreview.models.classifiers import get_classifier_class
from asreview.models.classifiers import list_classifiers as _list_classifiers


class NBModel(_NBModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.NBModel has moved to "
            "asreview.models.classifiers.NBModel",
            FutureWarning,
            2)


class RFModel(_RFModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.RFModel has moved to "
            "asreview.models.classifiers.RFModel",
            FutureWarning,
            2)


class SVMModel(_SVMModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.SVMModel has moved to "
            "asreview.models.classifiers.SVMModel",
            FutureWarning,
            2)


class LogisticModel(_LogisticModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.LogisticModel has moved to "
            "asreview.models.classifiers.LogisticModel",
            FutureWarning,
            2)


class LSTMBaseModel(_LSTMBaseModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.LSTMBaseModel has moved to "
            "asreview.models.classifiers.LSTMBaseModel",
            FutureWarning,
            2)


class LSTMPoolModel(_LSTMPoolModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.LSTMPoolModel has moved to "
            "asreview.models.classifiers.LSTMPoolModel",
            FutureWarning,
            2)


class NN2LayerModel(_NN2LayerModel):
    def __init_subclass__(self):
        warnings.warn(
            "asreview.models.NN2LayerModel has moved to "
            "asreview.models.classifiers.NN2LayerModel",
            FutureWarning,
            2)


def get_model(*args, **kwargs):
    warnings.warn(
        "asreview.models.get_model has moved to "
        "asreview.models.classifiers.get_classifier",
        FutureWarning,
        2
    )
    return get_classifier(*args, **kwargs)


def get_model_class(*args, **kwargs):
    warnings.warn(
        "asreview.models.get_model_class has moved to "
        "asreview.models.classifiers.get_classifier_class",
        FutureWarning,
        2
    )
    return get_classifier_class(*args, **kwargs)


def list_classifiers(*args, **kwargs):
    warnings.warn(
        "asreview.models.list_classifiers has moved to "
        "asreview.models.classifiers.list_classifiers",
        FutureWarning,
        2
    )
    return _list_classifiers(*args, **kwargs)
