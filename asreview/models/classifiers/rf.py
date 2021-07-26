# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

from sklearn.ensemble import RandomForestClassifier as SKRandomForestClassifier

from asreview.models.classifiers.base import BaseTrainClassifier
from asreview.utils import _set_class_weight


class RandomForestClassifier(BaseTrainClassifier):
    """
    Random forest classifier.

    The Random Forest classifier is an implementation based
    on the sklearn Random Forest classifier.

    Arguments
    ---------
    n_estimators : int, default=100
        The number of trees in the forest.
    max_features: int, default=10
        Number of features in the model.
    class_weight: float, default=1.0
        Class weight of the inclusions.
    random_state : int or RandomState, default=None
        Controls both the randomness of the bootstrapping of the samples used
        when building trees and the sampling of the features to consider when
        looking for the best split at each node.
    """
    name = "rf"
    label = "Random forest"

    def __init__(self,
                 n_estimators=100,
                 max_features=10,
                 class_weight=1.0,
                 random_state=None):

        super(RandomForestClassifier, self).__init__()
        self.n_estimators = int(n_estimators)
        self.max_features = int(max_features)
        self.class_weight = class_weight
        self._random_state = random_state

        self._model = SKRandomForestClassifier(
            n_estimators=self.n_estimators,
            max_features=self.max_features,
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
