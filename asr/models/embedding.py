"""Script to create the memory of an embeeding layer."""

import numpy as np


def load_embedding(fp, verbose=1):
    """Load embedding matrix from file.

    The embedding matrix needs to be stored in the
    FastText format.

    Parameters
    ----------
    fp: str
        File path of the trained embedding vectors.
    verbose: int
        The verbosity. Default 1.

    Returns
    -------
    dict:
        The embedding weights stored in a dict with the word as key and
        the weights as values.
    """

    embedding = {}

    with open(fp, 'r', encoding='utf-8', newline='\n') as f:

        n, d = list(map(int, f.readline().split(' ')))

        if verbose == 1:
            print(f"Reading {n} vectors with {d} dimensions.")

        for i, line in enumerate(f):

            # split word and weights
            values = line.split(' ')
            if len(values) != d + 2:
                raise ValueError("Check values: %s" % values)

            word = values[0]
            coefs = values[1:d + 1]

            # store the results
            embedding[word] = np.asarray(coefs, dtype=np.float32)

    if verbose == 1:
        print(f"Found {len(embedding)} word vectors.")

    return embedding


def sample_embedding(embedding, word_index, verbose=1):
    """Sample embedding matrix

    Parameters
    ----------
    embedding: dict
        A dictionary with the words and embedding vectors.
    word_index: dict
        A word_index like the output of Keras Tokenizer.word_index.
    verbose: int
        The verbosity. Default 1.

    Returns
    -------
    (np.ndarray, list):
        The embedding weights strored in a two dimensional
        numpy array and a list with the corresponding words.
    """

    n, d = len(word_index), len(next(iter(embedding.values())))

    if verbose == 1:
        print(f"Creating matrix with {n}+1 vectors with {d} dimensions.")

    # n+1 because 0 is preserved in the tokenizing process.
    embedding_matrix = np.zeros((n + 1, d))

    for word, i in word_index.items():

        # words not found in embedding vocabulary will be all-zeros.
        coefs = embedding.get(word)
        if coefs is not None:
            embedding_matrix[i] = coefs

    if verbose == 1:
        print('Shape of embedding matrix: ', embedding_matrix.shape)

    return embedding_matrix
