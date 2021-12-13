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
import tempfile
import urllib.parse
import uuid
from collections import Counter
from pathlib import Path
from urllib.request import urlretrieve

from flask import Blueprint
from flask import Response
from flask import jsonify
from flask import request
from flask import send_file
from flask_cors import CORS
import numpy as np
import pandas as pd
from werkzeug.exceptions import InternalServerError
from werkzeug.utils import secure_filename

from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_MODEL
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import PROJECT_MODE_EXPLORE
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.data import ASReviewData
from asreview.datasets import DatasetManager
from asreview.exceptions import BadFileFormatError
from asreview.models.balance import list_balance_strategies
from asreview.models.classifiers import list_classifiers
from asreview.models.feature_extraction import list_feature_extraction
from asreview.models.query import list_query_strategies
from asreview.search import SearchError
from asreview.search import fuzzy_find
from asreview.settings import ASReviewSettings
from asreview.state.errors import StateNotFoundError
from asreview.state.paths import get_data_file_path
from asreview.state.paths import get_data_path
from asreview.state.paths import get_lock_path
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_simulation_ready_path
from asreview.state.paths import get_state_path
from asreview.state.paths import get_tmp_path
from asreview.state.sql_converter import upgrade_asreview_project_file
from asreview.state.utils import open_state
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.types import is_project
from asreview.webapp.utils.datasets import get_data_statistics
from asreview.webapp.utils.datasets import get_dataset_metadata
from asreview.webapp.utils.io import read_data
from asreview.webapp.utils.project import ProjectNotFoundError
from asreview.webapp.utils.project import _create_project_id
from asreview.webapp.utils.project import _get_executable
from asreview.webapp.utils.project import add_dataset_to_project
from asreview.webapp.utils.project import add_review_to_project
from asreview.webapp.utils.project import export_to_string
from asreview.webapp.utils.project import get_instance
from asreview.webapp.utils.project import get_paper_data
from asreview.webapp.utils.project import get_project_config
from asreview.webapp.utils.project import get_statistics
from asreview.webapp.utils.project import import_project_file
from asreview.webapp.utils.project import init_project
from asreview.webapp.utils.project import label_instance
from asreview.webapp.utils.project import remove_dataset_from_project
from asreview.webapp.utils.project import rename_project
from asreview.webapp.utils.project import update_instance
from asreview.webapp.utils.project import update_project_info
from asreview.webapp.utils.project import update_review_in_project
from asreview.webapp.utils.project_path import get_project_path
from asreview.webapp.utils.project_path import list_asreview_project_paths
from asreview.webapp.utils.validation import check_dataset

bp = Blueprint('api', __name__, url_prefix='/api')
CORS(bp, resources={r"*": {"origins": "*"}})

# error handlers


@bp.errorhandler(ProjectNotFoundError)
def project_not_found(e):

    message = str(e) if str(e) else "Project not found."
    logging.error(message)
    return jsonify(message=message), 400


@bp.errorhandler(InternalServerError)
def error_500(e):
    original = getattr(e, "original_exception", None)

    if original is None or str(e.original_exception) == "":
        # direct 500 error, such as abort(500)
        logging.error(e)
        return jsonify(message="Whoops, something went wrong."), 500

    # wrapped unhandled error
    logging.error(e.original_exception)
    return jsonify(message=str(e.original_exception)), 500


# routes
@bp.route('/projects', methods=["GET"])
def api_get_projects():  # noqa: F401
    """Get info on the article"""

    projects = list_asreview_project_paths()

    project_info = []
    for proj in projects:

        try:
            with open(proj / "project.json", "r") as f:
                res = json.load(f)

            # backwards support <0.10
            if "projectInitReady" not in res:
                res["projectInitReady"] = True

            # if time is not available (<0.14)
            if "created_at_unix" not in res:
                res["created_at_unix"] = None

            logging.info("Project found: {}".format(res["id"]))
            project_info.append(res)

        except Exception as err:
            logging.error(err)

    # sort the projects based on created_at_unix
    project_info = sorted(
        project_info,
        key=lambda y: (y["created_at_unix"] is not None, y["created_at_unix"]),
        reverse=True)

    response = jsonify({"result": project_info})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/projects/stats', methods=["GET"])
def api_get_projects_stats():  # noqa: F401
    """Get dashboard statistics of all projects"""

    projects = list_asreview_project_paths()

    stats_counter = Counter()

    for proj in projects:

        try:
            with open(proj / "project.json", "r") as f:
                res = json.load(f)

            # backwards support <0.10
            if "projectInitReady" not in res:
                res["projectInitReady"] = True

            # get dashboard statistics
            statistics = get_statistics(res["id"])
            statistics["n_reviewed"] = statistics["n_included"] \
                + statistics["n_excluded"]

            if res["projectInitReady"] is not True:
                statistics["n_setup"] = 1
                statistics["n_in_review"] = 0
                statistics["n_finished"] = 0
            elif "reviewFinished" not in res or res[
                    "reviewFinished"] is not True:
                statistics["n_setup"] = 0
                statistics["n_in_review"] = 1
                statistics["n_finished"] = 0
            else:
                statistics["n_setup"] = 0
                statistics["n_in_review"] = 0
                statistics["n_finished"] = 1

            statistics = {
                x: statistics[x]
                for x in ("n_reviewed", "n_included", "n_setup", "n_in_review",
                          "n_finished")
            }
            stats_counter.update(statistics)

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load dashboard statistics."), 500

    project_stats = dict(stats_counter)

    response = jsonify({"result": project_stats})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/info', methods=["POST"])
def api_init_project():  # noqa: F401
    """Get info on the article"""

    project_mode = request.form['mode']
    project_name = request.form['name']
    project_description = request.form['description']
    project_authors = request.form['authors']

    project_id = _create_project_id(project_name)

    project_config = init_project(project_id,
                                  project_mode=project_mode,
                                  project_name=project_name,
                                  project_description=project_description,
                                  project_authors=project_authors)

    response = jsonify(project_config)

    return response, 201


@bp.route('/project/<project_id>/convert_if_old', methods=["GET"])
def api_convert_project_if_old(project_id):
    """Get if project is converted"""

    project_path = get_project_path(project_id)

    try:
        upgrade_asreview_project_file(project_path)

    except ValueError:
        pass

    except Exception as err:
        logging.error(err)
        message = "Failed to open the project in this version of ASReview LAB."
        return jsonify(message=message), 500

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/info', methods=["GET"])
def api_get_project_info(project_id):  # noqa: F401
    """Get info on the article"""
    project_path = get_project_path(project_id)
    project_info = get_project_config(project_id)

    try:

        # check if there is a dataset
        try:
            get_data_file_path(project_path)
            project_info["projectHasDataset"] = True
        except Exception:
            project_info["projectHasDataset"] = False

        # backwards support <0.10
        if "projectInitReady" not in project_info:
            if "projectHasPriorKnowledge" not in project_info:
                pass
            else:
                if project_info["projectHasPriorKnowledge"]:
                    project_info["projectInitReady"] = True
                else:
                    project_info["projectInitReady"] = False

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to retrieve project information."), 500

    return jsonify(project_info)


@bp.route('/project/<project_id>/info', methods=["PUT"])
def api_update_project_info(project_id):  # noqa: F401
    """Get info on the article"""

    # rename the project if project name is changed
    if request.form.get('name', None) is not None:
        project_id_new = rename_project(project_id, request.form['name'])

    # update the project info
    update_project_info(
        project_id_new,
        mode=request.form['mode'],
        description=request.form['description'],
        authors=request.form['authors'])

    return api_get_project_info(project_id_new)


@bp.route('/datasets', methods=["GET"])
def api_demo_data_project():  # noqa: F401
    """Get info on the article"""

    subset = request.args.get('subset', None)

    if subset == "plugin":

        try:
            result_datasets = get_dataset_metadata(
                exclude=["builtin", "benchmark"])

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load plugin datasets."), 500

    elif subset == "benchmark":

        try:
            # collect the datasets metadata
            result_datasets = get_dataset_metadata(include="benchmark")

            # mark the featured datasets
            featured_dataset_ids = [
                "van_de_Schoot_2017", "Hall_2012", "Cohen_2006_ACEInhibitors",
                "Kwok_2020"
            ]
            for featured_id in featured_dataset_ids:
                for i, dataset in enumerate(result_datasets):
                    if result_datasets[i][
                            "dataset_id"] == f"benchmark:{featured_id}":
                        result_datasets[i]["featured"] = True

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load benchmark datasets."), 500

    else:
        response = jsonify(message="demo-data-loading-failed")

        return response, 400

    payload = {"result": result_datasets}
    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/data', methods=["POST", "PUT"])
def api_upload_data_to_project(project_id):  # noqa: F401
    """Get info on the article"""
    project_path = get_project_path(project_id)

    # get the project config to modify behavior of dataset
    project_config = get_project_config(project_id)

    # remove old dataset if present
    if "dataset_path" in project_config and \
            project_config["dataset_path"] is not None:
        logging.warning("Removing old dataset and adding new dataset.")
        remove_dataset_from_project(project_id)

    # create dataset folder if not present
    get_data_path(project_path).mkdir(exist_ok=True)

    if request.form.get('plugin', None):
        url = DatasetManager().find(request.form['plugin']).url

    if request.form.get('benchmark', None):
        url = DatasetManager().find(request.form['benchmark']).url

    if request.form.get('url', None):
        url = request.form['url']

    if request.form.get('plugin', None) or request.form.get(
            'benchmark', None) or request.form.get('url', None):
        try:
            url_parts = urllib.parse.urlparse(url)
            filename = secure_filename(url_parts.path.rsplit('/', 1)[-1])

            urlretrieve(url, get_data_path(project_path) / filename)

        except ValueError as err:

            logging.error(err)
            message = f"Invalid URL '{url}'."

            if isinstance(url, str) and not url.startswith("http"):
                message += " Usually, the URL starts with 'http' or 'https'."

            return jsonify(message=message), 400

        except Exception as err:

            logging.error(err)
            message = f"Can't retrieve data from URL {url}."

            return jsonify(message=message), 400

    elif 'file' in request.files:

        data_file = request.files['file']

        # check the file is file is in a correct format
        check_dataset(data_file)
        try:

            filename = secure_filename(data_file.filename)
            fp_data = get_data_path(project_path) / filename

            # save the file
            data_file.save(str(fp_data))

        except Exception as err:

            logging.error(err)

            response = jsonify(
                message=f"Failed to upload file '{filename}'. {err}")

            return response, 400
    else:
        response = jsonify(message="No file or dataset found to upload.")
        return response, 400

    if project_config["mode"] == PROJECT_MODE_EXPLORE:

        data_path_raw = get_data_path(project_path) / filename
        data_path = data_path_raw.with_suffix('.csv')

        data = ASReviewData.from_file(data_path_raw)
        data.df.rename({data.column_spec["included"]: "debug_label"},
                       axis=1,
                       inplace=True)
        data.to_csv(data_path)
    else:
        data_path = get_data_path(project_path) / filename

    try:
        # add the file to the project
        add_dataset_to_project(project_id, data_path.name)

    # Bad format. TODO{Jonathan} Return informative message with link.
    except BadFileFormatError as err:
        message = f"Failed to upload file '{filename}'. {err}"
        return jsonify(message=message), 400

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/data', methods=["GET"])
def api_get_project_data(project_id):  # noqa: F401
    """Get info on the article"""
    project_path = get_project_path(project_id)

    if not is_project(project_id):
        response = jsonify(message="Project not found.")
        return response, 404

    try:

        filename = get_data_file_path(project_path).stem

        # get statistics of the dataset
        statistics = get_data_statistics(project_id)
        statistics["filename"] = filename

    except FileNotFoundError as err:
        logging.info(err)
        statistics = {"filename": None}

    except Exception as err:
        logging.error(err)
        message = f"Failed to get file. {err}"
        return jsonify(message=message), 400

    response = jsonify(statistics)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/search', methods=["GET"])
def api_search_data(project_id):  # noqa: F401
    """Search for papers
    """
    q = request.args.get('q', default=None, type=str)
    max_results = request.args.get('n_max', default=10, type=int)

    project_path = get_project_path(project_id)

    try:
        payload = {"result": []}
        if q:

            # read the dataset
            as_data = read_data(project_id)

            # read record_ids of labels from state
            with open_state(project_path) as s:
                labeled_record_ids = s.get_dataset(["record_id"])["record_id"].to_list()

            # search for the keywords
            result_idx = fuzzy_find(as_data,
                                    q,
                                    max_return=max_results,
                                    exclude=labeled_record_ids,
                                    by_index=True)

            for paper in as_data.record(result_idx, by_index=True):
                payload["result"].append({
                    "id": int(paper.record_id),
                    "title": paper.title,
                    "abstract": paper.abstract,
                    "authors": paper.authors,
                    "keywords": paper.keywords,
                    "included": int(paper.included)
                })

    except SearchError as search_err:
        logging.error(search_err)
        return jsonify(message=f"Error: {search_err}"), 500

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load search results."), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/labeled', methods=["GET"])
def api_get_labeled(project_id):  # noqa: F401
    """Get all papers classified as labeled documents
    """

    page = request.args.get("page", default=None, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    subset = request.args.get("subset", default=None, type=str)
    latest_first = request.args.get("latest_first", default=1, type=int)

    project_path = get_project_path(project_id)

    try:

        with open_state(project_path) as s:
            data = s.get_dataset(["record_id", "label", "query_strategy"])
            data["prior"] = (data["query_strategy"] == "prior").astype(int)

        if subset in ["relevant", "included"]:
            data = data[data['label'] == 1]
        elif subset in ["irrelevant", "excluded"]:
            data = data[data['label'] == 0]
        else:
            data = data[~data['label'].isnull()]

        if latest_first == 1:
            data = data.iloc[::-1]

        # count labeled records and max pages
        count = len(data)
        max_page_calc = divmod(count, per_page)
        if max_page_calc[1] == 0:
            max_page = max_page_calc[0]
        else:
            max_page = max_page_calc[0] + 1

        if page is not None:
            # slice out records on specific page
            if page <= max_page:
                idx_start = page * per_page - per_page
                idx_end = page * per_page
                data = data.iloc[idx_start:idx_end, :].copy()
            else:
                raise ValueError(f"Page {page - 1} is the last page.")

            # set next & previous page
            if page < max_page:
                next_page = page + 1
                if page > 1:
                    previous_page = page - 1
                else:
                    previous_page = None
            else:
                next_page = None
                previous_page = page - 1
        else:
            next_page = None
            previous_page = None

        records = read_data(project_id).record(data["record_id"], by_index=False)

        payload = {
            "count": count,
            "next_page": next_page,
            "previous_page": previous_page,
            "result": [],
        }
        for i, record in zip(data.index.tolist(), records):

            payload["result"].append({
                "id": int(record.record_id),
                "title": record.title,
                "abstract": record.abstract,
                "authors": record.authors,
                "keywords": record.keywords,
                "included": int(data.loc[i, "label"]),
                "prior": int(data.loc[i, "prior"])
            })

    except Exception as err:
        logging.error(err)
        return jsonify(message=f"Failed to load labeled documents. {err}"), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/labeled_stats', methods=["GET"])
def api_get_labeled_stats(project_id):  # noqa: F401
    """Get all papers classified as prior documents
    """
    project_path = get_project_path(project_id)
    try:

        with open_state(project_path) as s:
            data = s.get_dataset(["label", "query_strategy"])
            data_prior = data[data["query_strategy"] == "prior"]

        response = jsonify({
            "n": len(data),
            "n_inclusions": sum(data['label'] == 1),
            "n_exclusions": sum(data['label'] == 0),
            "n_prior": len(data_prior),
            "n_prior_inclusions": sum(data_prior['label'] == 1),
            "n_prior_exclusions": sum(data_prior['label'] == 0)
        })
    except StateNotFoundError:
        response = jsonify({
            "n": 0,
            "n_inclusions": 0,
            "n_exclusions": 0,
            "n_prior": 0,
            "n_prior_inclusions": 0,
            "n_prior_exclusions": 0
        })

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load prior information."), 500

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/prior_random', methods=["GET"])
def api_random_prior_papers(project_id):  # noqa: F401
    """Get a selection of random papers to find exclusions.

    This set of papers is extracted from the pool, but without
    the already labeled items.
    """
    project_path = get_project_path(project_id)
    state_file = get_state_path(project_path)

    with open_state(state_file) as state:
        pool, _, _ = state.get_pool_labeled_pending()

    try:
        pool_random = np.random.choice(pool, 1, replace=False)[0]
    except Exception:
        raise ValueError("Not enough random indices to sample from.")

    try:
        record = read_data(project_id).record(pool_random, by_index=False)

        payload = {"result": []}

        payload["result"].append({
            "id": int(record.record_id),
            "title": record.title,
            "abstract": record.abstract,
            "authors": record.authors,
            "keywords": record.keywords,
            "included": None
        })

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load random documents."), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/algorithms', methods=["GET"])
def api_list_algorithms():
    """List the names and labels of available algorithms"""

    try:
        classes = [
            list_balance_strategies(),
            list_classifiers(),
            list_feature_extraction(),
            list_query_strategies()
        ]

        payload = {
            "balance_strategy": [],
            "classifier": [],
            "feature_extraction": [],
            "query_strategy": [],
        }

        for c, key in zip(classes, payload.keys()):
            for method in c:
                if hasattr(method, "label"):
                    payload[key].append({
                        "name": method.name,
                        "label": method.label
                    })
                else:
                    payload[key].append({
                        "name": method.name,
                        "label": method.name
                    })

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to retrieve algorithms."), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/algorithms', methods=["GET"])
def api_get_algorithms(project_id):  # noqa: F401

    default_payload = {
        "model": DEFAULT_MODEL,
        "feature_extraction": DEFAULT_FEATURE_EXTRACTION,
        "query_strategy": DEFAULT_QUERY_STRATEGY
    }

    # check if there were algorithms stored in the state file
    try:

        project_path = get_project_path(project_id)
        state_file = get_state_path(project_path)

        with open_state(state_file) as state:
            if state.settings is not None:
                payload = {
                    "model": state.settings.model,
                    "feature_extraction": state.settings.feature_extraction,
                    "query_strategy": state.settings.query_strategy
                }
            else:
                payload = default_payload
    except (StateNotFoundError):
        payload = default_payload

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/algorithms', methods=["POST"])
def api_set_algorithms(project_id):  # noqa: F401

    # TODO@{Jonathan} validate model choice on server side
    ml_model = request.form.get("model", None)
    ml_query_strategy = request.form.get("query_strategy", None)
    ml_feature_extraction = request.form.get("feature_extraction", None)

    # create a new settings object from arguments
    # only used if state file is not present
    asreview_settings = ASReviewSettings(
        mode="minimal",
        model=ml_model,
        query_strategy=ml_query_strategy,
        balance_strategy=DEFAULT_BALANCE_STRATEGY,
        feature_extraction=ml_feature_extraction)

    project_path = get_project_path(project_id)
    state_file = get_state_path(project_path)

    # save the new settings to the state file
    with open_state(state_file, read_only=False) as state:
        state.settings = asreview_settings

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/start', methods=["POST"])
def api_start(project_id):  # noqa: F401
    """Start training of first model or simulation.
    """
    project_path = get_project_path(project_id)
    project_config = get_project_config(project_id)

    # the project is a simulation project
    if project_config["mode"] == PROJECT_MODE_SIMULATE:

        logging.info("Starting simulation")

        try:
            simulation_id = uuid.uuid4().hex
            datafile = get_data_file_path(project_path)
            state_file = get_simulation_ready_path(project_path, simulation_id)

            logging.info("Project data file found: {}".format(datafile))

            add_review_to_project(project_id, simulation_id)

            # start simulation
            py_exe = _get_executable()
            run_command = [
                py_exe, "-m", "asreview", "simulate", datafile, "--state_file",
                state_file
            ]
            subprocess.Popen(run_command)

        except Exception as err:
            logging.error(err)
            message = f"Failed to get data file. {err}"
            return jsonify(message=message), 400

    # the project is an oracle or explore project
    else:

        logging.info("Train first iteration of model")
        try:
            # start training the model
            py_exe = _get_executable()
            run_command = [
                # get executable
                py_exe,
                # get module
                "-m", "asreview",
                # train the model via cli
                "web_run_model",
                # specify project id
                project_id,
                # output the error of the first model
                "--output_error"
            ]
            subprocess.Popen(run_command)

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to train the model."), 500

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/ready', methods=["GET"])
def api_init_model_ready(project_id):  # noqa: F401
    """Check if trained model is available
    """
    project_path = get_project_path(project_id)

    project_config = get_project_config(project_id)

    if project_config["mode"] == PROJECT_MODE_SIMULATE:
        logging.info("checking if simulation is ready")

        simulation_id = project_config["reviews"][0]["id"]

        if get_simulation_ready_path(project_path, simulation_id).exists():
            logging.info("simulation ready")
            update_review_in_project(project_id, simulation_id, "ready")

            response = jsonify({'status': 1})
        else:
            logging.info("simulation not ready")
            response = jsonify({'status': 0})

    else:
        error_path = get_project_path(project_id) / "error.json"
        if error_path.exists():
            logging.error("error on training")
            with open(error_path, "r") as f:
                error_message = json.load(f)
            return jsonify(message=error_message), 400

        try:
            with open_state(project_path) as state:
                if state.model_has_trained:
                    update_project_info(project_id, projectInitReady=True)

                    response = jsonify({'status': 1})
                else:
                    response = jsonify({'status': 0})

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to initiate the project."), 500

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# TODO{Terry}: This may be deprecated when the new state file is in use.
# @bp.route('/project/<project_id>/model/clear_error', methods=["DELETE"])
# def api_clear_model_error(project_id):
#     """Clear model training error"""

#     error_path = get_project_path(project_id) / "error.json"
#     project_path = get_project_path(project_id)
#     state_path = get_state_path(project_path)

#     if error_path.exists() and state_path.exists():
#         os.remove(error_path)
#         os.remove(state_path)

#         response = jsonify({'success': True})
#         response.headers.add('Access-Control-Allow-Origin', '*')
#         return response

#     response = jsonify(message="Failed to clear model training error.")
#     return response, 500


@bp.route('/project/import_project', methods=["POST"])
def api_import_project():
    """Import uploaded project"""

    # raise error if file not given
    if 'file' not in request.files:
        response = jsonify(message="No file found to upload.")
        return response, 400

    # set the project file
    project_file = request.files['file']
    # import the project
    project_id = import_project_file(project_file)

    # return the project info in the same format as project_info
    return jsonify(id=project_id)


@bp.route('/project/<project_id>/export', methods=["GET"])
def export_results(project_id):
    project_path = get_project_path(project_id)

    # get the export args
    file_type = request.args.get('file_type', None)

    try:
        # CSV
        if file_type == "csv":
            dataset_str = export_to_string(project_id, export_type="csv")

            return Response(
                dataset_str,
                mimetype="text/csv",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project_id}.csv"
                })
        # TSV
        elif file_type == "tsv":
            dataset_str = export_to_string(project_id, export_type="tsv")

            return Response(
                dataset_str,
                mimetype="text/tab-separated-values",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project_id}.tsv"
                })
        # Excel
        elif file_type == "xlsx":
            dataset_str = export_to_string(project_id, export_type="excel")
            fp_tmp_export = Path(get_tmp_path(project_path), "export_result.xlsx")

            return send_file(
                fp_tmp_export,
                mimetype=   # noqa
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # noqa
                as_attachment=True,
                download_name=f"asreview_result_{project_id}.xlsx",
                max_age=0)
        # RIS
        elif file_type == "ris":
            if get_data_file_path(project_id).suffix not in [
                    ".ris", ".RIS", ".txt", ".TXT"
            ]:
                raise ValueError(
                    "RIS file can be exported only when RIS file was imported.")

            dataset_str = export_to_string(project_id, export_type="ris")

            return Response(
                dataset_str,
                mimetype="application/octet-stream",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project_id}.ris"
                })

        else:
            raise TypeError("File type should be: .ris/.csv/.tsv/.xlsx")
    except Exception as err:
        logging.error(err)
        return jsonify(message=f"Failed to export the {file_type} dataset."), 500


@bp.route('/project/<project_id>/export_project', methods=["GET"])
def export_project(project_id):
    """Export the project file.

    The ASReview project file is a file with .asreview extension.
    The ASReview project file is a zipped file and contains
    all information to continue working on the project as well
    as the orginal dataset.
    """

    # create a temp folder to zip
    tmpdir = tempfile.TemporaryDirectory()

    # copy the source tree, but ignore pickle files
    shutil.copytree(get_project_path(project_id),
                    Path(tmpdir.name, project_id),
                    ignore=shutil.ignore_patterns('*.pickle'))

    # create the archive
    shutil.make_archive(Path(tmpdir.name, project_id),
                        "zip",
                        root_dir=Path(tmpdir.name, project_id))

    try:
        # return the project file to the user
        return send_file(str(Path(tmpdir.name, f"{project_id}.zip")),
                         as_attachment=True,
                         download_name=f"{project_id}.asreview",
                         max_age=0)

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to export the project."), 500


@bp.route('/project/<project_id>/finish', methods=["GET"])
def api_finish_project(project_id):
    """Mark a project as finished or not"""
    project_path = get_project_path(project_id)

    # read the file with project info
    with open(get_project_file_path(project_path), "r") as fp:
        project_info = json.load(fp)

    try:
        project_info["reviewFinished"] = not project_info["reviewFinished"]
    except KeyError:
        # missing key in projects created in older versions
        project_info["reviewFinished"] = True

    # update the file with project info
    with open(get_project_file_path(project_path), "w") as fp:
        json.dump(project_info, fp)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# @bp.route('/project/<project_id>/document/<doc_id>/info', methods=["GET"])
# def api_get_article_info(project_id, doc_id=None):  # noqa: F401
#     """Get info on the article"""

#     data = get_paper_data(
#         project_id,
#         paper_id=doc_id,
#         return_debug_label=True
#     )

#     response = jsonify(data)
#     response.headers.add('Access-Control-Allow-Origin', '*')

#     return response


@bp.route('/project/<project_id>/progress', methods=["GET"])
def api_get_progress_info(project_id):  # noqa: F401
    """Get progress statistics of a project"""

    try:
        statistics = get_statistics(project_id)

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load progress statistics."), 500

    response = jsonify(statistics)
    response.headers.add('Access-Control-Allow-Origin', '*')

    # return a success response to the client.
    return response


@bp.route('/project/<project_id>/progress_density', methods=["GET"])
def api_get_progress_density(project_id):
    """Get progress density of a project"""

    try:
        # get label history
        project_path = get_project_path(project_id)

        with open_state(project_path) as s:
            data = s.get_labels()

        # create a dataset with the rolling mean of every 10 papers
        df = data \
            .to_frame(name="Relevant") \
            .rolling(10, min_periods=1) \
            .mean()
        df["Total"] = df.index + 1

        # transform mean(percentage) to number
        for i in range(0, len(df)):
            if df.loc[i, "Total"] < 10:
                df.loc[i, "Irrelevant"] = (
                    1 - df.loc[i, "Relevant"]) * df.loc[i, "Total"]
                df.loc[i,
                       "Relevant"] = df.loc[i, "Total"] - df.loc[i,
                                                                 "Irrelevant"]
            else:
                df.loc[i, "Irrelevant"] = (1 - df.loc[i, "Relevant"]) * 10
                df.loc[i, "Relevant"] = 10 - df.loc[i, "Irrelevant"]

        df = df.round(1).to_dict(orient="records")
        for d in df:
            d["x"] = d.pop("Total")

        df_relevant = [{k: v
                        for k, v in d.items() if k != "Irrelevant"}
                       for d in df]
        for d in df_relevant:
            d["y"] = d.pop("Relevant")

        df_irrelevant = [{k: v
                          for k, v in d.items() if k != "Relevant"}
                         for d in df]
        for d in df_irrelevant:
            d["y"] = d.pop("Irrelevant")

        payload = {"relevant": df_relevant, "irrelevant": df_irrelevant}

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load progress density."), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/progress_recall', methods=["GET"])
def api_get_progress_recall(project_id):
    """Get cumulative number of inclusions by ASReview/at random"""

    project_path = get_project_path(project_id)
    try:
        with open_state(project_path) as s:
            data = s.get_labels()
            n_records = len(s.get_record_table())

        # create a dataset with the cumulative number of inclusions
        df = data \
            .to_frame(name="Relevant") \
            .cumsum()
        df["Total"] = df.index + 1
        df["Random"] = (df["Total"] *
                        (df["Relevant"][-1:] / n_records).values).round()

        df = df.round(1).to_dict(orient="records")
        for d in df:
            d["x"] = d.pop("Total")

        df_asreview = [{k: v
                        for k, v in d.items() if k != "Random"} for d in df]
        for d in df_asreview:
            d["y"] = d.pop("Relevant")

        df_random = [{k: v
                      for k, v in d.items() if k != "Relevant"} for d in df]
        for d in df_random:
            d["y"] = d.pop("Random")

        payload = {"asreview": df_asreview, "random": df_random}

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load progress recall."), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/record/<doc_id>', methods=["POST", "PUT"])
def api_classify_instance(project_id, doc_id):  # noqa: F401
    """Label item

    This request handles the document identifier and the corresponding label.
    The result is stored in a temp location. If this storage exceeds a certain
    amount of values, then the model is triggered. The values of the location
    are passed to the model and the storaged is cleared. This model will run
    in the background.
    """
    # return the combination of document_id and label.
    doc_id = request.form.get('doc_id')
    label = request.form.get('label')
    is_prior = request.form.get('is_prior', default=False)

    retrain_model = False if is_prior == "1" else True
    prior = True if is_prior == "1" else False

    if request.method == 'POST':
        label_instance(project_id,
                       doc_id,
                       label,
                       prior=prior,
                       retrain_model=retrain_model)
    elif request.method == 'PUT':
        update_instance(project_id,
                        doc_id,
                        label,
                        retrain_model=retrain_model)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/get_document', methods=["GET"])
def api_get_document(project_id):  # noqa: F401
    """Retrieve documents in order of review.

    After these documents were retrieved, the queue on the client side is
    updated.
    This request can get triggered after each document classification.
    Although it might be better to call this function after 20 requests on the
    client side.
    """
    try:
        new_instance = get_instance(project_id)

        if new_instance is None:  # don't use 'if not new_instance:'

            item = None
            pool_empty = True
        else:

            item = get_paper_data(project_id,
                                  new_instance,
                                  return_debug_label=True)
            item["doc_id"] = new_instance
            pool_empty = False

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to retrieve new documents."), 500

    response = jsonify({"result": item, "pool_empty": pool_empty})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/delete', methods=["DELETE"])
def api_delete_project(project_id):  # noqa: F401
    """Get info on the article"""

    # some checks to check if there is a project to delete
    if project_id == "" or project_id is None:
        response = jsonify(message="project-delete-failure")
        return response, 500

    project_path = get_project_path(project_id)

    if project_path.exists() and project_path.is_dir():
        shutil.rmtree(project_path)

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    response = jsonify(message="project-delete-failure")
    return response, 500
