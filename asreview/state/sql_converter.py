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

import sqlite3
from pathlib import Path
from io import BytesIO
from base64 import b64decode

import h5py
import numpy as np
from scipy.sparse import load_npz
from scipy.sparse import save_npz
from scipy.sparse import csr_matrix

from asreview.state.legacy.utils import open_state as open_state_legacy
from asreview.state.utils import decode_feature_matrix
from asreview.state.errors import StateError


V3STATE_VERSION = "1.1"
ASREVIEW_FILE_EXTENSION = '.asreview'


def convert_h5(new_fp, old_fp, full_state=True):
    """Convert an h5 state file to a new type state file."""
    # Create temp folder at new location.
    path = Path(new_fp)
    if not path.suffix == ASREVIEW_FILE_EXTENSION:
        raise ValueError(f"File extension should be {ASREVIEW_FILE_EXTENSION}")
    path.mkdir()

    # Create sqlite table for results.
    results_fp = path / 'results.sql'
    convert_h5_results_to_sql(results_fp, old_fp)

    # Create sqlite table for last ranking.

    # Create json for settings.

    # Create npz for feature matrix.

    # If full state:
        # Create json for project info.

        # Create data folder.

    # Zip at


def get_json_state_data_hash(json_state):
    """Get the data hash from a json state."""
    return list(json_state._state_dict['data_properties'].keys())[0]


def convert_json_data_properties(feature_matrix_fp, results_fp, json_fp):
    """Get the feature matrix from a json state file as a sparse matrix
    and save at the feature_matrix_fp as a .npz file. Get the record table
    and save as a table .sql file at results_fp.

    Arguments
    ---------
    feature_matrix_fp: str/path
        Path where to save the feature matrix. Should have .npz suffix.
    results_fp: str/path
        Path where to save the record table. Should have a .sql suffix.
    json_fp: str/path
        Path to the json state file.
    """

    with open_state_legacy(json_fp) as json_state:
        data_hash = get_json_state_data_hash(json_state)
        feature_matrix = decode_feature_matrix(json_state, data_hash)
        record_table = json_state._state_dict['data_properties'][data_hash]['record_table']
        save_npz(feature_matrix_fp, feature_matrix)
        with sqlite3.connect(results_fp) as con:
            cur = con.cursor()
            cur.execute('''CREATE TABLE record_table
                            (records INT)''')
            cur.execute("""INSERT INTO record_table VALUES
                                        (?)""", record_table)


# TODO(State): Convert probabilities.
# TODO(State): Project file structure.
def convert_h5_results_to_sql(sql_fp, h5_fp):
    """Convert the results of a h5 state file to a sqlite database."""
    with open_state_legacy(h5_fp, read_only=True) as sf:
        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()

            # Create the results table.
            cur.execute('''CREATE TABLE results
                            (indices INTEGER, 
                            labels INTEGER, 
                            predictor_classifiers TEXT,
                            predictor_query_strategy TEXT,
                            predictor_balance_strategy TEXT,
                            predictor_feature_extraction TEXT,
                            predictor_training_sets INTEGER,
                            labeling_times TEXT)''')
            # TODO(State): models_training?

            # Calculate the n_priors and the number of queries.
            sf_queries = range(1, len(sf.f['results'].keys()))
            n_priors = len(sf.f['results/0/new_labels/labels'][:])
            n_records_labeled = n_priors + len(sf_queries)

            # Index (row number) of record being labeled.
            sf_indices = \
                list(sf.f['results/0/new_labels/idx'][:]) + \
                [sf.f[f'results/{i}/new_labels/idx'][0] for i in sf_queries]
            sf_indices = [int(idx) for idx in sf_indices]

            # Label of record.
            sf_labels = \
                list(sf.f['results/0/new_labels/labels'][:]) + \
                [sf.f[f'results/{i}/new_labels/labels'][0]
                 for i in sf_queries]
            sf_labels = [int(label) for label in sf_labels]

            # Predictor classifier.
            classifier = sf.settings.to_dict()['model']
            sf_predictor_classifiers = ['initial'] * n_priors + [
                f'{classifier}' for _ in sf_queries
            ]

            # Predictor training set.
            sf_predictor_training_sets = [-1] * n_priors + [
                i - 1 for i in sf_queries
            ]

            # Predictor query strategy.
            sf_predictor_query_strategy = \
                list(sf.f['results/0/new_labels/methods'][:]) + \
                [sf.f[f'results/{i}/new_labels/methods'][0]
                 for i in sf_queries]
            sf_predictor_query_strategy = [method.decode('utf-8') for method in sf_predictor_query_strategy]

            # Predictor feature extraction.
            feature_extraction = sf.settings.to_dict()['feature_extraction']
            sf_predictor_feature_extraction = ['initial'] * n_priors + [
                f'{feature_extraction}' for _ in sf_queries
            ]

            # Predictor balance strategy.
            balance_strategy = sf.settings.to_dict()['balance_strategy']
            sf_predictor_balance_strategy = ['initial'] * n_priors + [
                f'{balance_strategy}' for _ in sf_queries
            ]

            # Labeling time.
            sf_time = [sf.f['results/0'].attrs['creation_time']] * n_priors + \
                      [sf.f[f'results/{i}'].attrs['creation_time']
                       for i in sf_queries]
            sf_time = [np.datetime64(labeling_time.decode('utf-8')).astype(np.int64) for labeling_time in sf_time]
            sf_time = [int(time) for time in sf_time]

            # Check that all datasets have the same number of entries.
            lengths = [len(sf_indices), len(sf_labels), len(sf_predictor_classifiers), len(sf_predictor_training_sets),
                       len(sf_predictor_query_strategy), len(sf_time), len(sf_predictor_feature_extraction),
                       len(sf_predictor_balance_strategy)]
            if not all([length == n_records_labeled for length in lengths]):
                raise StateError("All datasets should have the same number of entries.")

            # Create the database rows.
            db_rows = [(sf_indices[i], sf_labels[i], sf_predictor_classifiers[i], sf_predictor_query_strategy[i],
                        sf_predictor_balance_strategy[i], sf_predictor_feature_extraction[i],
                        sf_predictor_training_sets[i], sf_time[i]) for i in range(n_records_labeled)]
            cur.executemany("""INSERT INTO results VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
            con.commit()


def convert_json_results_to_sql(sql_fp, json_fp):
    """Convert the result of a json state file to a sqlite database."""
    with open_state_legacy(json_fp, read_only=True) as sf:
        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()

            # Create the results table.
            cur.execute('''CREATE TABLE results
                            (indices INTEGER, 
                            labels INTEGER, 
                            predictor_classifiers TEXT,
                            predictor_query_strategy TEXT,
                            predictor_balance_strategy TEXT,
                            predictor_feature_extraction TEXT,
                            predictor_training_sets INTEGER,
                            labeling_times TEXT)''')
            # TODO(State): models_training?

            # Calculate the n_priors and the number of queries.
            sf_queries = range(1, len(sf._state_dict['results']))
            n_priors = len(sf._state_dict['results'][0]['labelled'])
            n_records_labeled = n_priors + len(sf_queries)

            # Index (row number) of record being labeled.
            sf_indices = [
                int(sample_data[0])
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]
            sf_indices = [int(idx) for idx in sf_indices]

            # Label of record.
            sf_labels = [
                int(sample_data[1])
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            # Predictor classifier.
            classifier = sf.settings.to_dict()['model']
            sf_predictor_classifiers = ['initial'] * n_priors + [
                f'{classifier}' for _ in sf_queries
            ]

            # Predictor training set.
            sf_predictor_training_sets = [-1] * n_priors + [
                i - 1 for i in sf_queries
            ]

            # Predictor query strategy.
            sf_predictor_query_strategy = [
                sample_data[2]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            # Predictor feature extraction.
            feature_extraction = sf.settings.to_dict()['feature_extraction']
            sf_predictor_feature_extraction = ['initial'] * n_priors + [
                f'{feature_extraction}' for _ in sf_queries
            ]

            # Predictor balance strategy.
            balance_strategy = sf.settings.to_dict()['balance_strategy']
            sf_predictor_balance_strategy = ['initial'] * n_priors + [
                f'{balance_strategy}' for _ in sf_queries
            ]

            # Labeling time.
            sf_time = [0 for _ in range(len(sf._state_dict['results']) + n_priors - 1)]

            # Check that all datasets have the same number of entries.
            lengths = [len(sf_indices), len(sf_labels), len(sf_predictor_classifiers), len(sf_predictor_training_sets),
                       len(sf_predictor_query_strategy), len(sf_time), len(sf_predictor_feature_extraction),
                       len(sf_predictor_balance_strategy)]
            if not all([length == n_records_labeled for length in lengths]):
                raise StateError("All datasets should have the same number of entries.")

            # Create the database rows.
            db_rows = [(sf_indices[i], sf_labels[i], sf_predictor_classifiers[i], sf_predictor_query_strategy[i],
                        sf_predictor_balance_strategy[i], sf_predictor_feature_extraction[i],
                        sf_predictor_training_sets[i], sf_time[i]) for i in range(n_records_labeled)]
            cur.executemany("""INSERT INTO results VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
            con.commit()


#
# def convert_h5_to_v3(v3state_fp, old_h5_state_fp, basic, proba_gap=1):
#     """Create a prototype of the new state file from an old HDF5 state file.
#
#     Arguments
#     ---------
#     v3state_fp: str
#         Location where to create the new '.h5' state file.
#     old_h5_state_fp: str
#         Location of the existing HDF5 state file.
#     basic: bool
#         Make the basic version, or also include probabilities.
#     proba_gap: int
#         Interval between samples for which you save the model probabilities.
#
#     Returns
#     -------
#     New version '.h5' state file at location of prototype_fp.
#     """
#     with open_state_legacy(old_h5_state_fp, read_only=True) as sf:
#         with h5py.File(v3state_fp, 'w') as pt:
#             # Copy data_properties and metadata/settings from state file.
#             sf.f.copy('data_properties', pt['/'])
#
#             # Current attributes are current_queries, end_time, settings,
#             # start_time, version and software_version. Note that software
#             # version is not actually available in old HDF5 state files.
#             pt.attrs['version'] = np.string_(V3STATE_VERSION)
#             pt.attrs['software_version'] = np.string_("")
#             pt.attrs['start_time'] = np.datetime64(sf.f.attrs['start_time'].decode('utf-8')).astype(np.int64)
#             pt.attrs['end_time'] = np.datetime64(sf.f.attrs['end_time'].decode('utf-8')).astype(np.int64)
#             pt.attrs['current_queries'] = sf.f.attrs['current_queries']
#             pt.attrs['settings'] = sf.f.attrs['settings']
#
#             # Create the results group and set num priors as attribute.
#             pt.create_group('results')
#             sf_queries = range(1, len(sf.f['results'].keys()))
#             n_priors = len(sf.f['results/0/new_labels/labels'][:])
#             pt['results'].attrs['n_priors'] = n_priors
#
#             # Index (row number) of sample being labeled.
#             sf_indices = \
#                 list(sf.f['results/0/new_labels/idx'][:]) + \
#                 [sf.f[f'results/{i}/new_labels/idx'][0] for i in sf_queries]
#             sf_indices = np.array(sf_indices)
#             pt['results'].create_dataset('indices', data=sf_indices)
#
#             # Label applied to sample.
#             sf_labels = \
#                 list(sf.f['results/0/new_labels/labels'][:]) + \
#                 [sf.f[f'results/{i}/new_labels/labels'][0]
#                  for i in sf_queries]
#             sf_labels = np.array(sf_labels)
#             pt['results'].create_dataset('labels', data=sf_labels)
#
#             # Model that produced sample, indicated by a string.
#             # NOTE: You need to force the dtype to 'S'. h5py does not support a
#             # conversion from dtype='U'. Is it important to set a certain
#             # length, like '|S20'?
#             model = sf.settings.to_dict()['model']
#             sf_predictor_models = ['initial'] * n_priors + [
#                 f'{model}' for _ in sf_queries
#             ]
#             sf_predictor_models = np.array(sf_predictor_models, dtype='S')
#             pt['results'].create_dataset('predictor_models',
#                                          data=sf_predictor_models)
#
#             # Here training_set is indicated by an integer: '-1' means that the
#             # there was no training set, i.e. for the prior data. '0' means trained
#             # on the prior data, '1' means prior data + first sample, etc.
#             sf_predictor_training_sets = [-1] * n_priors + [
#                 i-1 for i in sf_queries
#             ]
#             sf_predictor_training_sets = np.array(sf_predictor_training_sets, dtype=int)
#             pt['results'].create_dataset('predictor_training_sets',
#                                          data=sf_predictor_training_sets)
#
#             # Prediction method used for sample.
#             sf_predictor_methods = \
#                 list(sf.f['results/0/new_labels/methods'][:]) + \
#                 [sf.f[f'results/{i}/new_labels/methods'][0]
#                  for i in sf_queries]
#             sf_predictor_methods = np.array(sf_predictor_methods, dtype='S')
#             pt['results'].create_dataset('predictor_methods',
#                                          data=sf_predictor_methods)
#
#             # Time of labeling. This is only relevant after the priors has been
#             # entered so it starts at 0. Maybe it should start at 1?
#             sf_time = [sf.f['results/0'].attrs['creation_time']] * n_priors + \
#                       [sf.f[f'results/{i}'].attrs['creation_time']
#                        for i in sf_queries]
#             sf_time = [np.datetime64(labeling_time.decode('utf-8')).astype(np.int64) for labeling_time in sf_time]
#             sf_time = np.array(sf_time, dtype=np.int64)
#             pt['results'].create_dataset('labeling_times', data=sf_time)
#
#             # Models being trained right after labeling. This is only relevant
#             # after the priors have been entered, so it starts at 0. After the
#             # last query has been labeled, all training is stopped, so the last
#             # entry is 'NA'.
#             # TODO: Can you split this into model-training set? You have multiple.
#             sf_models_training = ['NA'] * (n_priors-1) + [f'{model}0'] + \
#                                  [f'{model}{i}' for i in sf_queries[:-1]] + \
#                                  ['NA']
#             sf_models_training = np.array(sf_models_training, dtype='S')
#             pt['results'].create_dataset('models_training',
#                                          data=sf_models_training)
#
#             if not basic:
#                 pt['results'].create_group('custom')
#                 # QUESTION: Indices of samples where probabilities are stored.
#                 # Should 0 be included?
#                 proba_col_index = [
#                     num for num in sf_queries
#                     if (num % proba_gap == 0) or sf_labels[num]
#                 ]
#                 proba_col_index = np.array(proba_col_index)
#                 pt['results/custom'].create_dataset(
#                     'probabilities_column_index', data=proba_col_index)
#
#                 # Probabilities. Is the probability in query_i of '{model}{i}' or of
#                 # '{model}{i-1}'? Should you adjust number of decimals of floats?
#                 proba_cols = [
#                     sf.f[f'results/{i}/proba'][:] for i in proba_col_index
#                 ]
#                 proba_matrix = np.column_stack(proba_cols)
#                 pt['results/custom'].create_dataset('probabilities',
#                                                     data=proba_matrix)
#
#
# def decode_feature_matrix(jsonstate, data_hash):
#     """Get the feature matrix from a json state as a scipy csr_matrix."""
#     my_data = jsonstate._state_dict["data_properties"][data_hash]
#     encoded_X = my_data["feature_matrix"]
#     matrix_type = my_data["matrix_type"]
#     if matrix_type == "ndarray":
#         return csr_matrix(encoded_X)
#     elif matrix_type == "csr_matrix":
#         with BytesIO(b64decode(encoded_X)) as f:
#             return load_npz(f)
#     return encoded_X
#
#
#
#
#
# def convert_json_to_v3(v3state_fp, jsonstate_fp, basic, proba_gap=1):
#     """Create a prototype of the new state file from an old json state file.
#
#     Arguments
#     ---------
#     v3state_fp: str
#         Location where to create the new '.h5' state file.
#     jsonstate_fp: str
#         Location of the existing JSON state file.
#     basic: bool
#         Make the basic version, or also include probabilities.
#     proba_gap: int
#         Interval between samples for which you save the model probabilities.
#
#     Returns
#     -------
#     New version '.h5' state file at location of prototype_fp.
#     """
#     with open_state_legacy(jsonstate_fp, read_only=True) as sf:
#         with h5py.File(v3state_fp, 'w') as pt:
#             # Copy data_properties and metadata/settings from state file.
#             data_hash = list(sf._state_dict['data_properties'].keys())[0]
#             sparse_mat = decode_feature_matrix(sf, data_hash)
#             pt.create_group(f'data_properties/{data_hash}')
#             data_prop_group = pt[f'data_properties/{data_hash}']
#             data_prop_group.attrs['matrix_type'] = np.string_('csr_matrix')
#             data_prop_group.create_dataset('indices', data=sparse_mat.indices)
#             data_prop_group.create_dataset('indptr', data=sparse_mat.indptr)
#             data_prop_group.create_dataset('shape', data=sparse_mat.shape)
#             data_prop_group.create_dataset('data', data=sparse_mat.data)
#             data_prop_group.create_dataset(
#                 'record_table',
#                 data=sf._state_dict['data_properties'][data_hash]
#                 ['record_table'])
#
#             # Current attributes are current_queries, end_time, settings,
#             # start_time and version.
#             pt.attrs['settings'] = str(sf._state_dict['settings'])
#             pt.attrs['start_time'] = \
#                 np.datetime64(sf._state_dict['time']['start_time']).astype(np.int64)
#             pt.attrs['end_time'] =\
#                 np.datetime64(sf._state_dict['time']['end_time']).astype(np.int64)
#             pt.attrs['current_queries'] = str(sf._state_dict['current_queries'])
#             pt.attrs['version'] = np.string_(V3STATE_VERSION)
#             pt.attrs['software_version'] = sf._state_dict['software_version']
#
#             # Create the results group and set num priors as attribute.
#             pt.create_group('results')
#             sf_queries = range(1, len(sf._state_dict['results']))
#             n_priors = len(sf._state_dict['results'][0]['labelled'])
#             pt['results'].attrs['n_priors'] = n_priors
#
#             # Index (row number) of sample being labeled.
#             sf_indices = [
#                 sample_data[0]
#                 for query in range(len(sf._state_dict['results']))
#                 for sample_data in sf._state_dict['results'][query]['labelled']
#             ]
#             sf_indices = np.array(sf_indices)
#             pt['results'].create_dataset('indices', data=sf_indices)
#
#             # Label applied to sample.
#             sf_labels = [
#                 sample_data[1]
#                 for query in range(len(sf._state_dict['results']))
#                 for sample_data in sf._state_dict['results'][query]['labelled']
#             ]
#             sf_labels = np.array(sf_labels)
#             pt['results'].create_dataset('labels', data=sf_labels)
#
#             # Model that produced sample, indicated by a string.
#             # NOTE: You need to force the dtype to 'S'. h5py does not support a
#             # conversion from dtype='U'. Is it important to set a certain
#             # length, like '|S20'?
#             model = sf.settings.to_dict()['model']
#             sf_predictor_models = ['initial'] * n_priors + [
#                 f'{model}' for _ in sf_queries
#             ]
#             sf_predictor_models = np.array(sf_predictor_models, dtype='S')
#             pt['results'].create_dataset('predictor_models',
#                                          data=sf_predictor_models)
#
#             # Here training_set is indicated by an integer: '-1' means that the
#             # there was no training set, i.e. for the prior data. '0' means trained
#             # on the prior data, '1' means prior data + first sample, etc.
#             sf_predictor_training_sets = [-1] * n_priors + [
#                 i - 1 for i in sf_queries
#             ]
#             sf_predictor_training_sets = np.array(sf_predictor_training_sets, dtype=int)
#             pt['results'].create_dataset('predictor_training_sets',
#                                          data=sf_predictor_training_sets)
#
#             # Prediction method used for sample.
#             sf_predictor_methods = [
#                 sample_data[2]
#                 for query in range(len(sf._state_dict['results']))
#                 for sample_data in sf._state_dict['results'][query]['labelled']
#             ]
#             sf_predictor_methods = np.array(sf_predictor_methods, dtype='S')
#             pt['results'].create_dataset('predictor_methods',
#                                          data=sf_predictor_methods)
#
#             # Time of labeling. This is only relevant after the priors have been
#             # entered.
#             sf_time = [0 for _ in range(len(sf._state_dict['results']) + n_priors - 1)]
#             # I took the same data type as came out of the .h5 time part:
#             sf_time = np.array(sf_time, dtype=np.int64)
#             pt['results'].create_dataset('labeling_times', data=sf_time)
#
#             # Models being trained right after labeling. This is only relevant
#             # after the priors have been entered. After the
#             # last query has been labeled, all training is stopped, so the last
#             # entry is 'NA'.
#             # TODO(State): Is this correct when converting a state file from a
#             # partial review?
#             sf_models_training = ['NA'] * (n_priors-1) + [f'{model}0'] + \
#                                  [f'{model}{i}' for i in sf_queries[:-1]] + \
#                                  ['NA']
#             sf_models_training = np.array(sf_models_training, dtype='S')
#             pt['results'].create_dataset('models_training',
#                                          data=sf_models_training)
#
#             if not basic:
#                 pt['results'].create_group('custom')
#                 # Indices of samples where probabilities are stored. Should 0 be
#                 # included?
#                 proba_col_index = [
#                     num for num in sf_queries
#                     if (num % proba_gap == 0) or sf_labels[num]
#                 ]
#                 proba_col_index = np.array(proba_col_index)
#                 pt['results/custom'].create_dataset(
#                     'probabilities_column_index', data=proba_col_index)
#
#                 # Probabilities. Is the probability in query_i of '{model}{i}' or of
#                 # '{model}{i-1}'? Should you adjust number of decimals of floats?
#                 proba_cols = [
#                     sf._state_dict['results'][i]['proba']
#                     for i in proba_col_index
#                 ]
#                 proba_matrix = np.column_stack(proba_cols)
#                 pt['results/custom'].create_dataset('probabilities',
#                                                     data=proba_matrix)
#
#
#
