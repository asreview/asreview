import numpy as np
from keras.layers import Dense, Input, LSTM
from keras.models import Model
from keras.utils import to_categorical

class LSTM_Model():
    """
    """
    # training arguments
    batch_size = 16
    epoch_no = 10

    def __init__(self, *args, **kwargs):
        self._model = self._get_lstm_model(*args, **kwargs)

    def train(self, *args, **kwargs):
        self._train_model(*args, **kwargs)


    def predict(self, feature, *args, **kwargs):
        return self._model.predict(np.array(feature))

    def _get_lstm_model(self, backwards, dropout, optimizer,
                        max_sequence_length, embedding_layer):
        sequence_input = Input(shape=(max_sequence_length, ), dtype='int32')
        embedded_sequences = embedding_layer(sequence_input)

        x = LSTM(
            10,
            input_shape=(max_sequence_length, ),
            go_backwards=backwards,
            dropout=dropout)(embedded_sequences)
        x = Dense(128, activation='relu')(x)
        output = Dense(2, activation='softmax')(x)

        model_lstm = Model(inputs=sequence_input, outputs=output)

        model_lstm.compile(
            loss='binary_crossentropy', optimizer=optimizer, metrics=['acc'])

        model_lstm.summary()
        return model_lstm

    def _train_model(self, *args):

         if len(args)>1:
            x_train = np.array(args[0])
            y_train = np.array(args[1])
            x_val = np.array(args[2])
            y_val = np.array(args[3])            
            
            weights = {0: 1 / y_train[:, 0].mean(), 1: 1 / y_train[:, 1].mean()}
            self._model.fit(
                x_train,
                y_train,
                batch_size=self.batch_size,
                epochs=self.epoch_no,
                validation_data=(x_val, y_val),
                shuffle=True,
                class_weight=weights,
                verbose=0)
         else:
            dataset = args[0] 
            x_train, y_train_ = dataset.format_sklearn()

            if y_train_.ndim==1:    
                y_train = to_categorical(np.asarray(y_train_))
            else:
                y_train = y_train_

            weights = {0: 1 / y_train[:, 0].mean(), 1: 1 / y_train[:, 1].mean()}
    
            self._model.fit(
                x_train,
                y_train,
                batch_size=self.batch_size,
                epochs=self.epoch_no,
                shuffle=True,
                class_weight=weights,
                verbose=0)
