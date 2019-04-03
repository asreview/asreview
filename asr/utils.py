# Cpython dependencies
import os
import shutil
from configparser import ConfigParser
from os import environ
from pathlib import Path

# external dependencies
import pandas as pd


def _unsafe_dict_update(default_dict, override_dict):
    """
    Using defaults and an overriding dictionary, create a new dictionary.
    This new dictionary has the same values as the default dictionary and
    the same types. Thus, if there are values that are in the overriding
    dictionary, but not in the original, they will be ignored.

    Arguments
    ---------
    default_dict: dict
        Starting dictionary with defaults.
    override_dict: dict
        Dictionary with custom values (such as model parameters).

    Returns
    -------
    dict
        Merged dictionary.
    """
    new_dict = default_dict
    for key in new_dict:
        if key in override_dict:
            str_val = override_dict[key]
            new_dict[key] = type(new_dict[key])(str_val)
    return new_dict


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


def config_from_file(config_file):
    if config_file is None or not os.path.isfile(config_file):
        print(f"Didn't find configuration file: {config_file}")
        return {}

    config = ConfigParser()
    config.read(config_file)

    settings = {}

    for sect in config:
        if sect == "global_settings":
            settings.update(dict(config.items(sect)))
        elif sect == "model_param" or sect == "fit_param":
            settings[sect] = dict(config.items(sect))
        elif sect != "DEFAULT":
            print(f"Warning: section [{sect}] is ignored in"
                  f" config file {config_file}")
    return settings
