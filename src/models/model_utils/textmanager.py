import numpy as np
from keras.preprocessing.text import Tokenizer
from keras.preprocessing.sequence import pad_sequences
from keras.utils import to_categorical


class TextManager():
    """Text Manager"""

    def __init__(self, max_num_words=20000, max_sequence_length=1000):

        self.max_num_words = max_num_words
        self.max_sequence_length = max_sequence_length

    def _tokenizer(self, texts, labels):
        # vectorize the text samples into a 2D integer tensor
        tokenizer = Tokenizer(num_words=self.max_num_words)
        tokenizer.fit_on_texts(texts)

        # get the word index
        word_index = tokenizer.word_index
        print('Found %s unique tokens.' % len(word_index))
        return (word_index, tokenizer)

    def sequence_maker(self, texts, labels):

        word_index, tokenizer = self._tokenizer(texts, labels)
        sequences = tokenizer.texts_to_sequences(texts)

        data = pad_sequences(
            sequences,
            maxlen=self.max_sequence_length,
            padding='post',
            truncating='post')
        labels = to_categorical(np.asarray(labels))
        print('Shape of data tensor:', data.shape)
        print('Shape of label tensor:', labels.shape)
        return (data, labels, word_index)
