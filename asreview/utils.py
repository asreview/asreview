# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

__all__ = [
    "asreview_path",
    "get_data_home",
    "get_random_state",
]

import functools
import os
import sys
import warnings
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import urlopen

import numpy as np

from asreview._deprecated import _deprecated_func

if sys.version_info >= (3, 10):
    from importlib.metadata import entry_points as _entry_points
else:
    from importlib_metadata import entry_points as _entry_points


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
            if isinstance(new_dict[key], bool):
                new_dict[key] = str_val in ["True", "true", "T", "t", True]
            else:
                try:
                    new_dict[key] = type(new_dict[key])(str_val)
                except TypeError:
                    raise TypeError(f"Error at {key}")
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
                    raise TypeError(f"Error at {key}")
    return new_dict


def _deprecated_kwarg(kwarg_map):
    def dec(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            new_kwargs = {}
            for k, v in kwargs.items():
                if k in kwarg_map:
                    warnings.warn(f"Keyword argument '{k}' is deprecated. Use '{kwarg_map[k]}' instead.", DeprecationWarning)  # noqa
                new_kwargs[kwarg_map.get(k, k)] = v
            return func(*args, **new_kwargs)
        return wrapper
    return dec


def _get_filename_from_url(url):
    if not is_url(url):
        raise ValueError(f"'{url}' is not a valid URL.")

    if Path(urlparse(url).path).suffix:
        return Path(urlparse(url).path).name
    else:
        try:
            return urlopen(url).headers.get_filename()
        except HTTPError as err:
            # 308 (Permanent Redirect) not supported
            # See https://bugs.python.org/issue40321
            if err.code == 308:
                return _get_filename_from_url(err.headers.get("Location"))
            else:
                raise err


def asreview_path():
    """Get the location where projects are stored.

    Overwrite this location by specifying the ASREVIEW_PATH enviroment
    variable.
    """
    if os.environ.get("ASREVIEW_PATH", None):
        asreview_path = Path(os.environ["ASREVIEW_PATH"])
    else:
        asreview_path = Path("~", ".asreview").expanduser()

    asreview_path.mkdir(parents=True, exist_ok=True)

    return asreview_path


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
        data_home = os.environ.get("ASR_DATA", Path("~", "asr_data"))
    data_home = Path(data_home).expanduser()

    if not data_home.exists():
        data_home.mkdir(parents=True, exist_ok=True)

    return data_home


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


@_deprecated_func(
    "list_model_names is deprecated, "
    "use asreview.models.classifiers.list_classifiers instead"
)
def list_model_names(group="asreview.models"):
    # Remove because of bug with unused default value.
    return list(_entry_points(group=group).names)


@_deprecated_kwarg({"entry_name": "group"})
def list_reader_names(group="asreview.readers"):
    return list(_entry_points(group=group).names)


@_deprecated_kwarg({"entry_name": "group"})
def list_writer_names(group="asreview.writers"):
    return list(_entry_points(group=group).names)


@_deprecated_func(
    "get_entry_points is deprecated, "
    "use _entry_points(group='asreview.entry_points') instead"
)
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

    return {entry.name: entry for entry in _entry_points(group=entry_name)}


def is_url(url):
    """Check if object is a valid url."""
    try:
        result = urlparse(url)
        return all(
            getattr(result, x) not in [b"", ""] for x in ["scheme", "netloc", "path"])
    except Exception:
        return False


def get_random_state(seed=None):
    """Constructor for the seeded random number generator.

    This is the preferred method of instantiating the SeededRandomState class.
    This function makes sure that the random number generator has been seeded properly.
    By having a seperate constructor function, we are following the same pattern as
    Numpy uses.

    Parameters
    ----------
    seed : int | SeededRandomState | None, optional
        Seed for the random generator, or random generator itself. If this is None, a
        seed is generated randomly. By default None.

    Returns
    -------
    SeededRandomState
        A random number generator, seeded by the provided seed.
    """
    if isinstance(seed, SeededRandomState):
        return seed
    # # For the newer np.random.Generator class, the seed setting would be as follows:
    # # https://numpy.org/doc/stable/reference/random/index.html#quick-start
    # if seed is None:
    #     seed = secrets.randbits(128)
    if seed is None:
        rng = np.random.default_rng()
        seed = int(rng.integers(low=0, high=2**32))
    if not isinstance(seed, int):
        raise ValueError(
            "'seed' should be of type int, SeededRandomNumberGenerator or None"
        )
    return SeededRandomState(np.random.RandomState(seed), seed)


class SeededRandomState(np.random.RandomState):
    def __init__(self, random_state, seed):
        """Random State that is always seeded.

        A wrapper class around np.random.Generator that has the attribute `seed` added.
        Never instantiate this class directly, always use the `get_random_generator`
        function. It is implicitly assumed that the generator has been seeded using the
        seed from the argument. The function `get_random_generator` makes sure this
        happens correctly.

        Parameters
        ----------
        random_state : np.random.RandomState
            Random number generator that has been instantiated using
            `np.random.RandomState(seed)`.
        seed : int
            Integer that has been used as the seed of the generator.
        """
        # For the newer `np.random.Generator` class the init argument would be
        # `generator.bit_generator`. For the legacy `np.random.RandomState` class you
        # you can get the seed by `random_state.get_state()[1][0]`.
        super().__init__(random_state.get_state()[1][0])
        self.seed = seed


def _get_executable():
    """Get the Python executable"""

    return sys.executable if sys.executable else "python"
