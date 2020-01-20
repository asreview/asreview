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

import logging

from sklearn.linear_model import LogisticRegression

from asreview.models.base import BaseTrainModel


class LogisticModel(BaseTrainModel):
    "Logistic Regression SKLearn model."
    name = "logistic"

    def __init__(self, C=1.0, class_weight=None, n_jobs=1):
        """Initialize the SKLearn Naive Bayes model.

        Arguments:
        ----------
        alpha: float
            Parameter to set the regularization strength of the model.
        """
        super(LogisticModel, self).__init__()
        if class_weight is not None:
            class_weight = {
                0: 1,
                1: class_weight,
            }
        self.C = C
        self.class_weight = class_weight
        self.n_jobs = n_jobs
        self._model = LogisticRegression(C=C, class_weight=class_weight,
                                         n_jobs=n_jobs)
        logging.debug(self._model)

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_C": hp.lognormal("mdl_C", 0, 1),
            "mdl_class_weight": hp.lognormal("mdl_class_weight", 0, 1),
        }
        return hyper_space, hyper_choices
