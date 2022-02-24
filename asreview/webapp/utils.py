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
import logging
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import zipfile
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

from asreview import __version__ as asreview_version
from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODES
from asreview.state.errors import StateError
from asreview.state.errors import StateNotFoundError
from asreview.state.paths import get_data_file_path
from asreview.state.paths import get_data_path
from asreview.state.paths import get_labeled_path
from asreview.state.paths import get_lock_path
from asreview.state.paths import get_pool_path
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_reviews_path
from asreview.state.paths import get_state_path
from asreview.state.paths import get_tmp_path
from asreview.state.utils import delete_state_from_project
from asreview.state.utils import init_project_folder_structure
from asreview.state.utils import open_state
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.io import read_data
from asreview.utils import asreview_path

from asreview.state.paths import get_reviews_path
from asreview.project import get_project_path



def is_project(project_id):

    if get_project_path(project_id).exists():
        return True

    return False


def is_v0_project(project_path):
    """Check if a project file is of a ASReview version 0 project."""

    return not get_reviews_path(project_path).exists()


def _get_executable():
    """Get the Python executable"""

    return sys.executable if sys.executable else 'python'


def init_project(project_path,
                 project_mode="oracle",
                 project_name=None,
                 project_description=None,
                 project_authors=None):
    """Initialize the necessary files specific to the web app."""

    if is_project(project_path):
        raise ValueError("Project already exists.")

    if project_mode not in PROJECT_MODES:
        raise ValueError(f"Project mode '{project_mode}' is not in "
                         f"{PROJECT_MODES}.")

    project_config = \
        init_project_folder_structure(project_path,
                                      project_mode=project_mode,
                                      project_name=project_name,
                                      project_description=project_description,
                                      project_authors=project_authors)

    return project_config


def import_project_file(file_name):
    """Import .asreview project file"""

    try:
        # Unzip the project file
        with zipfile.ZipFile(file_name, "r") as zip_obj:
            zip_filenames = zip_obj.namelist()

            # raise error if no ASReview project file
            if "project.json" not in zip_filenames:
                raise ValueError("File doesn't contain valid project format.")

            # extract all files to a temporary folder
            tmpdir = tempfile.mkdtemp()
            zip_obj.extractall(path=tmpdir)

    except zipfile.BadZipFile:
        raise ValueError("File is not an ASReview file.")

    try:
        # Open the project file and check the id. The id needs to be
        # unique, otherwise it is exended with -copy.
        import_project = None
        fp = Path(tmpdir, "project.json")
        with open(fp, "r+") as f:

            # load the project info in scope of function
            import_project = json.load(f)

            # If the uploaded project already exists,
            # then overwrite project.json with a copy suffix.
            while is_project(import_project["id"]):
                # project update
                import_project["id"] = f"{import_project['id']}-copy"
                import_project["name"] = f"{import_project['name']} copy"
            else:
                # write to file
                f.seek(0)
                json.dump(import_project, f)
                f.truncate()

        # location to copy file to
        fp_copy = get_project_path(import_project["id"])
        # Move the project from the temp folder to the projects folder.
        os.replace(tmpdir, fp_copy)

    except Exception:
        # Unknown error.
        raise ValueError("Failed to import project "
                         f"'{file_name.filename}'.")

    project_info = {}
    project_info["id"] = import_project["id"]
    project_info["name"] = import_project["name"]

    return project_info


def clean_all_project_tmp_files():
    """Clean temporary files in all projects.
    """
    for project in list_asreview_projects():
        project.clean_tmp_files()


def get_paper_data(project_path, paper_id, return_debug_label=False):
    """Get the title/authors/abstract for a paper."""
    as_data = read_data(project_path)
    record = as_data.record(int(paper_id), by_index=False)

    paper_data = {}
    paper_data['title'] = record.title
    paper_data['authors'] = record.authors
    paper_data['abstract'] = record.abstract
    paper_data['doi'] = record.doi

    # return the debug label
    debug_label = record.extra_fields.get("debug_label", None)
    paper_data['_debug_label'] = \
        int(debug_label) if pd.notnull(debug_label) else None

    return paper_data


def get_legacy_statistics(json_fp):
    """Return the data necessary for get_statistics from and old json state
    file.

    Arguments
    ---------
    json_fp: pathlike
        File path of the json state file.
    """
    with open(json_fp, 'r') as f:
        s = json.load(f)

    # Get the labels.
    labeled = np.array([
        int(sample_data[1])
        for query in range(len(s['results']))
        for sample_data in s['results'][query]['labelled']
    ])

    # Get the record table.
    data_hash = list(s['data_properties'].keys())[0]
    record_table = s['data_properties'][data_hash][
        'record_table']

    n_records = len(record_table)
    return labeled, n_records


def get_statistics(project_path):
    """Get statistics from project files.

    Arguments
    ---------
    project_id: str
        The id of the current project.

    Returns
    -------
    dict:
        Dictionary with statistics.
    """

    if is_v0_project(project_path):
        json_fp = Path(project_path, 'result.json')
        # Check if the v0 project is in review.
        if json_fp.exists():
            labels, n_records = get_legacy_statistics(json_fp)
        # No result found.
        else:
            labels = np.array([])
            n_records = 0
    else:
        # Check if there is a review started in the project.
        try:
            with open_state(project_path) as s:
                labels = s.get_labels()
                n_records = len(s.get_record_table())
        # No state file found or not init.
        except (StateNotFoundError, StateError):
            labels = np.array([])
            n_records = 0

    n_included = int(sum(labels == 1))
    n_excluded = int(sum(labels == 0))

    if n_included > 0:
        n_since_last_relevant = int(labels.tolist()[::-1].index(1))
    else:
        n_since_last_relevant = 0

    return {
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_since_last_inclusion": n_since_last_relevant,
        "n_papers": n_records,
        "n_pool": n_records - n_excluded - n_included
    }


def export_to_string(project_path, export_type="csv"):

    # read the dataset into a ASReview data object
    as_data = read_data(project_path)

    with open_state(project_path) as s:
        proba = s.get_last_probabilities()
        labeled_data = s.get_dataset(['record_id', 'label'])
        record_table = s.get_record_table()

    prob_df = pd.concat([record_table, proba], axis=1)

    ranking = pd. \
        merge(prob_df, labeled_data, on='record_id', how='left'). \
        fillna(0.5). \
        sort_values(['label', 'proba'], ascending=False)['record_id']

    labeled = labeled_data.values.tolist()

    # export the data to file
    if export_type == "csv":
        return as_data.to_csv(fp=None, labels=labeled, ranking=ranking)

    elif export_type == "tsv":
        return as_data.to_csv(
            fp=None, sep="\t", labels=labeled, ranking=ranking)

    elif export_type == "excel":
        get_tmp_path(project_path).mkdir(exist_ok=True)
        fp_tmp_export = Path(get_tmp_path(project_path), "export_result.xlsx")
        return as_data.to_excel(
            fp=fp_tmp_export, labels=labeled, ranking=ranking)

    elif export_type == "ris":
        return as_data.to_ris(fp=None, labels=labeled, ranking=ranking)

    else:
        raise ValueError("This export type isn't implemented.")


def train_model(project_path):
    py_exe = _get_executable()
    run_command = [_get_executable(), "-m", "asreview", "web_run_model", project_path]
    subprocess.Popen(run_command)


def update_instance(project_path, record_id, label, note=None, retrain_model=True):
    """Update a labeling decision."""
    state_path = get_state_path(project_path)

    # check the label
    label = int(label)

    with open_state(state_path, read_only=False) as state:
        state.update_decision(record_id, label, note=note)

    if retrain_model:
        train_model(project_path)


def label_instance(project_path, paper_i, label, note=None,
                   prior=False, retrain_model=True):
    """Label a paper after reviewing the abstract.

    """
    state_path = get_state_path(project_path)

    paper_i = int(paper_i)
    label = int(label)

    with open_state(state_path, read_only=False) as state:

        # get the index of the active iteration
        if label in [0, 1]:

            # add the labels as prior data
            state.add_labeling_data(record_ids=[paper_i],
                                    labels=[label],
                                    notes=[note],
                                    prior=prior)

        elif label == -1:
            with open_state(state_path, read_only=False) as state:
                state.delete_record_labeling_data(paper_i)

    if retrain_model:
        train_model(project_path)
