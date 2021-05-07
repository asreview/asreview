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
import sqlite3
from io import BytesIO
from base64 import b64decode

import h5py
import numpy as np
import pandas as pd
from scipy.sparse import load_npz
from scipy.sparse import csr_matrix

from asreview.config import STATE_EXTENSIONS
from asreview.state.errors import StateNotFoundError
from asreview.state.legacy.utils import open_state as open_state_legacy


V3STATE_VERSION = "1.1"


def _get_state_class(fp):
    """Get state class from file extension."""

    if fp is None:
        from asreview.state.legacy.dict import DictState
        return DictState

    state_ext = Path(fp).suffix
    if state_ext in ['.h5', '.hdf5', '.he5']:
        from asreview.state.hdf5 import HDF5State
        state_class = HDF5State
    elif state_ext in ['.json']:
        from asreview.state.legacy.json import JSONState
        state_class = JSONState
    elif state_ext in ['.asreview']:
        from asreview.state.hdf5 import HDF5State
        state_class = HDF5State
    else:
        state_class = None
    return state_class


@contextmanager
def open_state(fp, read_only=True):
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
        raise ValueError("State file extension not found, choose one of the"
                         f" following:\n   {', '.join(STATE_EXTENSIONS)}")

    # init state class
    state = state_class(read_only=read_only)

    try:
        if Path(fp).is_file():
            state._restore(fp)
        elif not Path(fp).is_file() and not read_only:
            state._create_new_state_file(fp)
        else:
            raise StateNotFoundError("State file does not exist")
        yield state
    finally:

        try:
            state.close()
        except AttributeError:
            # file seems to be closed, do nothing
            pass


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


# def state_from_file(data_fp):
#     """Obtain a single state from a file.

#     Arguments
#     ---------
#     data_fp: str
#         Path to state file or .asreview file.

#     Returns
#     -------
#     dict:
#         A dictionary of a single opened state, with its filename as key.
#     """
#     if not Path(data_fp).is_file():
#         logging.error(f"File {data_fp} does not exist, cannot create state.")
#         return None

#     if Path(data_fp).suffix == ".asreview":
#         base_state = state_from_asreview_file(data_fp)
#     elif Path(data_fp).suffix in STATE_EXTENSIONS:
#         base_state = _get_state_class(data_fp)(state_fp=data_fp, read_only=True)
#     else:
#         raise ValueError(f"Expected ASReview file or file {data_fp} with "
#                          f"extension {STATE_EXTENSIONS}.")

#     state = {
#         os.path.basename(os.path.normpath(data_fp)):
#         base_state
#     }
#     return state


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


def read_results_into_dataframe(asreview_fp, table='results'):
    """Read the result table of a v3 state file into a pandas dataframe.

    Arguments
    ---------
    asreview_fp: str/path-like
        Filepath to the v3 state file.
    table: str
        Name of the sql table in the results.sql that you want to read.

    Returns
    -------
    pd.DataFrame
        Dataframe containing contents of the results table of the state file.
    """
    tempdir = tempfile.TemporaryDirectory()
    path = Path(tempdir.name)
    with zipfile.ZipFile(asreview_fp) as file:
        file.extract('results.sql', path)
    con = sqlite3.connect(path / 'results.sql')
    df = pd.read_sql_query(f'SELECT * FROM {table}', con)
    con.close()
    return df


# TODO(State): If conversion fails, clean up created file.
# TODO(State): Split models_training into model and training_set.
def convert_h5_to_v3(v3state_fp, old_h5_state_fp, basic, proba_gap=1):
    """Create a prototype of the new state file from an old HDF5 state file.

    Arguments
    ---------
    v3state_fp: str
        Location where to create the new '.h5' state file.
    old_h5_state_fp: str
        Location of the existing HDF5 state file.
    basic: bool
        Make the basic version, or also include probabilities.
    proba_gap: int
        Interval between samples for which you save the model probabilities.

    Returns
    -------
    New version '.h5' state file at location of prototype_fp.
    """
    with open_state_legacy(old_h5_state_fp, read_only=True) as sf:
        with h5py.File(v3state_fp, 'w') as pt:
            # Copy data_properties and metadata/settings from state file.
            sf.f.copy('data_properties', pt['/'])

            # Current attributes are current_queries, end_time, settings,
            # start_time, version and software_version. Note that software
            # version is not actually available in old HDF5 state files.
            pt.attrs['version'] = np.string_(V3STATE_VERSION)
            pt.attrs['software_version'] = np.string_("")
            pt.attrs['start_time'] = np.datetime64(sf.f.attrs['start_time'].decode('utf-8')).astype(np.int64)
            pt.attrs['end_time'] = np.datetime64(sf.f.attrs['end_time'].decode('utf-8')).astype(np.int64)
            pt.attrs['current_queries'] = sf.f.attrs['current_queries']
            pt.attrs['settings'] = sf.f.attrs['settings']

            # Create the results group and set num priors as attribute.
            pt.create_group('results')
            sf_queries = range(1, len(sf.f['results'].keys()))
            n_priors = len(sf.f['results/0/new_labels/labels'][:])
            pt['results'].attrs['n_priors'] = n_priors

            # Index (row number) of sample being labeled.
            sf_indices = \
                list(sf.f['results/0/new_labels/idx'][:]) + \
                [sf.f[f'results/{i}/new_labels/idx'][0] for i in sf_queries]
            sf_indices = np.array(sf_indices)
            pt['results'].create_dataset('indices', data=sf_indices)

            # Label applied to sample.
            sf_labels = \
                list(sf.f['results/0/new_labels/labels'][:]) + \
                [sf.f[f'results/{i}/new_labels/labels'][0]
                 for i in sf_queries]
            sf_labels = np.array(sf_labels)
            pt['results'].create_dataset('labels', data=sf_labels)

            # Model that produced sample, indicated by a string.
            # NOTE: You need to force the dtype to 'S'. h5py does not support a
            # conversion from dtype='U'. Is it important to set a certain
            # length, like '|S20'?
            model = sf.settings.to_dict()['model']
            sf_predictor_models = ['initial'] * n_priors + [
                f'{model}' for _ in sf_queries
            ]
            sf_predictor_models = np.array(sf_predictor_models, dtype='S')
            pt['results'].create_dataset('predictor_models',
                                         data=sf_predictor_models)

            # Here training_set is indicated by an integer: '-1' means that the
            # there was no training set, i.e. for the prior data. '0' means trained
            # on the prior data, '1' means prior data + first sample, etc.
            sf_predictor_training_sets = [-1] * n_priors + [
                i-1 for i in sf_queries
            ]
            sf_predictor_training_sets = np.array(sf_predictor_training_sets, dtype=int)
            pt['results'].create_dataset('predictor_training_sets',
                                         data=sf_predictor_training_sets)

            # Prediction method used for sample.
            sf_predictor_methods = \
                list(sf.f['results/0/new_labels/methods'][:]) + \
                [sf.f[f'results/{i}/new_labels/methods'][0]
                 for i in sf_queries]
            sf_predictor_methods = np.array(sf_predictor_methods, dtype='S')
            pt['results'].create_dataset('predictor_methods',
                                         data=sf_predictor_methods)

            # Time of labeling. This is only relevant after the priors has been
            # entered so it starts at 0. Maybe it should start at 1?
            sf_time = [sf.f['results/0'].attrs['creation_time']] * n_priors + \
                      [sf.f[f'results/{i}'].attrs['creation_time']
                       for i in sf_queries]
            sf_time = [np.datetime64(labeling_time.decode('utf-8')).astype(np.int64) for labeling_time in sf_time]
            sf_time = np.array(sf_time, dtype=np.int64)
            pt['results'].create_dataset('labeling_times', data=sf_time)

            # Models being trained right after labeling. This is only relevant
            # after the priors have been entered, so it starts at 0. After the
            # last query has been labeled, all training is stopped, so the last
            # entry is 'NA'.
            # TODO: Can you split this into model-training set? You have multiple.
            sf_models_training = ['NA'] * (n_priors-1) + [f'{model}0'] + \
                                 [f'{model}{i}' for i in sf_queries[:-1]] + \
                                 ['NA']
            sf_models_training = np.array(sf_models_training, dtype='S')
            pt['results'].create_dataset('models_training',
                                         data=sf_models_training)

            if not basic:
                pt['results'].create_group('custom')
                # QUESTION: Indices of samples where probabilities are stored.
                # Should 0 be included?
                proba_col_index = [
                    num for num in sf_queries
                    if (num % proba_gap == 0) or sf_labels[num]
                ]
                proba_col_index = np.array(proba_col_index)
                pt['results/custom'].create_dataset(
                    'probabilities_column_index', data=proba_col_index)

                # Probabilities. Is the probability in query_i of '{model}{i}' or of
                # '{model}{i-1}'? Should you adjust number of decimals of floats?
                proba_cols = [
                    sf.f[f'results/{i}/proba'][:] for i in proba_col_index
                ]
                proba_matrix = np.column_stack(proba_cols)
                pt['results/custom'].create_dataset('probabilities',
                                                    data=proba_matrix)


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


def convert_json_to_v3(v3state_fp, jsonstate_fp, basic, proba_gap=1):
    """Create a prototype of the new state file from an old json state file.

    Arguments
    ---------
    v3state_fp: str
        Location where to create the new '.h5' state file.
    jsonstate_fp: str
        Location of the existing JSON state file.
    basic: bool
        Make the basic version, or also include probabilities.
    proba_gap: int
        Interval between samples for which you save the model probabilities.

    Returns
    -------
    New version '.h5' state file at location of v3state_fp.
    """
    with open_state_legacy(jsonstate_fp, read_only=True) as sf:
        with h5py.File(v3state_fp, 'w') as pt:
            # Copy data_properties and metadata/settings from state file.
            data_hash = list(sf._state_dict['data_properties'].keys())[0]
            sparse_mat = decode_feature_matrix(sf, data_hash)
            pt.create_group(f'data_properties/{data_hash}')
            data_prop_group = pt[f'data_properties/{data_hash}']
            data_prop_group.attrs['matrix_type'] = np.string_('csr_matrix')
            data_prop_group.create_dataset('indices', data=sparse_mat.indices)
            data_prop_group.create_dataset('indptr', data=sparse_mat.indptr)
            data_prop_group.create_dataset('shape', data=sparse_mat.shape)
            data_prop_group.create_dataset('data', data=sparse_mat.data)
            data_prop_group.create_dataset(
                'record_table',
                data=sf._state_dict['data_properties'][data_hash]
                ['record_table'])

            # Current attributes are current_queries, end_time, settings,
            # start_time and version.
            pt.attrs['settings'] = str(sf._state_dict['settings'])
            pt.attrs['start_time'] = \
                np.datetime64(sf._state_dict['time']['start_time']).astype(np.int64)
            pt.attrs['end_time'] =\
                np.datetime64(sf._state_dict['time']['end_time']).astype(np.int64)
            pt.attrs['current_queries'] = str(sf._state_dict['current_queries'])
            pt.attrs['version'] = np.string_(V3STATE_VERSION)
            pt.attrs['software_version'] = sf._state_dict['software_version']

            # Create the results group and set num priors as attribute.
            pt.create_group('results')
            sf_queries = range(1, len(sf._state_dict['results']))
            n_priors = len(sf._state_dict['results'][0]['labelled'])
            pt['results'].attrs['n_priors'] = n_priors

            # Index (row number) of sample being labeled.
            sf_indices = [
                sample_data[0]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]
            sf_indices = np.array(sf_indices)
            pt['results'].create_dataset('indices', data=sf_indices)

            # Label applied to sample.
            sf_labels = [
                sample_data[1]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]
            sf_labels = np.array(sf_labels)
            pt['results'].create_dataset('labels', data=sf_labels)

            # Model that produced sample, indicated by a string.
            # NOTE: You need to force the dtype to 'S'. h5py does not support a
            # conversion from dtype='U'. Is it important to set a certain
            # length, like '|S20'?
            model = sf.settings.to_dict()['model']
            sf_predictor_models = ['initial'] * n_priors + [
                f'{model}' for _ in sf_queries
            ]
            sf_predictor_models = np.array(sf_predictor_models, dtype='S')
            pt['results'].create_dataset('predictor_models',
                                         data=sf_predictor_models)

            # Here training_set is indicated by an integer: '-1' means that the
            # there was no training set, i.e. for the prior data. '0' means trained
            # on the prior data, '1' means prior data + first sample, etc.
            sf_predictor_training_sets = [-1] * n_priors + [
                i - 1 for i in sf_queries
            ]
            sf_predictor_training_sets = np.array(sf_predictor_training_sets, dtype=int)
            pt['results'].create_dataset('predictor_training_sets',
                                         data=sf_predictor_training_sets)

            # Prediction method used for sample.
            sf_predictor_methods = [
                sample_data[2]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]
            sf_predictor_methods = np.array(sf_predictor_methods, dtype='S')
            pt['results'].create_dataset('predictor_methods',
                                         data=sf_predictor_methods)

            # Time of labeling. This is only relevant after the priors have been
            # entered.
            sf_time = [0 for _ in range(len(sf._state_dict['results']) + n_priors - 1)]
            # I took the same data type as came out of the .h5 time part:
            sf_time = np.array(sf_time, dtype=np.int64)
            pt['results'].create_dataset('labeling_times', data=sf_time)

            # Models being trained right after labeling. This is only relevant
            # after the priors have been entered. After the
            # last query has been labeled, all training is stopped, so the last
            # entry is 'NA'.
            # TODO(State): Is this correct when converting a state file from a
            # partial review?
            sf_models_training = ['NA'] * (n_priors-1) + [f'{model}0'] + \
                                 [f'{model}{i}' for i in sf_queries[:-1]] + \
                                 ['NA']
            sf_models_training = np.array(sf_models_training, dtype='S')
            pt['results'].create_dataset('models_training',
                                         data=sf_models_training)

            if not basic:
                pt['results'].create_group('custom')
                # Indices of samples where probabilities are stored. Should 0 be
                # included?
                proba_col_index = [
                    num for num in sf_queries
                    if (num % proba_gap == 0) or sf_labels[num]
                ]
                proba_col_index = np.array(proba_col_index)
                pt['results/custom'].create_dataset(
                    'probabilities_column_index', data=proba_col_index)

                # Probabilities. Is the probability in query_i of '{model}{i}' or of
                # '{model}{i-1}'? Should you adjust number of decimals of floats?
                proba_cols = [
                    sf._state_dict['results'][i]['proba']
                    for i in proba_col_index
                ]
                proba_matrix = np.column_stack(proba_cols)
                pt['results/custom'].create_dataset('probabilities',
                                                    data=proba_matrix)



