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

from asreview.utils import list_model_names
from asreview.utils import _model_class_from_entry_point


def list_feature_extraction():
    """List available feature extraction method classes.

    Returns
    -------
    list:
        Classes of available feature extraction methods in alphabetical order.
    """
    model_class = [
        get_feature_class(name)
        for name in list_model_names(entry_name="asreview.models.feature_extraction")
    ]

    return model_class


def get_feature_class(name):
    """Get class of feature extraction from string.

    Arguments
    ---------
    name: str
        Name of the feature model, e.g. 'doc2vec', 'tfidf' or 'embedding-lstm'.

    Returns
    -------
    BaseFeatureExtraction:
        Class corresponding to the name.
    """
    return _model_class_from_entry_point(name, "asreview.models.feature_extraction")


def get_feature_model(name, *args, random_state=None, **kwargs):
    """Get an instance of a feature extraction model from a string.

    Arguments
    ---------
    name: str
        Name of the feature extraction model.
    *args:
        Arguments for the feature extraction model.
    **kwargs:
        Keyword arguments for thefeature extraction  model.

    Returns
    -------
    BaseFeatureExtraction:
        Initialized instance of feature extraction algorithm.
    """
    model_class = get_feature_class(name)
    try:
        return model_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return model_class(*args, **kwargs)
