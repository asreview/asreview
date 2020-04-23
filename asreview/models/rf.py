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

from sklearn.ensemble import RandomForestClassifier

from asreview.models.base import BaseTrainModel
from asreview.utils import _set_class_weight


class RFModel(BaseTrainModel):
    "Random Forest SKLearn model."
    name = "rf"

    def __init__(self, n_estimators=100, max_features=10, class_weight=1.0,
                 random_state=None):
        """Initialize the SKLearn Random Forest model.

        Arguments
        ---------
        n_estimators: int
            Number of estimators.
        max_features: int
            Number of features in the model.
        class_weight: float
            Class weight of the inclusions.
        random_state: int, RandomState
            Set the random state of the RNG.
        """
        super(RFModel, self).__init__()
        self.n_estimators = int(n_estimators)
        self.max_features = int(max_features)
        self.class_weight = class_weight
        self._random_state = random_state

        self._model = RandomForestClassifier(
            n_estimators=self.n_estimators, max_features=self.max_features,
            class_weight=_set_class_weight(class_weight),
            random_state=random_state)

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_n_estimators": hp.quniform("mdl_n_estimators", 10, 100, 1),
            "mdl_max_features": hp.quniform("mdl_max_features", 6, 10, 1),
            "mdl_class_weight": hp.lognormal('mdl_class_weight', 0, 1),
        }
        return hyper_space, hyper_choices
