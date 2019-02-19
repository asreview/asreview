

from tensorflow.keras.layers import Dense, LSTM, Embedding
from tensorflow.keras.models import Sequential


def create_lstm_model(embedding_matrix,
                      backwards=True,
                      dropout=0.4,
                      optimizer='rmsprop',
                      max_sequence_length=1000,
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
                10,
                input_shape=(max_sequence_length, ),
                go_backwards=backwards,
                dropout=dropout
            )
        )

        # add Dense layer with relu activation
        model.add(
            Dense(
                128,
                activation='relu'
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
