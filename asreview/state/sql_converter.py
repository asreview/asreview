# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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
from datetime import datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse import issparse
from scipy.sparse import load_npz
from scipy.sparse import save_npz

from asreview._version import get_versions
from asreview.state.errors import StateError
from asreview.state.legacy.utils import open_state as open_state_legacy

SQLSTATE_VERSION = "1.0"
ASREVIEW_FILE_EXTENSION = '.asreview'


def is_old_project(fp):
    """Check if state file is old version."""
    if Path(fp, 'reviews').is_dir():
        return False
    else:
        return True


def get_old_project_status(config):

    # project is marked as finished
    if config.get('reviewFinished', False):
        return "finished"

    # project init is not ready
    if "projectInitReady" in config and not config["projectInitReady"]:
        return "setup"

    # project init flag is not available
    if "projectInitReady" not in config:
        if "projectHasPriorKnowledge" in config:
            if config["projectHasPriorKnowledge"]:
                return "review"
            else:
                return "setup"

    return "review"


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


def upgrade_asreview_project_file(fp, from_version=0, to_version=1):
    """Convert an old asreview project folder to the new format.

    Arguments
    ---------
    fp: str/path
        Location of the (unzipped) project file.

    Returns
    -------
    Converts the data in the project to the new format
    and adds it to the folder in place."""

    if from_version != 0 and to_version != 1:
        raise ValueError(
            f"Not possible to upgrade from v{from_version} to v{to_version}.")

    # Check if it is indeed an old format project.
    if not is_old_project(fp):
        raise ValueError(f"There already is a 'reviews' folder at {fp}. "
                         f"This project seems to be in new format.")

    # Current Paths
    fp = Path(fp)
    legacy_fp = Path(fp, 'legacy')
    move_old_files_to_legacy_folder(fp)

    # Current paths.
    json_fp = Path(legacy_fp, 'result.json')
    labeled_json_fp = Path(legacy_fp, 'labeled.json')
    pool_fp = Path(legacy_fp, 'pool.json')
    kwargs_fp = Path(legacy_fp, 'kwargs.json')
    review_id = str(uuid4().hex)

    # Create the reviews folder and the paths for the results and settings.
    Path(fp, 'reviews', review_id).mkdir(parents=True)
    sql_fp = str(Path(fp, 'reviews', review_id, 'results.sql'))
    settings_metadata_fp = Path(fp, 'reviews', review_id,
                                'settings_metadata.json')

    # Create the path for the feature matrix.

    # Create sqlite table with the results of the review.
    convert_json_results_to_sql(sql_fp, json_fp, labeled_json_fp)

    # Create sqlite tables 'last_probabilities'.
    convert_json_last_probabilities(sql_fp, json_fp)

    # Create the table for the last ranking of the model.
    create_last_ranking_table(sql_fp, pool_fp, kwargs_fp, json_fp)

    # Add the record table to the sqlite database as the table 'record_table'.
    convert_json_record_table(sql_fp, json_fp)

    # Create decision changes table.
    create_decision_changes_table(sql_fp)

    # Create json for settings.
    convert_json_settings_metadata(settings_metadata_fp, json_fp)

    # Create file for the feature matrix.
    with open(kwargs_fp, 'r') as f:
        kwargs_dict = json.load(f)
        feature_extraction_method = kwargs_dict['feature_extraction']
    feature_matrix_fp = convert_json_feature_matrix(fp, json_fp,
                                                    feature_extraction_method)

    # --- Upgrade the project.json file.

    # extract the start time from the state json
    with open(json_fp, 'r') as f:
        start_time = json.load(f)['time']['start_time']
        start_time = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S.%f")

    # open the project json and upgrade
    with open(Path(fp, 'project.json'), 'r') as f:
        project_config_old = json.load(f)

    project_config_new = upgrade_project_config(project_config_old, review_id,
                                                start_time,
                                                Path(feature_matrix_fp).name,
                                                feature_extraction_method)

    # dump the project json
    with open(Path(fp, 'project.json'), 'w') as f:
        json.dump(project_config_new, f)


def move_old_files_to_legacy_folder(fp):
    """Move the old files to a legacy folder.

    Arguments
    ----------
    fp: pathlib.Path
        Location of the (unzipped) project file.

    Returns
    -------
    Creates a folder 'legacy' in the project file, moves all current files to
    this legacy folder, and keeps a copy of 'project.json' and the data folder
    at the original place.
    """

    project_content = list(fp.iterdir())

    # copy to legacy folder
    shutil.copytree(fp, Path(fp, 'legacy'))

    # remove files and folders
    files_to_keep = ['project.json', 'data', 'lock.sqlite']

    for f in project_content:
        if f.name not in files_to_keep:
            if f.is_file():
                f.unlink()
            elif f.is_dir():
                shutil.rmtree(f)
            else:
                pass


def upgrade_project_config(config,
                           review_id=None,
                           start_time=None,
                           feature_matrix_name=None,
                           feature_extraction_method=None):
    """Update the project.json file to contain the review information , the
    feature matrix information and the new state version number.

    Arguments
    ---------
    config: str/path
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

    start_time_s = str(start_time) if start_time else None

    # Add the review information.
    config['reviews'] = [{
        'id': review_id,
        'start_time': start_time_s,
        'status': get_old_project_status(config)
    }]

    # Add the feature matrix information.
    config['feature_matrices'] = [{
        'id': feature_extraction_method,
        'filename': feature_matrix_name
    }]

    # Add the project mode.
    config['mode'] = config.get('mode', 'oracle')

    # Update the state version.
    config['version'] = get_versions()['version']
    config['state_version'] = SQLSTATE_VERSION

    # set created_at_unix to start time (empty: None)
    if "created_at_unix" not in config:
        try:
            config["created_at_unix"] = time.mktime(
                start_time.timetuple()
            )
        except Exception:
            config["created_at_unix"] = None

    config["datetimeCreated"] = start_time_s

    # delete deprecated metadata
    config.pop("projectInitReady", None)
    config.pop("projectHasPriorKnowledge", None)
    config.pop("projectHasDataset", None)

    return config


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
        # The 'triple' balance strategy is no longer implemented.
        if data_dict['settings']['balance_strategy'] == 'triple':
            data_dict['settings']['balance_strategy'] = 'double'
        data_dict['state_version'] = SQLSTATE_VERSION
        data_dict['software_version'] = json_state._state_dict[
            'software_version']
        data_dict['model_has_trained'] = True

        # remove the outdated mode
        data_dict.pop("mode", None)

    with open(fp, 'w') as f:
        json.dump(data_dict, f)


def create_last_ranking_table(sql_fp, pool_fp, kwargs_fp, json_fp):
    """Create the table which will contain the ranking of the last iteration of
    the model.

    Arguments
    ---------
    sql_fp: str/path
        Path where to save the record table. Should be a .sql file.
    """

    with open(pool_fp) as f_pool:
        pool_ranking = json.load(f_pool)

    with open(kwargs_fp, 'r') as f_kwargs:
        kwargs_dict = json.load(f_kwargs)

    # Add the record_ids not found in the pool to the end of the ranking.
    with open_state_legacy(json_fp) as json_state:
        record_table = get_json_record_table(json_state)
    records_not_in_pool = [
        record_id for record_id in record_table
        if record_id not in pool_ranking
    ]
    pool_ranking += records_not_in_pool

    # Convert the records in the pool to the new record ids (starting from 0).
    old_to_new_record_ids = {old_id: idx
                             for idx, old_id in enumerate(record_table)}
    pool_ranking = [old_to_new_record_ids[record] for record in pool_ranking]

    # Set the training set to -1 (prior) for records from old pool.
    training_set = -1
    time = None

    last_ranking = [(v, i, kwargs_dict['model'], kwargs_dict['query_strategy'],
                     kwargs_dict['balance_strategy'],
                     kwargs_dict['feature_extraction'], training_set, time)
                    for i, v in enumerate(pool_ranking)]

    with sqlite3.connect(sql_fp) as con:
        cur = con.cursor()

        # Create the last_ranking table.
        cur.execute('''CREATE TABLE last_ranking
                        (record_id INTEGER,
                        ranking INT,
                        classifier TEXT,
                        query_strategy TEXT,
                        balance_strategy TEXT,
                        feature_extraction TEXT,
                        training_set INTEGER,
                        time INTEGER)''')
        cur.executemany(
            """INSERT INTO last_ranking VALUES
                                    (?, ?, ?, ?, ?, ?, ?, ?)""", last_ranking)
        con.commit()


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
        # Also get the number of record labeled and the classifier.
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


def convert_json_feature_matrix(fp, json_fp, feature_extraction_method):
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
    record_table = [(record_id, ) for record_id in range(len(record_table))]

    con = sqlite3.connect(sql_fp)
    cur = con.cursor()
    cur.execute('''CREATE TABLE record_table
                    (record_id INT)''')
    cur.executemany(
        """INSERT INTO record_table VALUES
                                (?)""", record_table)
    con.commit()
    con.close()


def convert_json_results_to_sql(sql_fp, json_fp, labeled_json_fp):
    """Convert the result of a json state file to a sqlite database."""
    with open_state_legacy(json_fp, read_only=True) as sf:
        with sqlite3.connect(sql_fp) as con:
            with open(labeled_json_fp, 'r') as file:
                labeled_json = json.load(file)

            cur = con.cursor()

            # Create the results table.
            cur.execute('''CREATE TABLE results
                            (record_id INTEGER,
                            label INTEGER,
                            classifier TEXT,
                            query_strategy TEXT,
                            balance_strategy TEXT,
                            feature_extraction TEXT,
                            training_set INTEGER,
                            labeling_time INTEGER,
                            notes TEXT)''')

            record_table = get_json_record_table(sf)
            record_id_to_row_number = {record_table[i]: i
                                       for i in range(len(record_table))}
            old_record_ids = [x[0] for x in labeled_json]
            sf_indices = [record_id_to_row_number[record_id]
                          for record_id in old_record_ids]

            sf_labels = [x[1] for x in labeled_json]

            # query strategy.
            old_query_strategy = [
                sample_data[2]
                for query in range(len(sf._state_dict['results']))
                for sample_data in sf._state_dict['results'][query]['labelled']
            ]

            n_priors = old_query_strategy.count('prior')
            n_records_labeled = len(sf_indices)
            n_non_prior_records = n_records_labeled - n_priors

            query_strategy = sf.settings.to_dict()['query_strategy']
            sf_query_strategy = ['prior'] * n_priors + \
                                [query_strategy] * n_non_prior_records

            # classifier.
            classifier = sf.settings.to_dict()['model']
            sf_classifiers = [None] * n_priors + [
                f'{classifier}' for _ in range(n_non_prior_records)
            ]

            # training set.
            sf_training_sets = [-1] * n_priors + list(
                range(n_priors, n_records_labeled))

            # feature extraction.
            feature_extraction = sf.settings.to_dict()['feature_extraction']
            sf_feature_extraction = [None] * n_priors + [
                f'{feature_extraction}' for _ in range(n_non_prior_records)
            ]

            # balance strategy.
            balance_strategy = sf.settings.to_dict()['balance_strategy']
            sf_balance_strategy = [None] * n_priors + [
                f'{balance_strategy}' for _ in range(n_non_prior_records)
            ]

            # Labeling time.
            sf_time = [0 for _ in range(n_records_labeled)]

            # No notes were saved before.
            sf_notes = [None for _ in range(n_records_labeled)]

            # Check that all datasets have the same number of entries.
            lengths = [
                len(sf_indices),
                len(sf_labels),
                len(sf_classifiers),
                len(sf_training_sets),
                len(sf_query_strategy),
                len(sf_time),
                len(sf_feature_extraction),
                len(sf_balance_strategy),
                len(sf_notes)
            ]
            if not all([length == n_records_labeled for length in lengths]):
                raise StateError(
                    "All datasets should have the same number of entries.")

            # Create the database rows.
            db_rows = [(sf_indices[i], sf_labels[i], sf_classifiers[i],
                        sf_query_strategy[i], sf_balance_strategy[i],
                        sf_feature_extraction[i], sf_training_sets[i],
                        sf_time[i], sf_notes[i])
                       for i in range(n_records_labeled)]
            cur.executemany(
                """INSERT INTO results VALUES
                            (?, ?, ?, ?, ?, ?, ?, ?, ?)""", db_rows)
            con.commit()


def create_decision_changes_table(sql_fp):
    """Create an emtpy table that will contain the record_ids and new labels
    of the records whose label was changed after the original labeling action.
    Also contains the time at which the label was changed."""
    with sqlite3.connect(sql_fp) as con:
        cur = con.cursor()

        cur.execute('''CREATE TABLE decision_changes
                                    (record_id INTEGER,
                                    new_label INTEGER,
                                    time INTEGER)''')

        con.commit()
