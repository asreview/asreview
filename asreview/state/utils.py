# Copyright 2019 The ASReview Authors. All Rights Reserved.
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
    try:
        state = state_class(state_fp=fp, *args, read_only=read_only, **kwargs)
        yield state
    finally:
        state.close()


def states_from_dir(data_dir, prefix=""):
    """Obtain a dictionary of states from a directory.

    Arguments
    ---------
    data_dir: str
        Directory where to search for state files.
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
        Path to state file.

    Returns
    -------
    dict:
        A dictionary of a single opened state, with its filename as key.
    """
    if not Path(data_fp).is_file():
        logging.error(f"File {data_fp} does not exist, cannot create state.")
        return None

    if not Path(data_fp).suffix in STATE_EXTENSIONS:
        logging.error(f"file {data_fp} does not end with {STATE_EXTENSIONS}.")
        return None
    state = {os.path.basename(os.path.normpath(data_fp)):
             _get_state_class(data_fp)(state_fp=data_fp, read_only=True)}
    return state
