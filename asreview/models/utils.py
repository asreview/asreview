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


def get_model_class(method):
    "Get class of model from string."
    from asreview.models.dense_nn import DenseNNModel
    from asreview.models.svm import SVMModel
    from asreview.models.nb import NBModel
    from asreview.models.rf import RFModel
    models = {
        "svm": SVMModel,
        "nb": NBModel,
        "rf": RFModel,
        "dense_nn": DenseNNModel
    }
    try:
        return models[method]
    except KeyError:
        raise ValueError(f"Error: training method '{method}' is not implemented.")


def get_model(method, *args, **kwargs):
    model_class = get_model_class(method)
    return model_class(*args, **kwargs)
