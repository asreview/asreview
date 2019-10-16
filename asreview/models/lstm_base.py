import copy
import logging
import time
from pathlib import Path

from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Embedding
from tensorflow.keras.layers import LSTM
from tensorflow.keras.models import Sequential
from tensorflow.keras.wrappers.scikit_learn import KerasClassifier


from asreview.utils import _set_class_weight
from asreview.utils import _unsafe_dict_update
from asreview.models.base import BaseModel

from asreview.utils import get_data_home
from asreview.utils import text_to_features

from asreview.models.embedding import download_embedding
from asreview.models.embedding import EMBEDDING_EN
from asreview.models.embedding import load_embedding
from asreview.models.embedding import sample_embedding


def lstm_base_model_defaults(settings, verbose=1):
    """ Set the lstm model defaults. """
    model_kwargs = {}
    model_kwargs['backwards'] = True
    model_kwargs['dropout'] = 0.4
    model_kwargs['optimizer'] = "rmsprop"
    model_kwargs['max_sequence_length'] = 1000
    model_kwargs['verbose'] = verbose
    model_kwargs['lstm_out_width'] = 20
    model_kwargs['dense_width'] = 128

    upd_param = _unsafe_dict_update(model_kwargs, settings.model_param)
    settings.model_param = upd_param

    return upd_param


def lstm_fit_defaults(settings, verbose=1):
    """ Set the fit defaults and merge them with custom settings. """

    # arguments to pass to the fit
    fit_kwargs = {}
    fit_kwargs['batch_size'] = 32
    fit_kwargs['epochs'] = 10
    fit_kwargs['verbose'] = verbose
    fit_kwargs['shuffle'] = False
    fit_kwargs['class_weight_inc'] = 30.0

    settings.fit_kwargs = _unsafe_dict_update(
        fit_kwargs, settings.fit_param)

    _set_class_weight(fit_kwargs.pop('class_weight_inc'), fit_kwargs)

    return settings.fit_kwargs


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


class KerasModel(BaseModel):
    def __init__(self, model_param={}, fit_param={}, embedding_fp=None, **kwargs):
        super(KerasModel, self).__init__(model_param, fit_param)
        self.name = "keras"

        self.embedding_fp = embedding_fp
        self.embedding_matrix = None
        self.word_index = None

    def get_Xy(self, texts, labels):
        self.X, self.word_index = text_to_features(texts)
        self.y = labels
        return self.X, self.y

    def fit_kwargs(self):
        fit_kwargs = copy.deepcopy(self.fit_param)
        class_weight_inc = fit_kwargs.pop('class_weight_inc')
        fit_kwargs['class_weight'] = _set_class_weight(class_weight_inc)
        return fit_kwargs

    def get_embedding_matrix(self):
        if self.embedding_matrix is not None:
            return self.embedding_matrix

        if self.word_index is None:
            self.get_Xy()

        if self.embedding_fp is None:
            self.embedding_fp = Path(
                get_data_home(),
                EMBEDDING_EN["name"]
            ).expanduser()

            if not self.embedding_fp.exists():
                print("Warning: will start to download large "
                      "embedding file in 10 seconds.")
                time.sleep(10)
                download_embedding()

        # create features and labels
        logging.info("Loading embedding matrix. "
                     "This can take several minutes.")
        embedding = load_embedding(self.embedding_fp,
                                   word_index=self.word_index)
        self.embedding_matrix = sample_embedding(embedding, self.word_index)
        return self.embedding_matrix


class LSTMBaseModel(KerasModel):
    def __init__(self, model_param={}, fit_param={}, **kwargs):
        super(LSTMBaseModel, self).__init__(model_param, fit_param, **kwargs)
        self.name = "lstm_base"

    def model(self):
        embedding_matrix = self.get_embedding_matrix()
        model = create_lstm_base_model(embedding_matrix, **self.model_param)
        return KerasClassifier(model,
                               verbose=self.model_param.get("verbose", 0))

    def default_param(self):
        kwargs = {
            "backwards": True,
            "dropout": 0.4,
            "optimizer": "rmsprop",
            "max_sequence_length": 1000,
            "lstm_out_width": 20,
            "dense_width": 128,
            "verbose": 1,
        }
        return kwargs

    def default_fit_param(self):
        fit_param = dict(
            batch_size=32,
            epochs=10,
            verbose=0,
            shuffle=False,
            class_weight_inc=30.0
        )
        return fit_param

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
