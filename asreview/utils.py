# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import os
from pathlib import Path
import pkg_resources
from urllib.parse import urlparse

import numpy as np


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
                new_dict[key] = str_val in ["True", "true", "T", "t", True]
            else:
                try:
                    new_dict[key] = type(new_dict[key])(str_val)
                except TypeError:
                    raise(TypeError(f"Error at {key}"))
    return new_dict


def _safe_dict_update(default_dict, override_dict):
    """
    Using defaults and an overriding dictionary, create a new dictionary.
    This new dictionary has the same values as the default dictionary.
    Thus, if there are values that are in the overriding
    dictionary, but not in the original, they will be ignored.
    In contrast to the unsafe version, the type should be supplied in the
    default dictionary: key: (value, type).

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
    new_dict = {}
    for key in default_dict:
        new_dict[key] = default_dict[key][0]

    for key in override_dict:
        if key not in default_dict:
            print(f"Warning: key {key} is being ignored.")

    for key in new_dict:
        if key in override_dict:
            str_val = override_dict[key]
            type_val = default_dict[key][1]
            if type_val == bool:
                new_dict[key] = str_val in ["True", "true", "T", "t"]
            else:
                try:
                    new_dict[key] = type_val(str_val)
                except TypeError:
                    raise(TypeError(f"Error at {key}"))
    return new_dict


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


def _set_class_weight(weight1):
    """Used in RNN's to have quicker learning"""
    if weight1 is None:
        return None
    weight0 = 1.0
    cw_class = {
        0: weight0,
        1: weight1,
    }
    logging.debug(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")
    return cw_class


def format_to_str(obj):
    """Create string from object, concatenate if list."""
    if obj is None:
        return ""
    res = ""
    if isinstance(obj, list):
        res = " ".join(obj)
    else:
        res = obj
    return res


def pretty_format(result):
    longest_key = max([len(key) for key in result])
    result_str = ""
    for key, value in result.items():
        temp_str = "{{key: <{n}}}: {{value}}\n".format(n=longest_key)
        result_str += temp_str.format(key=key, value=value)
    return result_str


def is_iterable(i):
    """Check if a variable is iterable, but not a string."""
    try:
        iter(i)
        if isinstance(i, str):
            return False
        return True
    except TypeError:
        return False


def list_model_names(entry_name="asreview.models"):
    return [*get_entry_points(entry_name)]


def get_entry_points(entry_name="asreview.entry_points"):
    """Get the entry points for asreview.

    Parameters
    ----------
    entry_name: str
        Name of the submodule. Default "asreview.entry_points".

    Returns
    -------
    dict:
        Dictionary with the name of the entry point as key
        and the entry point as value.
    """
    return {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points(entry_name)
    }


def _model_class_from_entry_point(method, entry_name="asreview.models"):
    entry_points = get_entry_points(entry_name)
    try:
        return entry_points[method].load()
    except KeyError:
        raise ValueError(
            f"Error: method '{method}' is not implemented for entry point "
            f"{entry_name}.")
    except ImportError as e:
        raise ValueError(
            f"Failed to import '{method}' model ({entry_name}) "
            f"with the following error:\n{e}")


def is_url(url):
    """Check if object is a valid url."""
    try:
        result = urlparse(url)
        return all(getattr(result, x) != ""
                   for x in ["scheme", "netloc", "path"])
    except Exception:
        return False


def get_random_state(random_state):
    """Create a RandomState instance.

    Parameters
    ----------
    random_state: int, numpy.RandomState
        If it is an integer, seed a new random state.
        If it is a RandomState, return it (nop).
        If it is None, return the random state of numpy.
    """
    if random_state is None:
        return np.random.random.__self__
    else:
        if isinstance(random_state, np.random.RandomState):
            return random_state
        else:
            return np.random.RandomState(
                random_state % (2**32))
