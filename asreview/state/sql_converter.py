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
import sqlite3
import zipfile
import tempfile
from pathlib import Path

import numpy as np
from scipy.sparse import save_npz

from asreview.state.legacy.utils import open_state as open_state_legacy
from asreview.state.utils import decode_feature_matrix
from asreview.state.errors import StateError


V3STATE_VERSION = "1.0"
ASREVIEW_FILE_EXTENSION = '.asreview'


# TODO(State): Allow basic/full (i.e. save probabilities).
def convert_asreview(asreview_fp):
    """Convert a .asreview project file to a V3 state file.

    Arguments
    ---------
    asreview_fp: str/path
        Location of the .asreview project file.

    Returns
    -------
    Converts the data in the .asreview file to the new format
    and appends it to file."""
    # Extract the data in the .asreview file to a temporary folder.
    with zipfile.ZipFile(asreview_fp, "r") as zipObj:
        tmpdir = tempfile.TemporaryDirectory()
        path = Path(tmpdir.name)
        zipObj.extractall(path)

    # Path to the json state file in the asreview file.
    json_fp = path / 'result.json'
    # Create sqlite table for results.
    sql_fp = path / 'results.sql'
    convert_json_results_to_sql(sql_fp, json_fp)

    # TODO: Add ranking.
    # Create sqlite tables 'last_probabilities' and 'last_ranking'.
    convert_json_last_probabilities(sql_fp, json_fp)
    # convert_json_last_ranking(sql_fp, json_fp)

    # Add the record table to the sqlite database as the table
    # 'record_table'.
    convert_json_record_table(sql_fp, json_fp)

    # Create json for settings.
    settings_metadata_fp = path / 'settings_metadata.json'
    convert_json_settings_metadata(settings_metadata_fp, json_fp)

    # Create npz for feature matrix.
    feature_matrix_fp = path / 'feature_matrix.npz'
    convert_json_feature_matrix(feature_matrix_fp, json_fp)

    # Write the new files back to the .asreview file.
    with zipfile.ZipFile(asreview_fp, "a") as zipObj:
        zipObj.write(sql_fp, 'results.sql')
        zipObj.write(settings_metadata_fp, 'settings_metadata.json')
        zipObj.write(feature_matrix_fp, 'feature_matrix.npz')


def convert_json_settings_metadata(fp, json_fp):
    """Get the settings and metadata from a json state and save it as
    a json file at the location given by fp.

    Arguments
    ---------
    fp: str/path
        Path where to save the json file.
    json_fp: str/path
        Path to the json state file.
    """
    data_dict = {}
    with open_state_legacy(json_fp) as json_state:
        data_dict['settings'] = json_state._state_dict['settings']
        data_dict['start_time'] = \
            int(np.datetime64(json_state._state_dict['time']['start_time']).astype(np.int64))
        data_dict['end_time'] = \
            int(np.datetime64(json_state._state_dict['time']['end_time']).astype(np.int64))
        data_dict['current_queries'] = json_state._state_dict['current_queries']
        data_dict['version'] = V3STATE_VERSION
        data_dict['software_version'] = json_state._state_dict['software_version']
    json.dump(data_dict, open(fp, 'w'))


def convert_json_last_probabilities(sql_fp, json_fp):
    """Get the last ranking from a json state and save it as the table
    'last_probabilities' in the .sql file at the location of sql_fp.

    Arguments
    ---------
    sql_fp: str/path
        Path where to save the record table. Should be a .sql file.
    json_fp: str/path
        Path to the json state file.
    """
    with open_state_legacy(json_fp) as json_state:
        # Get the last predicted probabilities from the state file.
        last_probabilities = json_state.pred_proba

        # Put them in the format for input in the sqlite database.
        last_probabilities = [(proba,) for proba in last_probabilities]

        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()
            cur.execute("""CREATE TABLE last_probabilities
                            (proba REAL)""")
            cur.executemany("""INSERT INTO last_probabilities VALUES
                                        (?)""", last_probabilities)
            con.commit()


# def convert_json_last_ranking(sql_fp, json_fp):
#     pass

def get_json_state_data_hash(json_state):
    """Get the data hash from a json state."""
    return list(json_state._state_dict['data_properties'].keys())[0]


def convert_json_feature_matrix(feature_matrix_fp, json_fp):
    """Get the feature matrix from a json state file as a sparse matrix
        and save at the feature_matrix_fp as a .npz file.

    Arguments
    ---------
    feature_matrix_fp: str/path
        Path where to save the feature matrix. If this string does not have the
        .npz extension it will be added automatically.
    json_fp: str/path
        Path to the json state file.
    """
    with open_state_legacy(json_fp) as json_state:
        data_hash = get_json_state_data_hash(json_state)
        feature_matrix = decode_feature_matrix(json_state, data_hash)
        save_npz(feature_matrix_fp, feature_matrix)


def convert_json_record_table(sql_fp, json_fp):
    """Get the record table and save as the table 'record_table'
    in the .sql file at results_fp.

    Arguments
    ---------
    sql_fp: str/path
        Path where to save the record table. Should be a .sql file.
    json_fp: str/path
        Path to the json state file.
    """

    with open_state_legacy(json_fp) as json_state:
        data_hash = get_json_state_data_hash(json_state)
        record_table = json_state._state_dict['data_properties'][data_hash]['record_table']

        # Convert record_table to list of tuples.
        record_table = [(record_id, ) for record_id in record_table]

        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()
            cur.execute('''CREATE TABLE record_table
                            (record_ids INT)''')
            cur.executemany("""INSERT INTO record_table VALUES
                                        (?)""", record_table)
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
                            predictor_query_strategies TEXT,
                            predictor_balance_strategies TEXT,
                            predictor_feature_extraction TEXT,
                            predictor_training_sets INTEGER,
                            labeling_times TEXT)''')
            # TODO(State): models_training?

            # Calculate the n_priors and the number of queries.
            sf_queries = range(1, len(sf._state_dict['results']))

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

            # Predictor query strategy.
            sf_predictor_query_strategy = [
                sample_data[2]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            n_priors = sf_predictor_query_strategy.count('prior')
            n_records_labeled = len(sf_indices)
            n_non_prior_records = n_records_labeled - n_priors

            # Predictor classifier.
            classifier = sf.settings.to_dict()['model']
            sf_predictor_classifiers = ['initial'] * n_priors + [
                f'{classifier}' for _ in range(n_non_prior_records)
            ]

            # Predictor training set.
            sf_predictor_training_sets = [-1] * n_priors + [
                i - 1 for i in range(n_non_prior_records)
            ]

            # Predictor feature extraction.
            feature_extraction = sf.settings.to_dict()['feature_extraction']
            sf_predictor_feature_extraction = ['initial'] * n_priors + [
                f'{feature_extraction}' for _ in range(n_non_prior_records)
            ]

            # Predictor balance strategy.
            balance_strategy = sf.settings.to_dict()['balance_strategy']
            sf_predictor_balance_strategy = ['initial'] * n_priors + [
                f'{balance_strategy}' for _ in range(n_non_prior_records)
            ]

            # Labeling time.
            sf_time = [0 for _ in range(n_records_labeled)]

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
                            predictor_query_strategies TEXT,
                            predictor_balance_strategies TEXT,
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
            lengths = [len(sf_indices), len(sf_labels), len(sf_predictor_classifiers),
                       len(sf_predictor_training_sets),
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
