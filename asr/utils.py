# Cpython dependencies
import pathlib
import json

# external dependencies
import pandas as pd
import numpy as np


def load_data(fp):
    """Load papers and their labels.

    Arguments
    ---------
    fp: str
        File path to the data.

    Returns
    -------
    np.ndarray, np.array
        The title and abstract merged into a single string for each paper.
        The labels for each paper. 1 is included, 0 is excluded. If this column
        is not available, this column is not returned.
    """

    df = pd.read_csv(fp)

    # make texts and labels
    texts = (df['title'].fillna('') + ' ' + df['abstract'].fillna(''))

    try:
        labels = df["included_final"]
    except KeyError:
        return texts.values

    return texts.values, labels.values


def text_to_features(sequences, num_words=20000, max_sequence_length=1000,
                     padding='post', truncating='post'):
    """Convert text data into features.

    Arguments
    ---------
    sequences: list, numpy.ndarray, pandas.Series
        The sequences to convert into features.
    num_words: int
        See keras Tokenizer

    Returns
    -------
    np.ndarray, dict
        The array with features and the dictiory that maps words to values.
    """

    from tensorflow.keras.preprocessing.text import Tokenizer
    from tensorflow.keras.preprocessing.sequence import pad_sequences

    # fit on texts
    tokenizer = Tokenizer(num_words=num_words)
    tokenizer.fit_on_texts(sequences)

    # tokenize sequences
    tokens = tokenizer.texts_to_sequences(sequences)

    # pad sequences with zeros.
    x = pad_sequences(
        tokens,
        maxlen=max_sequence_length,
        padding=padding,
        truncating=truncating
    )

    # word index hack. see issue
    # https://github.com/keras-team/keras/issues/8092
    word_index = {e: i for e, i in tokenizer.word_index.items()
                  if i <= num_words}

    return x, word_index


class Logger(object):
    """Class for logging the Systematic Review"""

    def __init__(self, X=None):
        super(Logger, self).__init__()

        self.X = X

        # since python 3, this is an ordered dict
        self._log_dict = {}

    def __str__(self):

        self._print_logs()

    def _print_logs(self):

        s = "Logs of the Systematic Review process:\n"
        for i, value in self._log_dict.items():
            s += f"Query {i} - Reduction {value}"

        return s

    def add_training_log(self, indices, labels, i=None):
        """Add training indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for training.
        labels: list
            A list of labels corresponding with the training indices.
        i: int
            The query number.
        """

        # ensure that variables are serializable
        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        if isinstance(labels, np.ndarray):
            labels = labels.tolist()

        # the query number
        if i is None:
            i = max(self._log_dict.keys()) + 1

        self._log_dict[i] = {'labelled': list(zip(indices, labels))}

    def add_pool_log(self, indices, pred, i=None):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for inverse pool.
        pred: list
            A list of labels corresponding with the inverse pool indices.
        i: int
            The query number.
        """

        raise NotImplementedError()

    def save(self, fp):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        fp = pathlib.Path(fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        with fp.open('w') as outfile:
            json.dump(self._log_dict, outfile)
