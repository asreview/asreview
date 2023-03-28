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

import logging

from asreview.utils import _model_class_from_entry_point
from asreview.utils import list_model_names


def _set_class_weight(weight1):
    """Used various classifiers to have quicker learning."""
    if weight1 is None:
        return None
    weight0 = 1.0
    cw_class = {
        0: weight0,
        1: weight1,
    }
    logging.debug(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")
    return cw_class


def list_classifiers():
    """List available classifier classes.

    Returns
    -------
    list:
        Classes of available classifiers in alphabetical order.
    """
    model_class = [
        get_classifier_class(name)
        for name in list_model_names(entry_name="asreview.models.classifiers")
    ]

    return model_class


def get_classifier_class(name):
    """Get class of model from string.

    Arguments
    ---------
    name: str
        Name of the model, e.g. 'svm', 'nb' or 'lstm-pool'.

    Returns
    -------
    BaseModel:
        Class corresponding to the name.
    """
    return _model_class_from_entry_point(name, "asreview.models.classifiers")


def get_classifier(name, *args, random_state=None, **kwargs):
    """Get an instance of a model from a string.

    Arguments
    ---------
    name: str
        Name of the model.
    *args:
        Arguments for the model.
    **kwargs:
        Keyword arguments for the model.

    Returns
    -------
    BaseFeatureExtraction:
        Initialized instance of classifier.
    """
    model_class = get_classifier_class(name)
    try:
        return model_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return model_class(*args, **kwargs)
