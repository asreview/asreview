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


def is_old_project(fp):
    """Check if state file is old version."""
    if Path(fp, 'results.sql').is_file():
        raise ValueError(f"There already is a 'results.sql' file at {fp}")
    if not Path(fp, 'result.json').is_file():
        raise ValueError(f"There is no 'result.json' file at {fp}")


# TODO(State): Allow basic/full (i.e. save probabilities).
def convert_asreview(fp):
    """Convert an old asreview project folder to the new format.

    Arguments
    ---------
    fp: str/path
        Location of the (unzipped) project file.

    Returns
    -------
    Converts the data in the project to the new format
    and adds it to the folder in place."""
    # Check if it is indeed an old format project.
    is_old_project(fp)

    fp = Path(fp)
    # Path to the json state file in the asreview file.
    json_fp = fp / 'result.json'
    # Create sqlite table for results.
    sql_fp = fp / 'results.sql'
    convert_json_results_to_sql(sql_fp, json_fp)

    # Create sqlite tables 'last_probabilities'.
    convert_json_last_probabilities(sql_fp, json_fp)

    # Add the record table to the sqlite database as the table
    # 'record_table'.
    convert_json_record_table(sql_fp, json_fp)

    # Create json for settings.
    settings_metadata_fp = fp / 'settings_metadata.json'
    convert_json_settings_metadata(settings_metadata_fp, json_fp)

    # Create npz for feature matrix.
    feature_matrix_fp = fp / 'feature_matrix.npz'
    convert_json_feature_matrix(feature_matrix_fp, json_fp)


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
        data_dict['current_queries'] = json_state._state_dict[
            'current_queries']
        data_dict['state_version'] = V3STATE_VERSION
        data_dict['software_version'] = json_state._state_dict[
            'software_version']
    with open(fp, 'w') as f:
        json.dump(data_dict, f)


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
        last_probabilities = [(proba, ) for proba in last_probabilities]

        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()
            cur.execute("""CREATE TABLE last_probabilities
                            (proba REAL)""")
            cur.executemany(
                """INSERT INTO last_probabilities VALUES
                                        (?)""", last_probabilities)
            con.commit()


def get_json_state_data_hash(json_state):
    """Get the data hash from a json state."""
    return list(json_state._state_dict['data_properties'].keys())[0]


def get_json_record_table(json_state):
    """Get the record table from a json state."""
    data_hash = get_json_state_data_hash(json_state)
    record_table = json_state._state_dict['data_properties'][data_hash][
        'record_table']
    return record_table


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
        record_table = get_json_record_table(json_state)

    # Convert record_table to list of tuples.
    record_table = [(record_id, ) for record_id in record_table]

    con = sqlite3.connect(sql_fp)
    cur = con.cursor()
    cur.execute('''CREATE TABLE record_table
                    (record_ids INT)''')
    cur.executemany(
        """INSERT INTO record_table VALUES
                                (?)""", record_table)
    con.commit()
    con.close()


def convert_json_results_to_sql(sql_fp, json_fp):
    """Convert the result of a json state file to a sqlite database."""
    with open_state_legacy(json_fp, read_only=True) as sf:
        with sqlite3.connect(sql_fp) as con:
            cur = con.cursor()

            # Create the results table.
            cur.execute('''CREATE TABLE results
                            (record_ids INTEGER,
                            labels INTEGER, 
                            classifiers TEXT,
                            query_strategies TEXT,
                            balance_strategies TEXT,
                            feature_extraction TEXT,
                            training_sets INTEGER,
                            labeling_times INTEGER)''')
            # TODO(State): models_training?

            # Calculate the n_priors and the number of queries.
            sf_queries = range(1, len(sf._state_dict['results']))

            # Index (row number) of record being labeled.
            sf_indices = [
                int(sample_data[0])
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            # Record ids of the labeled records.
            record_table = get_json_record_table(sf)
            sf_record_ids = [int(record_table[idx]) for idx in sf_indices]

            # Label of record.
            sf_labels = [
                int(sample_data[1])
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            # query strategy.
            sf_query_strategy = [
                sample_data[2]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            n_priors = sf_query_strategy.count('prior')
            n_records_labeled = len(sf_indices)
            n_non_prior_records = n_records_labeled - n_priors

            # classifier.
            classifier = sf.settings.to_dict()['model']
            sf_classifiers = ['prior'] * n_priors + [
                f'{classifier}' for _ in range(n_non_prior_records)
            ]

            # training set.
            sf_training_sets = [-1] * n_priors + list(
                range(n_priors, n_records_labeled))

            # feature extraction.
            feature_extraction = sf.settings.to_dict()['feature_extraction']
            sf_feature_extraction = ['prior'] * n_priors + [
                f'{feature_extraction}' for _ in range(n_non_prior_records)
            ]

            # balance strategy.
            balance_strategy = sf.settings.to_dict()['balance_strategy']
            sf_balance_strategy = ['prior'] * n_priors + [
                f'{balance_strategy}' for _ in range(n_non_prior_records)
            ]

            # Labeling time.
            sf_time = [0 for _ in range(n_records_labeled)]

            # Check that all datasets have the same number of entries.
            lengths = [
                len(sf_record_ids),
                len(sf_labels),
                len(sf_classifiers),
                len(sf_training_sets),
                len(sf_query_strategy),
                len(sf_time),
                len(sf_feature_extraction),
                len(sf_balance_strategy)
            ]
            if not all([length == n_records_labeled for length in lengths]):
                raise StateError(
                    "All datasets should have the same number of entries.")

            # Create the database rows.
            db_rows = [
                (sf_record_ids[i], sf_labels[i], sf_classifiers[i],
                 sf_query_strategy[i], sf_balance_strategy[i],
                 sf_feature_extraction[i], sf_training_sets[i], sf_time[i])
                for i in range(n_records_labeled)
            ]
            cur.executemany(
                """INSERT INTO results VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
            con.commit()
