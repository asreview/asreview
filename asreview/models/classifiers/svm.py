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

__all__ = ["SVMClassifier"]

from sklearn.svm import SVC

from asreview.models.classifiers.base import BaseTrainClassifier


class SVMClassifier(BaseTrainClassifier):
    """
    Support vector machine classifier (``svm``).

    The Support Vector Machine classifier is an implementation based
    on the sklearn Support Vector Machine classifier.

    Parameters
    ----------
    gamma: str
        Gamma parameter of the SVM model.
    class_weight: float
        class_weight of the inclusions.
    C: float
        C parameter of the SVM model.
    kernel: str
        SVM kernel type.
    random_state: int, asreview.utils.SeededRandomState
        State of the RNG.
    """

    name = "svm"
    label = "Support vector machine"

    def __init__(
        self,
        gamma="auto",
        C=15.4,
        kernel="linear",
        random_state=None,
    ):
        super().__init__()
        self.gamma = gamma
        self.C = C
        self.kernel = kernel

        self._model = SVC(
            kernel=kernel,
            C=C,
            gamma=gamma,
            probability=True,
            random_state=random_state,
        )
