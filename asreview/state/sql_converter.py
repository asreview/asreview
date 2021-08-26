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
from pathlib import Path
from uuid import uuid4

import numpy as np
from scipy.sparse import save_npz
from scipy.sparse import issparse

from asreview.state.legacy.utils import open_state as open_state_legacy
from asreview.state.utils import decode_feature_matrix
from asreview.state.errors import StateError

SQLSTATE_VERSION = "1.0"
ASREVIEW_FILE_EXTENSION = '.asreview'


def is_old_project(fp):
    """Check if state file is old version."""
    if Path(fp, 'reviews').is_dir():
        raise ValueError(f"There already is a 'reviews' folder at {fp}. "
                         f"This project seems to be in new format.")
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

    # Current Paths
    fp = Path(fp)
    json_fp = Path(fp, 'result.json')
    project_fp = Path(fp, 'project.json')
    review_id = str(uuid4().hex)

    # Create the reviews folder and the paths for the results and settings.
    Path(fp, 'reviews', review_id).mkdir(parents=True)
    sql_fp = str(Path(fp, 'reviews', review_id, 'results.sql'))
    settings_metadata_fp = Path(fp, 'reviews',
                                review_id, 'settings_metadata.json')

    # Create the path for the feature matrix.

    # Create sqlite table with the results of the review.
    convert_json_results_to_sql(sql_fp, json_fp)

    # Create sqlite tables 'last_probabilities'.
    convert_json_last_probabilities(sql_fp, json_fp)

    # Add the record table to the sqlite database as the table
    # 'record_table'.
    convert_json_record_table(sql_fp, json_fp)

    # Create json for settings.
    convert_json_settings_metadata(settings_metadata_fp, json_fp)

    # Create file for the feature matrix.
    with open(Path(fp, 'kwargs.json'), 'r') as f:
        kwargs_dict = json.load(f)
        feature_extraction_method = kwargs_dict['feature_extraction']
    feature_matrix_fp = convert_json_feature_matrix(fp, json_fp,
                                                    feature_extraction_method)

    # Update the project.json file.
    with open(json_fp, 'r') as f:
        start_time = json.load(f)['time']['start_time']
    convert_project_json(project_fp, review_id, start_time,
                         feature_matrix_fp, feature_extraction_method)


def convert_project_json(project_fp, review_id, start_time,
                         feature_matrix_fp, feature_extraction_method):
    """Update the project.json file to contain the review information , the
    feature matrix information and the new state version number.

    Arguments
    ---------
    project_fp: str/path
        Path to the project json file.
    review_id: str
        Identifier of the review.
    start_time: str
        String containing start time of the review.
    feature_matrix_fp: str/path
        Location of the feature matrix.
    feature_extraction_method: str
        Name of the feature extraction method.
    """
    with open(project_fp, 'r') as f:
        project_info = json.load(f)

    # Add the feature matrix information.
    feature_matrix_name = Path(feature_matrix_fp).name
    project_info['feature_matrices'] = [
        {
            'id': feature_extraction_method,
            'filename': feature_matrix_name
        }
    ]

    # Add the review information.
    project_info['reviews'] = [
        {
            'id': review_id,
            'start_time': start_time,
            'review_finished': project_info.get('reviewFinished', False)
        }
    ]

    # Update the state version.
    project_info['state_version'] = SQLSTATE_VERSION

    with open(project_fp, 'w') as f:
        json.dump(project_info, f)


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
        data_dict['state_version'] = SQLSTATE_VERSION
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


def convert_json_feature_matrix(fp,
                                json_fp,
                                feature_extraction_method):
    """Get the feature matrix from a json state file. Save it in the feature
    matrices folder. Format is .npz if the matrix is sparse and .npy if the
    matrix is dense.

    Arguments
    ---------
    fp: str/path
        Project folder.
    json_fp: str/path
        Path to the json state file.
    feature_extraction_method: str
        Name of the feature extraction method.

    Returns
    -------
    pathlib.Path
        Path where the feature matrix is saved.
    """
    feature_matrices_fp = Path(fp, 'feature_matrices')
    feature_matrices_fp.mkdir()

    with open_state_legacy(json_fp) as json_state:
        data_hash = get_json_state_data_hash(json_state)
        feature_matrix = decode_feature_matrix(json_state, data_hash)
        if issparse(feature_matrix):
            save_fp = Path(feature_matrices_fp,
                           f'{feature_extraction_method}_feature_matrix.npz')
            save_npz(save_fp, feature_matrix)
        else:
            save_fp = Path(feature_matrices_fp,
                           f'{feature_extraction_method}_feature_matrix.npy')
            np.save(save_fp, feature_matrix)

    return save_fp


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
