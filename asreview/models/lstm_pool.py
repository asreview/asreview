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


from tensorflow.keras.constraints import MaxNorm
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Embedding
from tensorflow.keras.layers import Flatten
from tensorflow.keras.layers import LSTM
from tensorflow.keras.layers import MaxPooling1D
from tensorflow.keras.models import Sequential
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.models.lstm_base import _get_optimizer
from asreview.models.base import BaseModel
from asreview.utils import _set_class_weight


def create_lstm_pool_model(embedding_matrix,
                           backwards=True,
                           dropout=0.4,
                           optimizer='rmsprop',
                           max_sequence_length=1000,
                           lstm_out_width=20,
                           lstm_pool_size=100,
                           learn_rate=1.0,
                           verbose=1):
    """Return callable lstm model.

    Arguments
    ---------
    embedding_matrix: np.array
        Embedding matrix to use with LSTM model.
    backwards: bool
        Whether to have a forward or backward LSTM.
    optimizer: str
        Optimizer to use.
    max_sequence_length: int
        Maximum length of the text record to classify.
    lstm_out_width: int
        Output width of the LSTM.
    lstm_pool_size: int
        Size of the pool, must be a divisor of max_sequence_length.
    learn_rate_mult: float
        Learn rate multiplier of default learning rate.
    verbose: int
        Verbosity.
    Returns
    -------
    callable:
        A function that return the Keras Sklearn model when
        called.

    """
    # The Sklearn API requires a callable as result.
    # https://keras.io/scikit-learn-api/
    def model_wrapper():
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
                return_sequences=True,
                kernel_constraint=MaxNorm(),
            )
        )

        model.add(
            MaxPooling1D(
                pool_size=lstm_pool_size,
            )
        )
        model.add(
            Flatten()
        )

        # Add output layer
        model.add(
            Dense(
                1,
                activation='sigmoid'
            )
        )

        optimizer_fn = _get_optimizer(optimizer, learn_rate)

        # Compile model
        model.compile(
            loss='binary_crossentropy', optimizer=optimizer_fn,
            metrics=['acc'])

        if verbose >= 1:
            model.summary()

        return model

    return model_wrapper


class LSTMPoolModel(BaseModel):
    name = "lstm-pool"

    def __init__(self, embedding_matrix=None, backwards=True, dropout=0.4,
                 optimizer="rmsprop", lstm_out_width=20, lstm_pool_size=128,
                 learn_rate=1.0, verbose=0, batch_size=32, epochs=35,
                 shuffle=False, class_weight=30.0):
        super(LSTMPoolModel, self).__init__()
        self.embedding_matrix = embedding_matrix
        self.backwards = backwards
        self.dropout = dropout
        self.optimizer = optimizer
        self.lstm_out_width = lstm_out_width
        self.learn_rate = learn_rate
        self.verbose = verbose
        self.batch_size = batch_size
        self.epochs = epochs
        self.shuffle = shuffle
        self.class_weight = _set_class_weight(class_weight)
        self.lstm_pool_size = lstm_pool_size
        self._model = None
        self.sequence_length = None

    def fit(self, X, y):
        sequence_length = X.shape[1]
        if self._model is None or sequence_length != self.sequence_length:
            self.sequence_length = sequence_length
            keras_model = create_lstm_pool_model(
                embedding_matrix=self.embedding_matrix,
                backwards=self.backwards,
                dropout=self.dropout, optimizer=self.optimizer,
                max_sequence_length=sequence_length,
                lstm_out_width=self.lstm_out_width,
                learn_rate=self.learn_rate, verbose=self.verbose)
            self._model = KerasClassifier(keras_model, verbose=self.verbose)
        self._model.fit(X, y, batch_size=self.batch_size, epochs=self.epochs,
                        shuffle=self.shuffle, class_weight=self.class_weight,
                        verbose=self.verbose)

    def full_hyper_space(self):
        from hyperopt import hp

        hyper_choices = {}
        hyper_space = {
            "mdl_dropout": hp.uniform("mdl_dropout", 0, 0.9),
            "mdl_lstm_out_width": hp.quniform("mdl_lstm_out_width", 1, 50, 1),
            "mdl_dense_width": hp.quniform("mdl_dense_width", 1, 200, 1),
            "mdl_learn_rate_mult": hp.lognormal("mdl_learn_rate_mult", 0, 1)
        }
        return hyper_space, hyper_choices
