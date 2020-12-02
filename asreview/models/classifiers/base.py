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

from asreview.models.base import BaseModel


class BaseTrainClassifier(BaseModel):
    """
    Base model, abstract class to be implemented by derived ones.

    All the non-abstract methods are okay if they are not implemented.
    All functions dealing with hyperparameters can be ignore if you don't
    use hyperopt for hyperparameter tuning.
    There is a distinction between model parameters, which are needed during
    model creation and fit parameters, which are used during the fitting
    process. Fit parameters can be distinct from fit_kwargs (which are passed
    to the fit function).
    """

    name = "base-train"

    def __init__(self):
        self._model = None

    def fit(self, X, y):
        """Fit the model to the data.

        Arguments
        ---------
        X: numpy.ndarray
            Feature matrix to fit.
        y: numpy.ndarray
            Labels for supervised learning.
        """
        return self._model.fit(X, y)

    def predict_proba(self, X):
        """Get the inclusion probability for each sample.

        Arguments
        ---------
        X: numpy.ndarray
            Feature matrix to predict.

        Returns
        -------
        numpy.ndarray
            Array with the probabilities for each class, with two
            columns (class 0, and class 1) and the number of samples rows.
        """
        return self._model.predict_proba(X)

    def full_hyper_space(self):
        """Get a hyperparameter space to use with hyperopt.

        Returns
        -------
        dict, dict
            Parameter space. Parameter choices; in case of hyperparameters
            with a list of choices, store the choices there.
        """
        return {}, {}
