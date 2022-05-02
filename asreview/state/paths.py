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
from pathlib import Path


def get_project_file_path(project_path):
    """Get the path to the project file.

    Arguments
    ---------
    project_path: str
        The path to the project.
    """

    return Path(project_path, "project.json")


def get_data_path(project_path):
    """Get the path to the data folder.

    Arguments
    ---------
    project_path: str
        The path to the project.
    """

    return Path(project_path, "data")


def get_data_file_path(project_path):

    data_folder = get_data_path(project_path)
    project_file_path = get_project_file_path(project_path)

    # open the projects file
    with open(project_file_path, "r") as f_read:
        project_dict = json.load(f_read)

    try:
        return data_folder / project_dict["dataset_path"]
    except KeyError:
        raise FileNotFoundError("Dataset location not found")


def get_reviews_path(project_path):
    """Get the reviews folder from the project.

    Arguments
    ---------
    project_path: str
        The path to the project.
    """
    return Path(project_path, 'reviews')


def get_feature_matrices_path(project_path):
    """Get the feature matrices folder from the project.

    Arguments
    ---------
    project_path: str
        The path to the project.
    """
    return Path(project_path, 'feature_matrices')


def get_settings_metadata_path(project_path, review_id=None):
    """Get the settings/metadata json file from the project.

    Arguments
    ---------
    project_path: str
        The path to the project.
    review_id: str
        Identifier for the review from which to get the settings json file.
        If none is given, pick the first id available.
    """
    if review_id is None:
        with open(get_project_file_path(project_path), 'r') as f:
            project_config = json.load(f)
        review_id = project_config['reviews'][0]['id']

    return Path(get_reviews_path(project_path), review_id,
                'settings_metadata.json')


def get_feature_matrix_path(project_path, feature_extraction=None):
    """Get the feature matrix file from the project.

    Arguments
    ---------
    project_path: str
        The path to the project.
    feature_extraction: str
        Identifier for the feature extraction method. If none is given,
        the first available feature matrix is used.
    """
    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    # Get the filename for the matrix with the given feature extraction method.
    if feature_extraction is None:
        filename = project_config['feature_matrices'][0]['filename']
    else:
        filename = next(config['filename']
                        for config in project_config['feature_matrices']
                        if config['id'] == feature_extraction)

    return Path(get_feature_matrices_path(project_path), filename)


def get_simulation_ready_path(project_path, simulation_id):
    """Get the simulation_ready file for the project and iteration.

    Arguments
    ---------
    project_path: str
        The path to the project.
    simulation_id: str
        The id of the current simulation.
    """

    return Path(project_path, "reviews", simulation_id + ".json")
