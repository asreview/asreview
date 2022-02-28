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
from asreview.state.paths import get_simulation_ready_path
from asreview.state.paths import get_state_path
from asreview.state.paths import get_tmp_path
from asreview.state.sql_converter import is_old_project
from asreview.state.sql_converter import upgrade_asreview_project_file
from asreview.state.utils import open_state
from asreview.datasets import get_dataset_metadata
from asreview.webapp.sqlock import SQLiteLock
from asreview.project import is_project
from asreview.webapp.io import read_data
from asreview.utils import _get_executable
from asreview.webapp.utils import export_to_string
from asreview.webapp.utils import get_paper_data
from asreview.webapp.utils import get_statistics
from asreview.webapp.utils import import_project_file
from asreview.webapp.utils import init_project
from asreview.webapp.utils import label_instance
from asreview.webapp.utils import update_instance
from asreview.project import _create_project_id
from asreview.project import ASReviewProject
from asreview.project import project_from_id
from asreview.project import ProjectNotFoundError
from asreview.project import get_project_path
from asreview.project import list_asreview_projects
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

    project_info = []
    for project in list_asreview_projects():

        try:
            with open(project.project_path / "project.json", "r") as f:
                res = json.load(f)

            # backwards support <0.10
            if "projectInitReady" not in res:
                res["projectInitReady"] = True

            # if time is not available (<0.14)
            if "created_at_unix" not in res:
                res["created_at_unix"] = None

            # check if project is old
            res["projectNeedsUpgrade"] = is_old_project(project.project_path)

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

    stats_counter = Counter()

    for project in list_asreview_projects():

        try:
            with open(project.project_path / "project.json", "r") as f:
                res = json.load(f)

            # backwards support <0.10
            if "projectInitReady" not in res:
                res["projectInitReady"] = True

            # get dashboard statistics
            statistics = api_get_progress_info(project.project_id)
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


@bp.route('/projects/info', methods=["POST"])
def api_init_project():  # noqa: F401
    """Get info on the article"""

    project_mode = request.form['mode']
    project_name = request.form['name']
    project_description = request.form['description']
    project_authors = request.form['authors']

    project_id = _create_project_id(project_name)
    project_path = get_project_path(project_id)

    project = ASReviewProject.create(
        get_project_path(project_id),
        project_id=project_id,
        project_mode=project_mode,
        project_name=project_name,
        project_description=project_description,
        project_authors=project_authors
    )

    response = jsonify(project.config)

    return response, 201


@bp.route('/project/<project_id>/upgrade_if_old', methods=["GET"])
@project_from_id
def api_upgrade_project_if_old(project):
    """Get upgrade project if it is v0.x"""

    try:
        upgrade_asreview_project_file(project.project_path)

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
@project_from_id
def api_get_project_info(project):  # noqa: F401
    """Get info on the article"""

    project_config = project.config

    try:

        # check if there is a dataset
        try:
            get_data_file_path(project.project_path)
            project_config["projectHasDataset"] = True
        except Exception:
            project_config["projectHasDataset"] = False

        # backwards support <0.10
        if "projectInitReady" not in project_config:
            if "projectHasPriorKnowledge" not in project_config:
                pass
            else:
                if project_config["projectHasPriorKnowledge"]:
                    project_config["projectInitReady"] = True
                else:
                    project_config["projectInitReady"] = False

        # check if project is old
        project_info["projectNeedsUpgrade"] = is_old_project(project_path)

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to retrieve project information."), 500

    return jsonify(project_config)


@bp.route('/project/<project_id>/info', methods=["PUT"])
@project_from_id
def api_update_project_info(project):  # noqa: F401
    """Get info on the article"""

    # rename the project if project name is changed
    if request.form.get('name', None) is not None:
        project_path = project.rename(request.form['name'])

    # update the project info
    project.update_config(
        mode=request.form['mode'],
        description=request.form['description'],
        authors=request.form['authors'])

    return api_get_project_info(project.project_path)


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
@project_from_id
def api_upload_data_to_project(project):  # noqa: F401
    """Get info on the article"""

    # get the project config to modify behavior of dataset
    project_config = project.config

    # remove old dataset if present
    if "dataset_path" in project_config and \
            project_config["dataset_path"] is not None:
        logging.warning("Removing old dataset and adding new dataset.")
        remove_dataset_from_project(project.project_path)

    # create dataset folder if not present
    get_data_path(project.project_path).mkdir(exist_ok=True)

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

            urlretrieve(url, get_data_path(project.project_path) / filename)

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
        # check_dataset(data_file)
        try:

            filename = secure_filename(data_file.filename)
            fp_data = get_data_path(project.project_path) / filename

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

        data_path_raw = get_data_path(project.project_path) / filename
        data_path = data_path_raw.with_suffix('.csv')

        data = ASReviewData.from_file(data_path_raw)
        data.df.rename({data.column_spec["included"]: "debug_label"},
                       axis=1,
                       inplace=True)
        data.to_csv(data_path)

    elif project_config["mode"] == PROJECT_MODE_SIMULATE:

        data_path_raw = get_data_path(project_path) / filename
        data_path = data_path_raw.with_suffix('.csv')

        data = ASReviewData.from_file(data_path_raw)
        data.df["debug_label"] = data.df[data.column_spec["included"]]
        data.to_csv(data_path)

    else:
        data_path = get_data_path(project.project_path) / filename

    try:
        # add the file to the project
        project.add_dataset(data_path.name)

    # Bad format. TODO{Jonathan} Return informative message with link.
    except BadFileFormatError as err:
        message = f"Failed to upload file '{filename}'. {err}"
        return jsonify(message=message), 400

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/data', methods=["GET"])
@project_from_id
def api_get_project_data(project):  # noqa: F401
    """Get info on the article"""

    if not is_project(project.project_path):
        response = jsonify(message="Project not found.")
        return response, 404

    try:

        filename = get_data_file_path(project.project_path).stem

        # get statistics of the dataset
        as_data = read_data(project_path)

        statistics = {
            "n_rows": as_data.df.shape[0],
            "n_cols": as_data.df.shape[1],
            "filename": filename,
        }

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
@project_from_id
def api_search_data(project):  # noqa: F401
    """Search for papers
    """
    q = request.args.get('q', default=None, type=str)
    max_results = request.args.get('n_max', default=10, type=int)

    try:
        payload = {"result": []}
        if q:

            # read the dataset
            as_data = read_data(project.project_path)

            # read record_ids of labels from state
            with open_state(project.project_path) as s:
                labeled_record_ids = s.get_dataset(["record_id"])["record_id"].to_list()

            # search for the keywords
            result_idx = fuzzy_find(as_data,
                                    q,
                                    max_return=max_results,
                                    exclude=labeled_record_ids,
                                    by_index=True)

            for record in as_data.record(result_idx, by_index=True):

                debug_label = record.extra_fields.get("debug_label", None)
                debug_label = int(debug_label) if pd.notnull(debug_label) else None

                if project_config["mode"] == PROJECT_MODE_SIMULATE:
                    # ignore existing labels
                    included = -1
                else:
                    included = int(record.included)

                payload["result"].append({
                    "id": int(record.record_id),
                    "title": record.title,
                    "abstract": record.abstract,
                    "authors": record.authors,
                    "keywords": record.keywords,
                    "included": included,
                    "_debug_label": debug_label
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
@project_from_id
def api_get_labeled(project):  # noqa: F401
    """Get all papers classified as labeled documents
    """

    page = request.args.get("page", default=None, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    subset = request.args.getlist("subset")
    latest_first = request.args.get("latest_first", default=1, type=int)

    try:

        with open_state(project.project_path) as s:
            data = s.get_dataset(["record_id", "label", "query_strategy", "notes"])
            data["prior"] = (data["query_strategy"] == "prior").astype(int)

        if any(s in subset for s in ["relevant", "included"]):
            data = data[data["label"] == 1]
        elif any(s in subset for s in ["irrelevant", "excluded"]):
            data = data[data["label"] == 0]
        else:
            data = data[~data["label"].isnull()]

        if "note" in subset:
            data = data[~data["notes"].isnull()]

        if "prior" in subset:
            data = data[data["prior"] == 1]

        if latest_first == 1:
            data = data.iloc[::-1]

        # count labeled records and max pages
        count = len(data)
        if count == 0:
            raise ValueError("No available record")

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
                raise ValueError(f"Page {page - 1} is the last page")

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

        records = read_data(project.project_path).record(data["record_id"], by_index=False)

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
                "note": data.loc[i, "notes"],
                "prior": int(data.loc[i, "prior"])
            })

    except Exception as err:
        logging.error(err)
        return jsonify(message=f"{err}"), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/labeled_stats', methods=["GET"])
@project_from_id
def api_get_labeled_stats(project):  # noqa: F401
    """Get all papers classified as prior documents
    """

    try:

        with open_state(project.project_path) as s:
            data = s.get_dataset(["label", "query_strategy"])
            # Drop pending records.
            data = data[~data['label'].isna()]
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
@project_from_id
def api_random_prior_papers(project):  # noqa: F401
    """Get a selection of random papers to find exclusions.

    This set of papers is extracted from the pool, but without
    the already labeled items.
    """
    state_file = get_state_path(project.project_path)

    with open_state(state_file) as state:
        pool = state.get_pool()

    try:
        pool_random = np.random.choice(pool, 1, replace=False)[0]
    except Exception:
        raise ValueError("Not enough random indices to sample from.")

    try:
        record = read_data(project.project_path).record(pool_random, by_index=False)

        debug_label = record.extra_fields.get("debug_label", None)
        debug_label = int(debug_label) if pd.notnull(debug_label) else None

        payload = {"result": []}

        payload["result"].append({
            "id": int(record.record_id),
            "title": record.title,
            "abstract": record.abstract,
            "authors": record.authors,
            "keywords": record.keywords,
            "included": None,
            "_debug_label": debug_label
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
@project_from_id
def api_get_algorithms(project):  # noqa: F401

    default_payload = {
        "model": DEFAULT_MODEL,
        "feature_extraction": DEFAULT_FEATURE_EXTRACTION,
        "query_strategy": DEFAULT_QUERY_STRATEGY
    }

    # check if there were algorithms stored in the state file
    try:

        state_file = get_state_path(project.project_path)

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
@project_from_id
def api_set_algorithms(project):  # noqa: F401

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

    state_file = get_state_path(project.project_path)

    # save the new settings to the state file
    with open_state(state_file, read_only=False) as state:
        state.settings = asreview_settings

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/start', methods=["POST"])
@project_from_id
def api_start(project):  # noqa: F401
    """Start training of first model or simulation.
    """

    # the project is a simulation project
    if project.config["mode"] == PROJECT_MODE_SIMULATE:

        # get priors
        with open_state(project_path) as s:
            priors = s.get_priors().tolist()

        logging.info("Start simulation")

        try:
            simulation_id = uuid.uuid4().hex
            datafile = get_data_file_path(project.project_path)
            state_file = get_simulation_ready_path(project.project_path, simulation_id)

            logging.info("Project data file found: {}".format(datafile))

            project.add_review(simulation_id)

            # start simulation
            py_exe = _get_executable()
            run_command = [
                # get executable
                py_exe,
                # get module
                "-m", "asreview",
                # run simulation via cli
                "simulate",
                # specify dataset
                "",
                # specify prior indices
                "--prior_idx"] + list(map(str, priors)) + [
                # specify state file
                "--state_file",
                project_path
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
                project.project_path,
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
@project_from_id
def api_init_model_ready(project):  # noqa: F401
    """Check if trained model is available
    """

    project_config = project.config

    if project_config["mode"] == PROJECT_MODE_SIMULATE:
        logging.info("checking if simulation is ready")

        simulation_id = project_config["reviews"][0]["id"]

        if get_simulation_ready_path(project.project_path, simulation_id).exists():
            logging.info("simulation ready")
            project.update_review(simulation_id, "ready")

            response = jsonify({'status': 1})
        else:
            logging.info("simulation not ready")
            response = jsonify({'status': 0})

    else:
        error_path = project.project_path / "error.json"
        if error_path.exists():
            logging.error("error on training")
            with open(error_path, "r") as f:
                error_message = json.load(f)
            return jsonify(message=error_message), 400

        try:
            with open_state(project.project_path) as state:
                if state.model_has_trained:
                    project.update_config(projectInitReady=True)

                    response = jsonify({'status': 1})
                else:
                    response = jsonify({'status': 0})

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to initiate the project."), 500

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/import_project', methods=["POST"])
def api_import_project():
    """Import uploaded project"""

    # raise error if file not given
    if 'file' not in request.files:
        response = jsonify(message="No file found to upload.")
        return response, 400

    # set the project file
    project_file = request.files['file']



    # # import the project
    # project_info = import_project_file(project_file)




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

    # return the project info in the same format as project_info
    return jsonify(project_info)


@bp.route('/project/<project_id>/export', methods=["GET"])
@project_from_id
def export_results(project):

    # get the export args
    file_type = request.args.get('file_type', None)


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

    try:
        # CSV
        if file_type == "csv":
            dataset_str = as_data.to_csv(fp=None, labels=labeled, ranking=ranking)

            return Response(
                dataset_str,
                mimetype="text/csv",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project.project_id}.csv"
                })
        # TSV
        elif file_type == "tsv":
            dataset_str = as_data.to_csv(
                fp=None, sep="\t", labels=labeled, ranking=ranking)

            return Response(
                dataset_str,
                mimetype="text/tab-separated-values",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project.project_id}.tsv"
                })
        # Excel
        # TODO: Take only one. Frontend uses "excel", rest uses "xlsx".
        elif file_type == "xlsx" or file_type == "excel":

            get_tmp_path(project.project_path).mkdir(exist_ok=True)
            fp_tmp_export = Path(get_tmp_path(project.project_path), "export_result.xlsx")
            dataset_str = as_data.to_excel(
                fp=fp_tmp_export, labels=labeled, ranking=ranking)

            return send_file(
                fp_tmp_export,
                mimetype=   # noqa
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # noqa
                as_attachment=True,
                download_name=f"asreview_result_{project.project_id}.xlsx",
                max_age=0)
        # RIS
        elif file_type == "ris":
            if get_data_file_path(project.project_path).suffix not in [
                    ".ris", ".RIS", ".txt", ".TXT"
            ]:
                raise ValueError(
                    "RIS file can be exported only when RIS file was imported.")

            dataset_str = as_data.to_ris(fp=None, labels=labeled, ranking=ranking)

            return Response(
                dataset_str,
                mimetype="application/octet-stream",
                headers={
                    "Content-disposition":
                    f"attachment; filename=asreview_result_{project.project_id}.ris"
                })

        else:
            raise TypeError("File type should be: .ris/.csv/.tsv/.xlsx")
    except Exception as err:
        logging.error(err)
        return jsonify(message=f"Failed to export the {file_type} dataset."), 500


@bp.route('/project/<project_id>/export_project', methods=["GET"])
@project_from_id
def export_project(project):
    """Export the project file.

    The ASReview project file is a file with .asreview extension.
    The ASReview project file is a zipped file and contains
    all information to continue working on the project as well
    as the orginal dataset.
    """

    # create a temp folder to zip
    tmpdir = tempfile.TemporaryDirectory()
    tmpfile = Path(tmpdir.name, project.project_id, ".asreview")

    project.export(tmpfile)

    return send_file(tmpfile,
                     as_attachment=True,
                     download_name=f"{project.project_id}.asreview",
                     max_age=0)


@bp.route('/project/<project_id>/finish', methods=["GET"])
@project_from_id
def api_finish_project(project):
    """Mark a project as finished or not"""

    # read the file with project info
    project_config = project.config

    try:
        project_config["reviewFinished"] = not project_config["reviewFinished"]
    except KeyError:
        # missing key in projects created in older versions
        project_config["reviewFinished"] = True

    # update the file with project info
    project.config = project_config

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/progress', methods=["GET"])
@project_from_id
def api_get_progress_info(project):  # noqa: F401
    """Get progress statistics of a project"""

    try:

        if is_v0_project(project.project_path):
            json_fp = Path(project.project_path, 'result.json')

            # Check if the v0 project is in review.
            if json_fp.exists():

                with open(json_fp, 'r') as f:
                    s = json.load(f)

                # Get the labels.
                labels = np.array([
                    int(sample_data[1])
                    for query in range(len(s['results']))
                    for sample_data in s['results'][query]['labelled']
                ])

                # Get the record table.
                data_hash = list(s['data_properties'].keys())[0]
                record_table = s['data_properties'][data_hash][
                    'record_table']

                n_records = len(record_table)

            # No result found.
            else:
                labels = np.array([])
                n_records = 0
        else:
            # Check if there is a review started in the project.
            try:
                with open_state(project.project_path) as s:
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

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to load progress statistics."), 500

    response = jsonify({
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_since_last_inclusion": n_since_last_relevant,
        "n_papers": n_records,
        "n_pool": n_records - n_excluded - n_included
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    # return a success response to the client.
    return response


@bp.route('/project/<project_id>/progress_density', methods=["GET"])
@project_from_id
def api_get_progress_density(project):
    """Get progress density of a project"""

    include_priors = request.args.get('priors', False, type=bool)

    try:
        # get label history
        with open_state(project.project_path) as s:
            data = s.get_labels(priors=include_priors)

        # create a dataset with the rolling mean of every 10 papers
        df = data \
            .to_frame(name="Relevant") \
            .reset_index(drop=True) \
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
def api_get_progress_recall(project):
    """Get cumulative number of inclusions by ASReview/at random"""

    include_priors = request.args.get('priors', False, type=bool)

    try:
        with open_state(project.project_path) as s:
            data = s.get_labels(priors=include_priors)
            n_records = len(s.get_record_table())

        # create a dataset with the cumulative number of inclusions
        df = data \
            .to_frame(name="Relevant") \
            .reset_index(drop=True) \
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
@project_from_id
def api_classify_instance(project, doc_id):  # noqa: F401
    """Label item

    This request handles the document identifier and the corresponding label.
    The result is stored in a temp location. If this storage exceeds a certain
    amount of values, then the model is triggered. The values of the location
    are passed to the model and the storaged is cleared. This model will run
    in the background.
    """
    # return the combination of document_id and label.
    record_id = request.form.get('doc_id')
    label = int(request.form.get('label'))
    note = request.form.get('note', type=str)
    if not note:
        note = None

    is_prior = request.form.get('is_prior', default=False)

    retrain_model = False if is_prior == "1" else True
    prior = True if is_prior == "1" else False

    state_path = get_state_path(project_path)

    if request.method == 'POST':

        with open_state(state_path, read_only=False) as state:

            # get the index of the active iteration
            if label in [0, 1]:

                # add the labels as prior data
                state.add_labeling_data(record_ids=[record_id],
                                        labels=[label],
                                        notes=[note],
                                        prior=prior)

            elif label == -1:
                with open_state(state_path, read_only=False) as state:
                    state.delete_record_labeling_data(record_id)

    elif request.method == 'PUT':

        with open_state(state_path, read_only=False) as state:
            state.update_decision(record_id, label, note=note)

    if retrain_model:

        # retrain model
        subprocess.Popen([
            _get_executable(),
            "-m",
            "asreview",
            "web_run_model",
            project_path
        ])

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/get_document', methods=["GET"])
@project_from_id
def api_get_document(project):  # noqa: F401
    """Retrieve documents in order of review.

    After these documents were retrieved, the queue on the client side is
    updated.
    This request can get triggered after each document classification.
    Although it might be better to call this function after 20 requests on the
    client side.
    """
    try:

        with open_state(project.project_path, read_only=False) as state:
            # First check if there is a pending record.
            _, _, pending = state.get_pool_labeled_pending()
            if not pending.empty:
                record_ids = pending.to_list()
            # Else query for a new record.
            else:
                record_ids = state.query_top_ranked(1)

        if len(record_ids) > 0:
            new_instance = record_ids[0]

            as_data = read_data(project.project_path)
            record = as_data.record(int(new_instance), by_index=False)

            item = {}
            item['title'] = record.title
            item['authors'] = record.authors
            item['abstract'] = record.abstract
            item['doi'] = record.doi

            # return the debug label
            debug_label = record.extra_fields.get("debug_label", None)
            item['_debug_label'] = \
                int(debug_label) if pd.notnull(debug_label) else None

            item["doc_id"] = new_instance
            pool_empty = False
        else:
            # end of pool
            project.update_config(project_path, reviewFinished=True)
            item = None
            pool_empty = True

    except Exception as err:
        logging.error(err)
        return jsonify(message="Failed to retrieve new documents."), 500

    response = jsonify({"result": item, "pool_empty": pool_empty})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/delete', methods=["DELETE"])
@project_from_id
def api_delete_project(project):  # noqa: F401
    """Get info on the article"""

    # some checks to check if there is a project to delete
    if project.project_id == "" or project.project_id is None:
        response = jsonify(message="project-delete-failure")
        return response, 500

    if project.project_path.exists() and project.project_path.is_dir():
        try:
            shutil.rmtree(project.project_path)
        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to delete project."), 500

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    response = jsonify(message="project-delete-failure")
    return response, 500
