# Cpython dependencies
import json
from os import environ
from pathlib import Path
import shutil
from datetime import datetime

# external dependencies
import numpy as np

import pandas as pd


def _unsafe_dict_update(default_dict, new_dict):
    my_dict = default_dict
    for key in my_dict:
        if key in new_dict:
            str_val = new_dict[key]
            my_dict[key] = type(my_dict[key])(str_val)
    return my_dict


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
        self._log_dict = {"time": {"start_time": str(datetime.now())}}

    def __str__(self):

        self._print_logs()

    def _print_logs(self):
        self._log_dict["time"]["end_time"] = str(datetime.now())
        s = "Logs of the Systematic Review process:\n"
        for i, value in self._log_dict.items():
            s += f"Query {i} - Reduction {value}"

        return s

    def _add_log(self, new_dict, i):
        # Find the first number that is not logged yet.
        if i is None:
            i = 0
            while i in self._log_dict:
                if set(new_dict.keys()).isdisjoint(self._log_dict[i].keys()):
                    print(f"{new_dict.keys()} vs {self._log_dict[i].keys()}")
                    break
                i += 1

        if i not in self._log_dict:
            self._log_dict[i] = {}

        self._log_dict[i].update(new_dict)

    def add_settings(self, settings):
        self._log_dict["settings"] = settings

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
        new_dict = {'labelled': list(zip(indices, labels))}
        self._add_log(new_dict, i)

    def add_pool_predict(self, indices, pred, i=None):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for unlabeled pool.
        pred: np.array
            A list of predictions for those samples.
        i: int
            The query number.
        """

        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        pred = np.reshape(pred, -1)
        if isinstance(pred, np.ndarray):
            pred = pred.tolist()
        new_dict = {'predictions': list(zip(indices, pred))}
        self._add_log(new_dict, i)

    def add_proba(self, indices, pred_proba, logname="pool_proba", i=None):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for unlabeled pool.
        pred: np.array
            Array of prediction probabilities for unlabeled pool.
        i: int
            The query number.
        """

        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        pred_proba = pred_proba[:, 1]
        if isinstance(pred_proba, np.ndarray):
            pred_proba = pred_proba.tolist()
        new_dict = {logname: list(zip(indices, pred_proba))}
        self._add_log(new_dict, i)

    def save(self, fp):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        self._log_dict["time"]["end_time"] = str(datetime.now())
        fp = Path(fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        with fp.open('w') as outfile:
            json.dump(self._log_dict, outfile, indent=2)


def get_data_home(data_home=None):
    """Return the path of the ASR data dir.

    This folder is used by some large dataset loaders to avoid downloading the
    data several times.
    By default the data dir is set to a folder named 'asr_data' in the
    user home folder.
    Alternatively, it can be set by the 'ASR_DATA' environment
    variable or programmatically by giving an explicit folder path. The '~'
    symbol is expanded to the user home folder.
    If the folder does not already exist, it is automatically created.

    Parameters
    ----------
    data_home : str | None
        The path to scikit-learn data dir.

    """
    if data_home is None:
        data_home = environ.get('ASR_DATA',
                                Path('~', 'asr_data'))
    data_home = Path(data_home).expanduser()

    if not data_home.exists():
        data_home.mkdir(parents=True, exist_ok=True)

    return data_home


def clear_data_home(data_home=None):
    """Delete all the content of the data home cache.

    Parameters
    ----------
    data_home : str | None
        The path to scikit-learn data dir.

    """
    data_home = get_data_home(data_home)
    shutil.rmtree(data_home)
