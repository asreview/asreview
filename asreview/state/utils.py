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

import json
import shutil
import sqlite3
import time
from base64 import b64decode
from contextlib import contextmanager
from datetime import datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pandas as pd
from scipy.sparse import csr_matrix
from scipy.sparse import load_npz

from asreview.state.errors import StateNotFoundError
from asreview.state.paths import get_data_path
from asreview.state.paths import get_feature_matrices_path
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_reviews_path
from asreview.state.sqlstate import SqlStateV1
from asreview.project import ASReviewProject


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
    if not Path(fp, 'reviews').is_dir() \
            or not Path(fp, 'feature_matrices').is_dir():
        raise StateNotFoundError(
            f"There does not seem to be a valid project folder at {fp}. The "
            f"'reviews' or 'feature_matrices' folder is missing.")
    else:
        return


@contextmanager
def open_state(working_dir, review_id=None, read_only=True):
    """Initialize a state class instance from a project folder.

    Arguments
    ---------
    working_dir: str/pathlike
        Filepath to the (unzipped) project folder.
    review_id: str
        Identifier of the review from which the state will be instantiated.
        If none is given, the first review in the reviews folder will be taken.
    read_only: bool
        Whether to open in read_only mode.

    Returns
    -------
    SqlStateV1
    """
    working_dir = Path(working_dir)

    if not get_reviews_path(working_dir).is_dir():
        if read_only:
            raise StateNotFoundError(f"There is no valid project folder"
                                     f" at {working_dir}")
        else:
            ASReviewProject.create(working_dir)
            review_id = uuid4().hex

    # Check if file is a valid project folder.
    is_valid_project_folder(working_dir)

    # Get the review_id of the first review if none is given.
    # If there is no review yet, create a review id.
    if review_id is None:
        reviews = list(get_reviews_path(working_dir).iterdir())
        if reviews:
            review_id = reviews[0].name
        else:
            review_id = uuid4().hex

    # init state class
    state = SqlStateV1(read_only=read_only)

    try:
        if Path(get_reviews_path(working_dir), review_id).is_dir():
            state._restore(working_dir, review_id)
        elif not Path(get_reviews_path(working_dir), review_id).is_dir() \
                and not read_only:
            state._create_new_state_file(working_dir, review_id)
        else:
            raise StateNotFoundError("State file does not exist, and in "
                                     "read only mode.")
        yield state
    finally:
        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass


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
