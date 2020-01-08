# Copyright 2020 The ASReview Authors. All Rights Reserved.
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

import numpy as np
from tensorflow.keras.layers import Dense
from tensorflow.keras.models import Sequential
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.models.keras import _get_optimizer
from keras import regularizers
from asreview.models.base import BaseModel
from asreview.unsupervised import Doc2Vec
from asreview.utils import _set_class_weight


def create_dense_nn_model(vector_size=40,
                          dense_width=128,
                          optimizer='rmsprop',
                          learn_rate_mult=1.0,
                          regularization=0.01,
                          verbose=1):
    """Return callable lstm model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Keras Sklearn model when
        called.

    """
    def wrap_model():

        model = Sequential()

        model.add(
            Dense(
                dense_width,
                input_dim=vector_size,
                kernel_regularizer=regularizers.l2(regularization),
                activity_regularizer=regularizers.l1(regularization),
                activation='relu',
            )
        )

        # add Dense layer with relu activation
        model.add(
            Dense(
                dense_width,
                kernel_regularizer=regularizers.l2(regularization),
                activity_regularizer=regularizers.l1(regularization),
                activation='relu',
            )
        )

        # add Dense layer
        model.add(
            Dense(
                1,
                activation='sigmoid'
            )
        )

        optimizer_fn = _get_optimizer(optimizer, learn_rate_mult)

        # Compile model
        model.compile(
            loss='binary_crossentropy',
            optimizer=optimizer_fn, metrics=['acc'])

        if verbose == 1:
            model.summary()

        return model

    return wrap_model


class DenseNNModel(BaseModel):
    def __init__(self, param={}, **kwargs):
        super(DenseNNModel, self).__init__(param, **kwargs)
        self.name = "dense_nn"
        self.X = None
        self.y = None

    def model(self):
        model = create_dense_nn_model(**self.model_param())
        return KerasClassifier(model)

    def fit_kwargs(self):
        fit_kwargs = self.fit_param()
        class_weight_inc = fit_kwargs.pop('class_weight_inc', None)
        if class_weight_inc is not None:
            fit_kwargs['class_weight'] = _set_class_weight(class_weight_inc)
        return fit_kwargs

    def default_param(self):
        kwargs = {
            "vector_size": 40,
            "dense_width": 128,
            "optimizer": "rmsprop",
            "learn_rate_mult": 1.0,
            "verbose": 0,
            "epochs": 35,
            "batch_size": 32,
            "shuffle": False,
            "class_weight_inc": 30.0,
            "regularization": 0.01,
        }
        return kwargs

    def get_Xy(self, texts, labels):
        if self.X is None or self.y is None:
            d2v_model = Doc2Vec({"vector_size": int(self.param["vector_size"])})
            self.X = d2v_model.fit_transform(texts)
            self.y = labels
        return self.X, self.y

    def get_Xy_split(self, texts, titles, abstracts, labels):
        if self.X is None or self.y is None:
            d2v_model = Doc2Vec({"vector_size": int(self.param["vector_size"]/2)})
            d2v_model.fit(texts)
            X_title = d2v_model.transform(titles)
            X_abstract = d2v_model.transform(abstracts)
            self.X = np.concatenate((X_title, X_abstract), axis=1)
            self.y = labels
        return self.X, self.y

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {
            "mdl_optimizer": ["sgd", "rmsprop", "adagrad", "adam", "nadam"]
        }
        hyper_space = {
            "mdl_vector_size": hp.quniform("mdl_vector_size", 16, 128, 16),
            "mdl_dense_width": hp.quniform("mdl_dense_width", 2, 100, 1),
            "mdl_epochs": hp.quniform("mdl_epochs", 20, 60, 1),
            "mdl_optimizer": hp.choice("mdl_optimizer",
                                       hyper_choices["mdl_optimizer"]),
            "mdl_learn_rate_mult": hp.lognormal("mdl_learn_rate_mult", 0, 1),
            "mdl_class_weight_inc": hp.lognormal("mdl_class_weight_inc", 3, 1),
            "mdl_regularization": hp.lognormal("mdl_regularization", -4, 2),
        }
        return hyper_space, hyper_choices

    def fit_param_names(self):
        return ["batch_size", "epochs", "shuffle", "class_weight_inc",
                "verbose"]

    def model_param_names(self):
        return ["vector_size", "dense_width", "optimizer", "learn_rate_mult",
                "regularization"]
