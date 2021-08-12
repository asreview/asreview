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
from pathlib import Path
import sqlite3
from io import BytesIO
from base64 import b64decode

import pandas as pd
from scipy.sparse import load_npz
from scipy.sparse import csr_matrix

from asreview.state.sqlstate import SqlStateV1
from asreview.state.errors import StateNotFoundError


V3STATE_VERSION = "1.0"


# TODO(State): Create an 'add_project_json' function.
def is_zipped_project_file(fp):
    """Check if it is a zipped asreview project file."""
    if Path(fp).is_file():
        state_ext = Path(fp).suffix

        # TODO(State): Make link.
        if state_ext in ['.h5', '.hdf5', '.he5', '.json']:
            raise ValueError(
                f'State file with extension {state_ext} is no longer '
                f'supported. Migrate to the new format or '
                'use an older version of ASReview. See LINK.')
        elif state_ext == '.asreview':
            return True
        else:
            raise ValueError(f'State file extension {state_ext} is not '
                             f'recognized.')
    else:
        return False


def is_valid_project_folder(fp):
    """Check of the folder contains an asreview project."""
    if not Path(fp, 'project.json').is_file():
        raise ValueError(f"There is no 'project.json' file at {fp}.")
    else:
        return


@contextmanager
def open_state(working_dir, read_only=True):
    """Initialize a state class instance from a project folder.

    Arguments
    ---------
    fp: str
        Project folder.
    read_only: bool
        Whether to open in read_only mode.

    Returns
    -------
    SqlStateV1
    """
    # Check if file is a valid project folder.
    is_valid_project_folder(working_dir)

    # init state class
    state = SqlStateV1(read_only=read_only)

    # TODO(State): Check for 'history' folder instead of results.sql.
    try:
        if Path(working_dir, 'results.sql').is_file():
            state._restore(working_dir)
        elif not Path(working_dir, 'results.sql').is_file() and not read_only:
            state._create_new_state_file(working_dir)
        else:
            raise StateNotFoundError("State file does not exist")
        yield state
    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass


def read_results_into_dataframe(fp, table='results'):
    """Read the result table of a v3 state file into a pandas dataframe.

    Arguments
    ---------
    fp: str
        Project folder.
    table: str
        Name of the sql table in the results.sql that you want to read.

    Returns
    -------
    pd.DataFrame
        Dataframe containing contents of the results table of the state file.
    """
    path = Path(fp)
    con = sqlite3.connect(path / 'results.sql')
    df = pd.read_sql_query(f'SELECT * FROM {table}', con)
    con.close()
    return df


def decode_feature_matrix(jsonstate, data_hash):
    """Get the feature matrix from a json state as a scipy csr_matrix."""
    my_data = jsonstate._state_dict["data_properties"][data_hash]
    encoded_X = my_data["feature_matrix"]
    matrix_type = my_data["matrix_type"]
    if matrix_type == "ndarray":
        return csr_matrix(encoded_X)
    elif matrix_type == "csr_matrix":
        with BytesIO(b64decode(encoded_X)) as f:
            return load_npz(f)
    return encoded_X