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

from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer

from asreview.models.base import BaseModel


class SKLearnModel(BaseModel):
    "Base SKLearn model."
    def __init__(self, param={}, **kwargs):
        super(SKLearnModel, self).__init__(param)
        self.name = "sklearn"

    def get_Xy(self, texts, labels):
        text_clf = Pipeline([('vect', CountVectorizer()),
                             ('tfidf', TfidfTransformer())])

        X = text_clf.fit_transform(texts)
        y = labels
        return X, y


def create_nb_model(*args, **kwargs):
    """Return callable NaiveBayes model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """

    model = MultinomialNB(*args, **kwargs)
    logging.debug(model)

    return model


class NBModel(SKLearnModel):
    "Naive Bayes SKLearn model."
    def __init__(self, param={}, **kwargs):
        super(NBModel, self).__init__(param, **kwargs)
        self.name = "nb"

    def model(self):
        model = create_nb_model(**self.model_param())
        return model

    def default_param(self):
        kwargs = {
            "alpha": 3.822,
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "mdl_alpha": hp.lognormal("mdl_alpha", 0, 2),
        }
        return hyper_space, hyper_choices


def create_svc_model(*args, gamma="scale", class_weight=None, **kwargs):
    """Return callable SVM model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """
    if class_weight is not None:
        class_weight = {
            0: 1,
            1: class_weight,
        }

    model = SVC(*args, gamma=gamma, class_weight=class_weight,
                probability=True, **kwargs)
    logging.debug(model)

    return model


class SVCModel(SKLearnModel):
    "Support Vector Machine SKLearn model."
    def __init__(self, param={}, random_state=None, **kwargs):
        super(SVCModel, self).__init__(param, **kwargs)
        self.param["random_state"] = random_state
        self.name = "svm"

    def model(self):
        model = create_svc_model(**self.model_param())
        return model

    def default_param(self):
        kwargs = {
            "gamma": "auto",
            "class_weight": 0.249,
            "C": 15.4,
            "kernel": "sigmoid",
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {
            "mdl_gamma": ["auto", "scale"],
            "mdl_kernel": ["linear", "sigmoid", "rbf", "poly"]
        }

        hyper_space = {
            "mdl_gamma": hp.choice('mdl_gamma', hyper_choices["mdl_gamma"]),
            "mdl_kernel": hp.choice('mdl_kernel', hyper_choices["mdl_kernel"]),
            "mdl_C": hp.lognormal('mdl_C', 0, 2),
            "mdl_class_weight": hp.lognormal('mdl_class_weight', 0, 1)
        }
        return hyper_space, hyper_choices
