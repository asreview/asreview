
from tensorflow.keras.constraints import MaxNorm
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Embedding
from tensorflow.keras.layers import Flatten
from tensorflow.keras.layers import LSTM
from tensorflow.keras.layers import MaxPooling1D
from tensorflow.keras.models import Sequential
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier

from asreview.models.keras import KerasModel, _get_optimizer


def create_lstm_pool_model(embedding_matrix,
                           backwards=True,
                           dropout=0.4,
                           optimizer='rmsprop',
                           max_sequence_length=1000,
                           lstm_out_width=20,
                           lstm_pool_size=100,
                           learn_rate_mult=1.0,
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

        optimizer_fn = _get_optimizer(optimizer, learn_rate_mult)

        # Compile model
        model.compile(
            loss='binary_crossentropy', optimizer=optimizer_fn,
            metrics=['acc'])

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
        model = create_lstm_pool_model(embedding_matrix, **self.model_param)
        return KerasClassifier(model,
                               verbose=self.model_param.get("verbose", 0))

    def default_param(self):
        kwargs = {
            "backwards": True,
            "dropout": 0.4,
            "optimizer": "rmsprop",
            "max_sequence_length": 1000,
            "lstm_out_width": 20,
            "lstm_pool_size": 128,
            "learn_rate_mult": 1.0,
            "verbose": 1,
            "batch_size": 32,
            "epochs": 10,
            "shuffle": False,
            "class_weight_inc": 30.0
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
            "mdl_learn_rate_mult": hp.lognormal("mdl_learn_rate_mult", 0, 2)
        }
        return hyper_space, hyper_choices

    def fit_param_names(self):
        param_names = [
            "batch_size", "epochs", "shuffle", "class_weight_inc", "verbose",
        ]
        return param_names

    def model_param_names(self):
        param_names = [
            "backward", "dropout", "optimizer", "max_sequence_length",
            "lstm_out_width", "lstm_pool_size", "learn_rate_mult", "verbose",
        ]
        return param_names
