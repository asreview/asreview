import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import pandas as pd

from asreview import __version__ as asreview_version
from asreview.config import LABEL_NA
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils.io import read_current_labels
from asreview.webapp.utils.io import read_data
from asreview.webapp.utils.io import read_label_history
from asreview.webapp.utils.io import read_pool
from asreview.webapp.utils.io import read_proba
from asreview.webapp.utils.io import write_label_history
from asreview.webapp.utils.io import write_pool
from asreview.webapp.utils.io import get_project_info
from asreview.webapp.utils.io import set_project_info
from asreview.webapp.utils.io import  get_data_file_path
from asreview.webapp.utils.paths import asreview_path
from asreview.webapp.utils.paths import get_data_path
from asreview.webapp.utils.paths import get_labeled_path
from asreview.webapp.utils.paths import get_lock_path
from asreview.webapp.utils.paths import get_pool_path
from asreview.webapp.utils.paths import get_project_file_path
from asreview.webapp.utils.paths import get_project_path
from asreview.webapp.utils.paths import get_tmp_path
from asreview.webapp.utils.paths import get_kwargs_path
from asreview.webapp.utils.paths import list_asreview_project_paths
from asreview.webapp.utils.validation import is_project


def _get_executable():
    """Get the Python executable"""

    py_exe = sys.executable

    # if the exe is an empty string or None, then fall badck on 'python'
    if not py_exe:
        py_exe = 'python'

    return py_exe


def init_project(project_id,
                 project_name=None,
                 project_description=None,
                 project_authors=None,
                 project_mode=None):
    """Initialize the necessary files specific to the web app."""

    if not project_id and not isinstance(project_id, str) \
            and len(project_id) >= 3:
        raise ValueError("Project name should be at least 3 characters.")

    if is_project(project_id):
        raise ValueError("Project already exists.")

    try:
        get_project_path(project_id).mkdir()
        get_data_path(project_id).mkdir()

        reviewFinished = project_mode is "SIMULATION"

        project_info = {
            'version': asreview_version,  # todo: Fail without git?
            'id': project_id,
            'name': project_name,
            'description': project_description,
            'authors': project_authors,
            'mode': project_mode,

            # project related variables
            'projectSetupReady': False,
            'projectInitReady': False,
            'reviewFinished': reviewFinished,
            'simulations': []
        }

        set_project_info(project_id, project_info)

        return project_info

    except Exception as err:
        # remove all generated folders and raise error
        shutil.rmtree(get_project_path())
        raise err


def enrich_project_info(project_id, project_info):
    # check if there is a dataset
    try:
        get_data_file_path(project_id)
        project_info["projectHasDataset"] = True
    except Exception:
        project_info["projectHasDataset"] = False

    # check if there is a prior knowledge (check if there is a model set),
    # if this is the case, the reviewer past the prior knowledge screen.
    project_info["projectHasPriorKnowledge"] = \
        get_kwargs_path(project_id).exists()

    # check if there is a prior knowledge (check if there is a model set),
    # if this is the case, the reviewer past the prior knowledge screen.
    project_info["projectHasAlgorithms"] = \
        get_kwargs_path(project_id).exists()

    return project_info


def migrate_project_info(project_info):
    # backwards support <0.10
    if "projectInitReady" not in project_info:
        if project_info["projectHasPriorKnowledge"]:
            project_info["projectInitReady"] = True
        else:
            project_info["projectInitReady"] = False

    # backwards support <0.10
    if "mode" not in project_info:
        project_info["mode"] = "oracle"

    # backwards support prior to simulations
    if "projectSetupReady" not in project_info:    
        project_info["projectSetupReady"] = project_info["projectInitReady"]

    if "simulations" not in project_info:    
        project_info["simulations"] = []

    return project_info    


def add_simulation_to_project(project_id, simulation_id): 
    update_simulation_in_project(project_id, simulation_id, "running")


def update_simulation_in_project(project_id, simulation_id, state):
    project_info = get_project_info(project_id)
    if "simulations" not in project_info:        
        project_info["simulations"] = []

    simulation = { 
        "id": simulation_id,
        "state" : state 
    }

    project_info["simulations"].append(simulation)
    set_project_info(project_id, project_info)


def add_dataset_to_project(project_id, file_name):
    """Add file path to the project file.

    Add file to data subfolder and fill the pool of iteration 0.
    """

    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):
        
        # add dataset path to dict (overwrite if already exists)
        project_info = get_project_info(project_id)

        project_info["dataset_path"] = file_name
        set_project_info(project_id, project_info)

        # fill the pool of the first iteration
        as_data = read_data(project_id)

        if as_data.labels is not None:
            unlabeled = np.where(as_data.labels == LABEL_NA)[0]
            pool_indices = as_data.record_ids[unlabeled]

            label_indices_included = \
                [[int(x), 1] for x in np.where(as_data.labels == 1)[0]]
            label_indices_excluded = \
                [[int(x), 0] for x in np.where(as_data.labels == 0)[0]]
            label_indices = label_indices_included + label_indices_excluded
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

    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):

        # remove files
        data_path = get_data_file_path(project_id)
        pool_path = get_pool_path(project_id)
        labeled_path = get_labeled_path(project_id)

        os.remove(str(data_path))
        os.remove(str(pool_path))
        os.remove(str(labeled_path))

        # update project info
        project_info = get_project_info(project_id)
        # remove the dataset path
        del project_info["dataset_path"]
        set_project_info(project_id, project_info)


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
                   return_title=True,
                   return_authors=True,
                   return_abstract=True,
                   return_debug_label=False):
    """Get the title/authors/abstract for a paper."""
    as_data = read_data(project_id)
    record = as_data.record(int(paper_id))

    paper_data = {}
    if return_title and record.title is not None:
        paper_data['title'] = record.title
    if return_authors and record.authors is not None:
        paper_data['authors'] = record.authors
    if return_abstract and record.abstract is not None:
        paper_data['abstract'] = record.abstract

    # return the publication data if available
    pub_time = record.extra_fields.get("publish_time", None)
    paper_data['publish_time'] = pub_time if pd.notnull(pub_time) else None

    # return the doi if available
    doi = record.extra_fields.get("doi", None)
    paper_data['doi'] = doi if pd.notnull(doi) else None

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


def get_statistics(project_id):
    fp_lock = get_lock_path(project_id)

    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):
        # get the index of the active iteration
        label_history = read_label_history(project_id)
        current_labels = read_current_labels(
            project_id, label_history=label_history)

    n_since_last_inclusion = 0
    for _, inclusion in reversed(label_history):
        if inclusion == 1:
            break
        n_since_last_inclusion += 1

    n_included = len(np.where(current_labels == 1)[0])
    n_excluded = len(np.where(current_labels == 0)[0])
    n_papers = len(current_labels)
    stats = {
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_since_last_inclusion": n_since_last_inclusion,
        "n_papers": n_papers,
        "n_pool": n_papers - n_included - n_excluded
    }
    return stats


def export_to_string(project_id, export_type="csv"):
    fp_lock = get_lock_path(project_id)
    as_data = read_data(project_id)
    with SQLiteLock(
            fp_lock, blocking=True, lock_name="active", project_id=project_id):
        proba = read_proba(project_id)
        if proba is None:
            proba = np.flip(np.arange(len(as_data)))
        else:
            proba = np.array(proba)
        labels = read_current_labels(project_id, as_data=as_data)

    pool_idx = np.where(labels == LABEL_NA)[0]
    one_idx = np.where(labels == 1)[0]
    zero_idx = np.where(labels == 0)[0]

    proba_order = np.argsort(-proba[pool_idx])
    ranking = np.concatenate((one_idx, pool_idx[proba_order], zero_idx),
                             axis=None)

    if export_type == "csv":
        return as_data.to_csv(fp=None, labels=labels, ranking=ranking)
    if export_type == "excel":
        get_tmp_path(project_id).mkdir(exist_ok=True)
        fp_tmp_export = Path(get_tmp_path(project_id), "export_result.xlsx")
        return as_data.to_excel(
            fp=fp_tmp_export, labels=labels, ranking=ranking)
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
