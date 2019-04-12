from tensorflow.keras.layers import Dense, LSTM, Embedding
from tensorflow.keras.layers import MaxPooling1D, Flatten
from tensorflow.keras.models import Sequential
# from keras.optimizers import RMSprop
from tensorflow.keras.optimizers import RMSprop, Adam
from tensorflow.keras.constraints import MaxNorm
from asr.utils import _unsafe_dict_update
# from keras.layers.pooling import MaxPool1D
from asr.balanced_al import _set_class_weight


def lstm_model_defaults(settings, verbose=1):
    """ Set the lstm model defaults. """
    model_kwargs = {}
    model_kwargs['backwards'] = True
    model_kwargs['dropout'] = 0.4
    model_kwargs['optimizer'] = "rmsprop"
    model_kwargs['max_sequence_length'] = 1000
    model_kwargs['verbose'] = verbose
    model_kwargs['lstm_out_width'] = 20
    model_kwargs['lstm_pool_size'] = 100
    model_kwargs['learn_rate_mult'] = 1.0

    upd_param = _unsafe_dict_update(model_kwargs, settings['model_param'])
    settings['model_param'] = upd_param

    return upd_param


def lstm_fit_defaults(settings, verbose=1):
    """ Set the fit defaults and merge them with custom settings. """

    # Extra variables
    extra_vars = {}
    extra_vars['shuffle'] = True
    extra_vars['class_weight_inc'] = 30.0
    extra_vars['train_data_fn'] = "triple_balance"
    extra_vars['n_extra_words'] = 55
    extra_vars['one_zero_beta'] = 0.4
    extra_vars['rand_max_weight_b'] = 30

    # arguments to pass to the fit
    fit_kwargs = {}
    fit_kwargs['batch_size'] = 32
    fit_kwargs['epochs'] = 10
    fit_kwargs['verbose'] = verbose

    settings['fit_param'] = _unsafe_dict_update(
        fit_kwargs, settings['fit_param'])
    settings['extra_vars'] = _unsafe_dict_update(
        extra_vars, settings['extra_vars'])

    _set_class_weight(extra_vars['class_weight_inc'], fit_kwargs)

    return settings['fit_param']


def create_lstm_model(embedding_matrix,
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

        if optimizer == "rmsprop":
            optimizer_fn = Adam(lr=0.1*learn_rate_mult)
        else:
            optimizer_fn = RMSprop(lr=0.01*learn_rate_mult)

        # Compile model
        model.compile(
            loss='binary_crossentropy', optimizer=optimizer_fn,
            metrics=['acc'])

        if verbose == 1:
            model.summary()

        return model

    return wrap_model
