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


def _get_state(fp, *args, **kwargs):
    "Get state class from file extension."
    from asreview.state.hdf5 import HDF5State
    from asreview.state.json import JSONState
    from asreview.state.dict import DictState

    if fp is None:
        return DictState.from_file(None)

    state_ext = Path(fp).suffix
    if state_ext in ['.h5', '.hdf5', '.he5']:
        state = HDF5State.from_file(fp, *args, **kwargs)
    elif state_ext in ['.json']:
        state = JSONState.from_file(fp, *args, **kwargs)
    else:
        state = None
    return state


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
#     state_class = _get_state_class(fp)
    try:
        state = _get_state(fp=fp, *args, read_only=read_only, **kwargs)
        if state is None:
            raise ValueError("Bad state file extension, choose one of the"
                             f" following:\n   {', '.join(STATE_EXTENSIONS)}")
        yield state
    finally:
        if state is not None:
            state.close()


def states_from_dir(data_dir, prefix="result", read_only=True):
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
        state = _get_state(state_fp, read_only=read_only)
        states[state_file] = state
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
             _get_state(fp=data_fp, read_only=True)}
    return state
