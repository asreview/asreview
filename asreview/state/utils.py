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
import json
import time
from datetime import datetime
import shutil
from uuid import uuid4

import pandas as pd
from scipy.sparse import load_npz
from scipy.sparse import csr_matrix

from asreview._version import get_versions
from asreview.state.sqlstate import SqlStateV1
from asreview.state.errors import StateNotFoundError
from asreview.state.paths import get_data_path
from asreview.state.paths import get_reviews_path
from asreview.state.paths import get_feature_matrices_path
from asreview.state.paths import get_project_file_path

asreview_version = get_versions()['version']
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
        raise ValueError(f"There does not seem to be a valid project folder"
                         f" at {fp}. The 'reviews' or 'feature_matrices' "
                         f"folder is missing.")
    else:
        return


def init_project_folder_structure(project_path,
                                  project_id,
                                  project_mode="oracle",
                                  project_name=None,
                                  project_description=None,
                                  project_authors=None):
    """Initialize a project folder structure at the given filepath.

    Arguments
    ---------
    project_path: pathlike
        Filepath where to intialize the project folder structure.
    project_id: str
        Identifier of the project.
    project_mode: str
        Mode of the project. Should be 'oracle', 'explore' or 'simulate'.
    project_name: str
    project_description: str
    project_authors: str

    Returns
    -------
    dict
        Project configuration dictionary.
    """
    try:
        project_path = Path(project_path)
        project_path.mkdir(exist_ok=True)
        get_data_path(project_path).mkdir(exist_ok=True)
        get_feature_matrices_path(project_path).mkdir(exist_ok=True)
        get_reviews_path(project_path).mkdir(exist_ok=True)

        project_config = {
            'version': asreview_version,  # todo: Fail without git?
            'id': project_id,
            'mode': project_mode,
            'name': project_name,
            'description': project_description,
            'authors': project_authors,
            'created_at_unix': int(time.time()),

            # project related variables
            'datetimeCreated': str(datetime.now()),
            'projectInitReady': False,
            'reviewFinished': False,
            'reviews': [],
            'feature_matrices': []
        }

        # create a file with project info
        with open(get_project_file_path(project_path), "w") as project_path:
            json.dump(project_config, project_path)

        return project_config

    except Exception as err:
        # remove all generated folders and raise error
        shutil.rmtree(project_path)
        raise err


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
            init_project_folder_structure(working_dir, working_dir.name)
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

    # TODO(State): Check for 'history' folder instead of results.sql.
    try:
        if Path(get_reviews_path(working_dir), review_id).is_dir():
            state._restore(working_dir, review_id)
        elif not Path(get_reviews_path(working_dir), review_id).is_dir() \
                and not read_only:
            state._create_new_state_file(working_dir, review_id)
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
