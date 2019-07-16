from tensorflow.keras.layers import Dense, LSTM, Embedding
from tensorflow.keras.models import Sequential

from asr.utils import _unsafe_dict_update
from asr.utils import _set_class_weight


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

    upd_param = _unsafe_dict_update(model_kwargs, settings['model_param'])
    settings['model_param'] = upd_param

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

    settings['fit_kwargs'] = _unsafe_dict_update(
        fit_kwargs, settings['fit_param'])

    _set_class_weight(fit_kwargs.pop('class_weight_inc'), fit_kwargs)

    return settings['fit_kwargs']


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
