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

from sklearn.linear_model import LogisticRegression

from asreview.models.classifiers.base import BaseTrainClassifier
from asreview.models.classifiers.utils import _set_class_weight
from asreview.utils import SeededRandomState


class LogisticClassifier(BaseTrainClassifier):
    """
    Logistic regression classifier (``logistic``).

    The Logistic regressions classifier is an implementation based
    on the sklearn Logistic regressions classifier.

    Arguments
    ---------
    C: float
        Parameter inverse to the regularization strength of the model.
    class_weight: float
        Class weight of the inclusions.
    random_seed: int, SeededRandomState
        Integer used to seed random processes.
    n_jobs: int
        Number of CPU cores used.
    """

    name = "logistic"
    label = "Logistic regression"

    def __init__(self, C=1.0, class_weight=1.0, random_seed=None, n_jobs=1):
        super(LogisticClassifier, self).__init__()
        self.C = C
        self.class_weight = class_weight
        self.n_jobs = n_jobs
        self._random_state = SeededRandomState(random_seed)

        self._model = LogisticRegression(
            solver="liblinear",
            C=C,
            class_weight=_set_class_weight(class_weight),
            n_jobs=n_jobs,
            random_state=self._random_state,
        )
        logging.debug(self._model)

    @property
    def _settings(self):
        return {
            "C": self.C,
            "class_weight": self.class_weight,
            "n_jobs": self.n_jobs,
            "random_seed": self._random_state.random_seed,
        }

    def full_hyper_space(self):
        from hyperopt import hp

        hyper_choices = {}
        hyper_space = {
            "mdl_C": hp.lognormal("mdl_C", 0, 1),
            "mdl_class_weight": hp.lognormal("mdl_class_weight", 0, 1),
        }
        return hyper_space, hyper_choices
