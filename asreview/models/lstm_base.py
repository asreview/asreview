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


from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Embedding
from tensorflow.keras.layers import LSTM
from tensorflow.keras.models import Sequential
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.models.keras import KerasModel


def create_lstm_base_model(embedding_matrix,
                           backwards=True,
                           dropout=0.4,
                           optimizer='rmsprop',
                           max_sequence_length=1000,
                           lstm_out_width=20,
                           dense_width=128,
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
    # The Sklearn API requires a callable as result.
    # https://keras.io/scikit-learn-api/

    def wrap_model():

        model = Sequential()

        # add first embedding layer with pretrained wikipedia weights
        model.add(
            Embedding(
                embedding_matrix.shape[0],
                embedding_matrix.shape[1],
                weights=[embedding_matrix],
                input_length=max_sequence_length,
                trainable=False
            )
        )

        # add LSTM layer
        model.add(
            LSTM(
                lstm_out_width,
                input_shape=(max_sequence_length, ),
                go_backwards=backwards,
                dropout=dropout,
                recurrent_dropout=dropout,
            )
        )

        # add Dense layer with relu activation
        model.add(
            Dense(
                dense_width,
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

        # Compile model
        model.compile(
            loss='binary_crossentropy', optimizer=optimizer, metrics=['acc'])

        if verbose == 1:
            model.summary()

        return model

    return wrap_model


class LSTMBaseModel(KerasModel):
    def __init__(self, param={}, **kwargs):
        super(LSTMBaseModel, self).__init__(param, **kwargs)
        self.name = "lstm_base"

    def model(self):
        embedding_matrix = self.get_embedding_matrix()
        model_param = self.model_param()
        model = create_lstm_base_model(embedding_matrix, **model_param)
        verbose = model_param.get("verbose", self.default_param()["verbose"])
        return KerasClassifier(model, verbose=verbose)

    def default_param(self):
        kwargs = {
            "backwards": True,
            "dropout": 0.4,
            "optimizer": "rmsprop",
            "max_sequence_length": 1000,
            "lstm_out_width": 20,
            "dense_width": 128,
            "verbose": 1,
            "batch_size": 32,
            "epochs": 10,
            "shuffle": False,
            "class_weight_inc": 30.0,
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {
            "mdl_optimizer": ["sgd", "rmsprop", "adagrad", "adam", "nadam"]
        }
        hyper_space = {
            "mdl_optimizer": hp.choice("mdl_optimizer",
                                       hyper_choices["mdl_optimizer"]),
            "mdl_dropout": hp.uniform("mdl_dropout", 0, 0.9),
            "mdl_lstm_out_width": hp.quniform("mdl_lstm_out_width", 1, 50, 1),
            "mdl_dense_width": hp.quniform("mdl_dense_width", 1, 200, 1),
        }
        return hyper_space, hyper_choices

    def fit_param_names(self):
        param_names = [
            "batch_size", "epochs", "shuffle", "class_weight_inc", "verbose",
        ]
        return param_names

    def model_param_names(self):
        param_names = [
            "backwards", "dropout", "optimizer", "max_sequence_length",
            "lstm_out_width", "dense_width", "verbose",
        ]
        return param_names
