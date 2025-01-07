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

__all__ = ["BaseClassifier"]

from asreview.models.base import BaseModel


class BaseClassifier(BaseModel):
    """
    Base model, abstract class to be implemented by derived ones.

    All the non-abstract methods are okay if they are not implemented.
    There is a distinction between model parameters, which are needed during
    model creation and fit parameters, which are used during the fitting
    process. Fit parameters can be distinct from fit_kwargs (which are passed
    to the fit function).
    """

    def __init__(self):
        self._model = None

    def fit(self, X, y, sample_weight=None):
        """Fit the model to the data.

        Parameters
        ----------
        X: numpy.ndarray
            Feature matrix to fit.
        y: numpy.ndarray
            Labels for supervised learning.
        """
        return self._model.fit(X, y, sample_weight=sample_weight)

    def predict_proba(self, X):
        """Get the inclusion probability for each sample.

        Parameters
        ----------
        X: numpy.ndarray
            Feature matrix to predict.

        Returns
        -------
        numpy.ndarray
            Array with the probabilities for each class, with two
            columns (class 0, and class 1) and the number of samples rows.
        """

        try:
            return self._model.predict_proba(X)
        except AttributeError:
            raise AttributeError("predict_proba does not exist")

    def decision_function(self, X):
        """Get the decision function for each sample.

        Parameters
        ----------
        X: numpy.ndarray
            Feature matrix to predict.

        Returns
        -------
        numpy.ndarray
            Array with the decision function for each sample.
        """
        try:
            return self._model.decision_function(X)
        except AttributeError:
            raise AttributeError("decision_function does not exist")
