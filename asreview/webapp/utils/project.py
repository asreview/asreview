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
import os
import re
import shutil
import zipfile
import tempfile
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

from asreview import __version__ as asreview_version
from asreview.config import LABEL_NA
from asreview.compat import convert_id_to_idx
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils.io import read_current_labels
from asreview.webapp.utils.io import read_data
from asreview.webapp.utils.io import read_label_history
from asreview.webapp.utils.io import read_pool
from asreview.webapp.utils.io import read_proba
from asreview.webapp.utils.io import write_label_history
from asreview.webapp.utils.io import write_pool
from asreview.webapp.utils.paths import asreview_path
from asreview.webapp.utils.paths import get_data_path
from asreview.webapp.utils.paths import get_data_file_path
from asreview.webapp.utils.paths import get_labeled_path
from asreview.webapp.utils.paths import get_lock_path
from asreview.webapp.utils.paths import get_pool_path
from asreview.webapp.utils.paths import get_project_file_path
from asreview.webapp.utils.paths import get_project_path
from asreview.webapp.utils.paths import get_tmp_path
from asreview.webapp.utils.paths import list_asreview_project_paths
from asreview.webapp.utils.validation import is_project


def _get_executable():
    """Get the Python executable"""

    py_exe = sys.executable

    # if the exe is an empty string or None, then fall badck on 'python'
    if not py_exe:
        py_exe = 'python'

    return py_exe


def create_project_id(name):
    """Create project id from input name."""

    if isinstance(name, str) \
            and len(name) > 0 \
            and not name[0].isalnum():
        raise ValueError(
            "First character should be alphabet"
            " letter (a-z) or number (0-9).")

    if not name \
            and not isinstance(name, str) \
            and len(name) >= 3:
        raise ValueError(
            "Project name should be at least 3 characters.")

    project_id = ""
    for c in name.lower():
        if c.isalnum():
            project_id += c
        elif len(project_id) > 0 and project_id[-1] != "-":
            project_id += "-"

    return project_id


def init_project(project_id,
                 project_name=None,
                 project_description=None,
                 project_authors=None):
    """Initialize the necessary files specific to the web app."""

    if is_project(project_id):
        raise ValueError("Project already exists.")

    try:
        get_project_path(project_id).mkdir()
        get_data_path(project_id).mkdir()

        project_config = {
            'version': asreview_version,  # todo: Fail without git?
            'id': project_id,
            'name': project_name,
            'description': project_description,
            'authors': project_authors,
            'created_at_unix': int(time.time()),

            # project related variables
            'projectInitReady': False,
            'reviewFinished': False,
        }

        # create a file with project info
        with open(get_project_file_path(project_id), "w") as fp:
            json.dump(project_config, fp)

        return project_config

    except Exception as err:
        # remove all generated folders and raise error
        shutil.rmtree(get_project_path())
        raise err


def update_project_info(project_id,
                        project_name=None,
                        project_description=None,
                        project_authors=None):
    '''Update project info'''

    project_id_new = create_project_id(project_name)

    if (project_id != project_id_new) & is_project(project_id_new):
        raise ValueError("Project name already exists.")

    try:

        # read the file with project info
        with open(get_project_file_path(project_id), "r") as fp:
            project_info = json.load(fp)

        project_info["id"] = project_id_new
        project_info["name"] = project_name
        project_info["authors"] = project_authors
        project_info["description"] = project_description

        # # backwards support <0.10
        # if "projectInitReady" not in project_info:
        #     project_info["projectInitReady"] = True

        # update the file with project info
        with open(get_project_file_path(project_id), "w") as fp:
            json.dump(project_info, fp)

        # rename the folder
        get_project_path(project_id) \
            .rename(Path(asreview_path(), project_id_new))

    except Exception as err:
        raise err

    return project_info["id"]


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
        raise ValueError(
            "Failed to import project "
            f"'{file_name.filename}'."
        )

    return import_project["id"]


def add_dataset_to_project(project_id, file_name):
    """Add file path to the project file.

    Add file to data subfolder and fill the pool of iteration 0.
    """

    project_file_path = get_project_file_path(project_id)

    # clean temp project files
    clean_project_tmp_files(project_id)

    with SQLiteLock(
            get_lock_path(project_id),
            blocking=True,
            lock_name="active",
            project_id=project_id
    ):
        # open the projects file
        with open(project_file_path, "r") as f_read:
            project_dict = json.load(f_read)

        # add path to dict (overwrite if already exists)
        project_dict["dataset_path"] = file_name

        with open(project_file_path, "w") as f_write:
            json.dump(project_dict, f_write)

        # fill the pool of the first iteration
        as_data = read_data(project_id)

        if as_data.labels is not None:
            unlabeled = np.where(as_data.labels == LABEL_NA)[0]
            pool_indices = as_data.record_ids[unlabeled]

            labeled_indices = np.where(as_data.labels != LABEL_NA)[0]
            label_indices = list(zip(
                as_data.record_ids[labeled_indices].tolist(),
                as_data.labels[labeled_indices].tolist()
            ))
        else:
            pool_indices = as_data.record_ids
            label_indices = []

        np.random.shuffle(pool_indices)
        write_pool(project_id, pool_indices.tolist())

        # make a empty qeue for the items to label
        write_label_history(project_id, label_indices)


def remove_dataset_to_project(project_id, file_name):
    """Remove dataset from project

    """

    project_file_path = get_project_file_path(project_id)
    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):

        # open the projects file
        with open(project_file_path, "r") as f_read:
            project_dict = json.load(f_read)

        # remove the path from the project file
        data_fn = project_dict["dataset_path"]
        del project_dict["dataset_path"]

        with open(project_file_path, "w") as f_write:
            json.dump(project_dict, f_write)

        # files to remove
        data_path = get_data_file_path(project_id, data_fn)
        pool_path = get_pool_path(project_id)
        labeled_path = get_labeled_path(project_id)

        os.remove(str(data_path))
        os.remove(str(pool_path))
        os.remove(str(labeled_path))


def clean_project_tmp_files(project_id):
    """Clean temporary files in a project.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """
    project_path = get_project_path(project_id)

    # clean pickle files
    for f_pickle in project_path.rglob("*.pickle"):
        try:
            os.remove(f_pickle)
        except OSError as e:
            print(f"Error: {f_pickle} : {e.strerror}")

    # clean tmp export files
    # TODO


def clean_all_project_tmp_files():
    """Clean temporary files in all projects.
    """
    for project_path in list_asreview_project_paths():
        clean_project_tmp_files(project_path)


def get_paper_data(project_id,
                   paper_id,
                   return_debug_label=False):
    """Get the title/authors/abstract for a paper."""
    as_data = read_data(project_id)
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


def get_instance(project_id):
    """Get a new instance to review.

    Arguments
    ---------
    project_id: str
        The id of the current project.
    """

    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):
        pool_idx = read_pool(project_id)

    if len(pool_idx) > 0:
        return pool_idx[0]
    else:
        # end of pool
        return None


def stop_n_since_last_relevant(labeled):
    """Count n since last relevant"""

    n_since_last_inclusion = 0
    for _, inclusion in reversed(labeled):
        if inclusion == 1:
            break
        n_since_last_inclusion += 1

    return n_since_last_inclusion


def n_relevant(labeled):

    return len(list(filter(lambda x: x[1] == 1, labeled)))


def n_irrelevant(labeled):

    return len(list(filter(lambda x: x[1] == 0, labeled)))


def get_statistics(project_id):
    """Get statistics from project files.

    Arguments
    ---------
    project_id: str
        The id of the current project.

    Returns
    -------
    dict:
        Dictonary with statistics.
    """
    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock,
            blocking=True,
            lock_name="active",
            project_id=project_id
    ):
        # get the index of the active iteration
        labeled = read_label_history(project_id)
        pool = read_pool(project_id)

    # compute metrics
    n_included = n_relevant(labeled)
    n_excluded = n_irrelevant(labeled)
    n_pool = len(pool)

    return {
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_since_last_inclusion": stop_n_since_last_relevant(labeled),
        "n_papers": n_pool + n_included + n_excluded,
        "n_pool": n_pool
    }


def export_to_string(project_id, export_type="csv"):

    # read the dataset into a ASReview data object
    as_data = read_data(project_id)

    # set the lock to safely read labeled, pool, and proba
    fp_lock = get_lock_path(project_id)
    with SQLiteLock(
            fp_lock,
            blocking=True,
            lock_name="active",
            project_id=project_id
    ):
        proba = read_proba(project_id)
        pool = read_pool(project_id)
        labeled = read_label_history(project_id)

    # get the record_id of the inclusions and exclusions
    inclusion_record_id = [int(x[0]) for x in labeled if x[1] == 1]
    exclusion_record_id = [int(x[0]) for x in labeled if x[1] == 0]

    # order the pool from high to low proba
    if proba is not None:
        pool_ordered = proba.loc[pool, :] \
            .sort_values("proba", ascending=False).index.values
    else:
        pool_ordered = pool_ordered

    # get the ranking of the 3 subcategories
    ranking = np.concatenate(
        (
            # add the inclusions first
            inclusion_record_id,
            # add the ordered pool second
            pool_ordered,
            # add the exclusions last
            exclusion_record_id
        ),
        axis=None
    )

    # export the data to file
    if export_type == "csv":
        return as_data.to_csv(fp=None, labels=labeled, ranking=ranking)

    elif export_type == "tsv":
        return as_data.to_csv(
            fp=None, sep="\t", labels=labeled, ranking=ranking)

    elif export_type == "excel":
        get_tmp_path(project_id).mkdir(exist_ok=True)
        fp_tmp_export = Path(get_tmp_path(project_id), "export_result.xlsx")
        return as_data.to_excel(
            fp=fp_tmp_export, labels=labeled, ranking=ranking)

    elif export_type == "ris":
        return as_data.to_ris(fp=None, labels=labeled, ranking=ranking)

    else:
        raise ValueError("This export type isn't implemented.")


def label_instance(project_id, paper_i, label, retrain_model=True):
    """Label a paper after reviewing the abstract.

    """

    paper_i = int(paper_i)
    label = int(label)

    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):

        # get the index of the active iteration
        if int(label) in [0, 1]:
            move_label_from_pool_to_labeled(project_id, paper_i, label)
        else:
            move_label_from_labeled_to_pool(project_id, paper_i)

    if retrain_model:
        # Update the model (if it isn't busy).

        py_exe = _get_executable()
        run_command = [py_exe, "-m", "asreview", "web_run_model", project_id]
        subprocess.Popen(run_command)


def move_label_from_pool_to_labeled(project_id, paper_i, label):

    # load the papers from the pool
    pool_idx = read_pool(project_id)

    # Remove the paper from the pool.
    try:
        pool_idx.remove(int(paper_i))
    except (IndexError, ValueError):
        return

    write_pool(project_id, pool_idx)

    # Add the paper to the reviewed papers.
    labeled = read_label_history(project_id)
    labeled.append([int(paper_i), int(label)])
    write_label_history(project_id, labeled)


def move_label_from_labeled_to_pool(project_id, paper_i):

    # load the papers from the pool
    pool_list = read_pool(project_id)

    # Add the paper to the reviewed papers.
    labeled_list = read_label_history(project_id)

    labeled_list_new = []

    for item_id, item_label in labeled_list:

        item_id = int(item_id)
        item_label = int(item_label)
        paper_i = int(paper_i)

        if paper_i == item_id:
            pool_list.append(item_id)
        else:
            labeled_list_new.append([item_id, item_label])

    # write the papers to the label dataset
    write_pool(project_id, pool_list)

    # load the papers from the pool
    write_label_history(project_id, labeled_list_new)
