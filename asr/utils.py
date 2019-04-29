# Cpython dependencies
import os
import shutil
from configparser import ConfigParser
from pathlib import Path
import warnings

from asr.readers import read_data


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
    for key in override_dict:
        if key not in default_dict:
            print(f"Warning: key {key} is being ignored.")

    for key in new_dict:
        if key in override_dict:
            str_val = override_dict[key]
            if type(new_dict[key]) == bool:
                new_dict[key] = str_val in ["True", "true", "T", "t"]
            else:
                try:
                    new_dict[key] = type(new_dict[key])(str_val)
                except TypeError:
                    raise(TypeError(f"Error at {key}"))
    return new_dict


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

    # Pad sequences with zeros.
    x = pad_sequences(
        tokens,
        maxlen=max_sequence_length,
        padding=padding,
        truncating=truncating
    )

    # Loop the sequences instead of padding.
    for i, old_x in enumerate(x):
        nz = max_sequence_length-1
        while nz >= 0 and old_x[nz] == 0:
            nz -= 1
        # If there are only 0's (no data), continue.
        if nz < 0:
            continue
        nz += 1
        new_x = old_x.copy()

        j = 1
        # Copy the old data to the new matrix.
        while nz*j < max_sequence_length:
            cp_len = min(nz*(j+1), max_sequence_length)-nz*j
            new_x[nz*j:nz*j+cp_len] = old_x[0:cp_len]
            j += 1
        x[i] = new_x

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
        data_home = os.environ.get('ASR_DATA',
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


def _set_class_weight(weight1, fit_kwargs):
    """ Used in RNN's to have quicker learning. """
    weight0 = 1.0
    fit_kwargs['class_weight'] = {
        0: weight0,
        1: weight1,
    }
    print(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")


def config_from_file(config_file):
    """ Get settings from a configuration file using ConfigParser. """
    if config_file is None or not os.path.isfile(config_file):
        if config_file is not None:
            print(f"Didn't find configuration file: {config_file}")
        return {}

    config = ConfigParser()
    config.read(config_file)

    settings = {}

    # Read the each of the sections.
    for sect in config:
        if sect == "global_settings":
            settings.update(dict(config.items(sect)))
        elif (sect == "model_param" or sect == "fit_param" or
              sect == "query_param" or sect == "balance_param"):
            settings[sect] = dict(config.items(sect))
        elif sect != "DEFAULT":
            print (f"Warning: section [{sect}] is ignored in "
                   f"config file {config_file}")
    return settings


def load_data(*args, **kwargs):
    """ [Deprecated] Load papers and their labels. @see read_data"""
    warnings.warn("deprecated: use read_data instead of load_data",
                  DeprecationWarning)
    read_data(*args, **kwargs)
