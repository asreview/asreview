"""keras embedding layer
"""
import numpy as np
from keras.layers import Embedding


class Word2VecEmbedding():
    """
    """

    embedding_dim = 300
    _embeddings_index = {}

    def __init__(self, word_index, max_num_words, max_sequence_length):
        self._word_index = word_index
        self._max_num_words = max_num_words
        self._max_sequence_length = max_sequence_length
        self._num_words = min(self._max_num_words, len(self._word_index) + 1)

    def load_word2vec_data(self, filePath):
        """Load word2vec data. fp =path.join("word2vec", "wiki.en.vec")
        """

        # Build index mapping words in the embeddings set
        # to their embedding vector

        print('Indexing word vectors.')
        self._embeddings_index = {}

        with open(filePath, encoding='utf8') as f:
            for line in f:

                values = line.split()
                split_on_i = len(values) - self.embedding_dim
                word = ' '.join(values[0:split_on_i])
                coefs = np.asarray(values[split_on_i:], dtype='float32')
                self._embeddings_index[word] = coefs
        print('Found %s word vectors.' % len(self._embeddings_index))

    def _make_embedding_matrix(self):

        self._embedding_matrix = np.zeros((self._num_words,
                                           self.embedding_dim))

        for word, i in self._word_index.items():
            if i >= self._max_num_words:
                continue

            embedding_vector = self._embeddings_index.get(word)

            if embedding_vector is not None:

                # words not found in embedding index will be all-zeros.
                self._embedding_matrix[i] = embedding_vector

        print('Shape of embedding matrix: ', self._embedding_matrix.shape)

    def build_embedding(self):
        """
            load pre-trained word embeddings into an Embedding layer
            note that we set trainable = False so as to keep the embeddings fixed

            """
        self._make_embedding_matrix()
        return Embedding(
            self._num_words,
            self.embedding_dim,
            weights=[self._embedding_matrix],
            input_length=self._max_sequence_length,
            trainable=False)
