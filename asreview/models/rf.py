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

from asreview.models.base import BaseModel
from sklearn.ensemble import RandomForestClassifier


class RFModel(BaseModel):
    "Random Forest SKLearn model."
    name = "rf"

    def __init__(self, n_estimators=100, max_features=10, class_weight=1.0,
                 random_state=None):
        super(RFModel, self).__init__()
        if class_weight is not None:
            class_weight = {
                0: 1,
                1: class_weight,
            }

        self._model = RandomForestClassifier(
            n_estimators=int(n_estimators), max_features=int(max_features),
            class_weight=class_weight, random_state=random_state)

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_n_estimators": hp.quniform("mdl_n_estimators", 10, 100, 1),
            "mdl_max_features": hp.quniform("mdl_max_features", 6, 10, 1),
            "mdl_class_weight": hp.lognormal('mdl_class_weight', 0, 1),
        }
        return hyper_space, hyper_choices
