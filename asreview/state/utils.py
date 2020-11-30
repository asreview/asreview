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

from contextlib import contextmanager
import logging
import os
from pathlib import Path
import zipfile
import tempfile

from asreview.config import STATE_EXTENSIONS


def _get_state_class(fp):
    "Get state class from file extension."
    from asreview.state.hdf5 import HDF5State
    from asreview.state.json import JSONState
    from asreview.state.dict import DictState

    if fp is None:
        return DictState

    state_ext = Path(fp).suffix
    if state_ext in ['.h5', '.hdf5', '.he5']:
        state_class = HDF5State
    elif state_ext in ['.json']:
        state_class = JSONState
    else:
        state_class = None
    return state_class


@contextmanager
def open_state(fp, *args, read_only=False, **kwargs):
    """Open a state from a file.

    Arguments
    ---------
    fp: str
        File to open.
    read_only: bool
        Whether to open the file in read_only mode.

    Returns
    -------
    Basestate:
        Depending on the extension the appropriate state is
        chosen:
        - [.h5, .hdf5, .he5] -> HDF5state.
        - None -> Dictstate (doesn't store anything permanently).
        - Anything else -> JSONstate.
    """
    state_class = _get_state_class(fp)

    if state_class is None:
        raise ValueError("Bad state file extension, choose one of the"
                         f" following:\n   {', '.join(STATE_EXTENSIONS)}")

    # init state class
    state = state_class(state_fp=fp, *args, read_only=read_only, **kwargs)

    try:
        yield state
    finally:
        state.close()


def states_from_dir(data_dir, prefix=""):
    """Obtain a dictionary of states from a directory.

    Arguments
    ---------
    data_dir: str
        Directory where to search for state files or .asreview files.
    prefix: str
        Files starting with the prefix are assumed to be state files.
        The rest is ignored.

    Returns
    -------
    dict:
        A dictionary of opened states, with their (base) filenames as keys.
    """
    states = {}
    files = os.listdir(data_dir)
    if not files:
        logging.error(f"{data_dir} is empty.")
        return None

    for state_file in files:
        if not state_file.startswith(prefix):
            continue

        state_fp = os.path.join(data_dir, state_file)
        if Path(state_fp).suffix == ".asreview":
            states[state_file] = state_from_asreview_file(state_fp)
        else:
            state_class = _get_state_class(state_fp)
            if state_class is None:
                continue
            states[state_file] = state_class(state_fp=state_fp, read_only=True)

    return states


def state_from_file(data_fp):
    """Obtain a single state from a file.

    Arguments
    ---------
    data_fp: str
        Path to state file or .asreview file.

    Returns
    -------
    dict:
        A dictionary of a single opened state, with its filename as key.
    """
    if not Path(data_fp).is_file():
        logging.error(f"File {data_fp} does not exist, cannot create state.")
        return None

    if Path(data_fp).suffix == ".asreview":
        base_state = state_from_asreview_file(data_fp)
    elif Path(data_fp).suffix in STATE_EXTENSIONS:
        base_state = _get_state_class(data_fp)(state_fp=data_fp, read_only=True)
    else:
        raise ValueError(f"Expected ASReview file or file {data_fp} with "
                         f"extension {STATE_EXTENSIONS}.")

    state = {
        os.path.basename(os.path.normpath(data_fp)):
        base_state
    }
    return state


def state_from_asreview_file(data_fp):
    """Obtain the state from a .asreview file.

    Parameters
    ----------
    data_fp: str
        Path to .asreview file.

    Returns
    -------
    BaseState:
        The same type of state file as in the .asreview file, which at the moment
        is JSONState.
    """
    if not Path(data_fp).suffix == '.asreview':
        raise ValueError(f"file {data_fp} does not end with '.asreview'.")

    # Name of the state file in the .asreview file.
    state_fp_in_zip = 'result.json'
    with zipfile.ZipFile(data_fp, "r") as zipObj:
        tmpdir = tempfile.TemporaryDirectory()
        zipObj.extract(state_fp_in_zip, tmpdir.name)
        fp = Path(tmpdir.name, state_fp_in_zip)
        state = _get_state_class(fp)(state_fp=fp, read_only=True)
        return state
