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

from asreview.utils import model_class_from_entry_point


def get_model_class(method):
    """Get class of model from string.

    Arguments
    ---------
    method: str
        Name of the model, e.g. 'svm', 'nb' or 'lstm-pool'.

    Returns
    -------
    BaseModel:
        Class corresponding to the method.
    """
    return model_class_from_entry_point(method, "asreview.models")


def get_model(method, *args, random_state=None, **kwargs):
    """Get an instance of a model from a string.

    Arguments
    ---------
    method: str
        Name of the model.
    *args:
        Arguments for the model.
    **kwargs:
        Keyword arguments for the model.
    """
    model_class = get_model_class(method)
    try:
        return model_class(*args, random_state=random_state, **kwargs)
    except TypeError:
        return model_class(*args, **kwargs)
