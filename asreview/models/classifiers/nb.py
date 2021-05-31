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

import logging

from sklearn.naive_bayes import MultinomialNB

from asreview.models.classifiers.base import BaseTrainClassifier


class NaiveBayesClassifier(BaseTrainClassifier):
    """Naive Bayes classifier.

    Naive Bayes classifier. Only works in combination with the
    :class:`asreview.models.feature_extraction.Tfidf` feature extraction model.
    Though relatively simplistic, seems to work quite well on a wide range of
    datasets.

    The naive Bayes classifier is an implementation based
    on the sklearn multinomial naive Bayes classifier.

    Arguments
    ---------
    alpha : float, default=3.822
        Additive (Laplace/Lidstone) smoothing parameter
        (0 for no smoothing).
    """

    name = "nb"
    label = "Naive Bayes"

    def __init__(self, alpha=3.822):

        super(NaiveBayesClassifier, self).__init__()
        self.alpha = alpha
        self._model = MultinomialNB(alpha=alpha)
        logging.debug(self._model)

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_alpha": hp.lognormal("mdl_alpha", 0, 1),
        }
        return hyper_space, hyper_choices
