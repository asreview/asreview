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
import logging
import shutil
import subprocess
import tempfile
import urllib.parse
from pathlib import Path
from urllib.request import urlretrieve

from flask import Blueprint
from flask import abort
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
from asreview.data.statistics import n_duplicates
from asreview.datasets import DatasetManager
from asreview.exceptions import BadFileFormatError
from asreview.io import list_readers
from asreview.io import list_writers
from asreview.models.balance import get_balance_model
from asreview.models.balance import list_balance_strategies
from asreview.models.classifiers import get_classifier
from asreview.models.classifiers import list_classifiers
from asreview.models.feature_extraction import get_feature_model
from asreview.models.feature_extraction import list_feature_extraction
from asreview.models.query import get_query_model
from asreview.models.query import list_query_strategies
from asreview.project import ASReviewProject
from asreview.project import ProjectNotFoundError
from asreview.project import _create_project_id
from asreview.project import get_project_path
from asreview.project import is_project
from asreview.project import is_v0_project
from asreview.project import list_asreview_projects
from asreview.project import open_state
from asreview.project import project_from_id
from asreview.search import SearchError
from asreview.search import fuzzy_find
from asreview.settings import ASReviewSettings
from asreview.state.errors import StateError
from asreview.state.errors import StateNotFoundError
from asreview.state.sql_converter import upgrade_asreview_project_file
from asreview.state.sql_converter import upgrade_project_config
from asreview.utils import _get_executable
from asreview.utils import asreview_path
from asreview.webapp.io import read_data

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

            project_config = project.config

            # upgrade info of v0 projects
            if project_config["version"].startswith("0"):
                project_config = upgrade_project_config(project_config)
                project_config["projectNeedsUpgrade"] = True

            logging.info("Project found: {}".format(project_config["id"]))
            project_info.append(project_config)

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

    stats_counter = {
        "n_in_review": 0,
        "n_finished": 0,
        "n_setup": 0
    }

    for project in list_asreview_projects():

        try:
            project_config = project.config

            # upgrade info of v0 projects
            if project_config["version"].startswith("0"):
                project_config = upgrade_project_config(project_config)
                project_config["projectNeedsUpgrade"] = True

            # get dashboard statistics
            try:
                if project_config["reviews"][0]["status"] == "review":
                    stats_counter["n_in_review"] += 1
                elif project_config["reviews"][0]["status"] == "finished":
                    stats_counter["n_finished"] += 1
                else:
                    stats_counter["n_setup"] += 1
            except Exception:
                stats_counter["n_setup"] += 1

        except Exception as err:
            logging.error(err)
            return jsonify(message=f"Failed to load dashboard statistics. {err}"), 500

    response = jsonify({"result": stats_counter})
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

    if not project_id and not isinstance(project_id, str) \
            and len(project_id) >= 3:
        raise ValueError("Project name should be at least 3 characters.")

    project = ASReviewProject.create(get_project_path(project_id),
                                     project_id=project_id,
                                     project_mode=project_mode,
                                     project_name=project_name,
                                     project_description=project_description,
                                     project_authors=project_authors)

    response = jsonify(project.config)

    return response, 201


@bp.route('/projects/<project_id>/upgrade_if_old', methods=["GET"])
@project_from_id
def api_upgrade_project_if_old(project):
    """Get upgrade project if it is v0.x"""

    if not project.config["version"].startswith("0"):
        response = jsonify(
            message="Can only convert v0.x projects.")
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 400

    # errors are handled by the InternalServerError
    upgrade_asreview_project_file(project.project_path)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/info', methods=["GET"])
@project_from_id
def api_get_project_info(project):  # noqa: F401
    """Get info on the article"""

    project_config = project.config

    # upgrade info of v0 projects
    if project_config["version"].startswith("0"):
        project_config = upgrade_project_config(project_config)
        project_config["projectNeedsUpgrade"] = True

    return jsonify(project_config)


@bp.route('/projects/<project_id>/info', methods=["PUT"])
@project_from_id
def api_update_project_info(project):  # noqa: F401
    """Get info on the article"""

    # rename the project if project name is changed
    if request.form.get('name', None) is not None:
        project.rename(request.form['name'])

    # update the project info
    project.update_config(mode=request.form['mode'],
                          description=request.form['description'],
                          authors=request.form['authors'])

    return api_get_project_info(project.project_id)


@bp.route('/datasets', methods=["GET"])
def api_demo_data_project():  # noqa: F401
    """Get info on the article"""

    subset = request.args.get('subset', None)

    manager = DatasetManager()

    if subset == "plugin":

        try:
            result_datasets = manager.list(
                exclude=["builtin", "benchmark", "benchmark-nature"])

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load plugin datasets."), 500

    elif subset == "benchmark":

        try:
            # collect the datasets metadata
            result_datasets = manager.list(include=["benchmark-nature", "benchmark"])

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


@bp.route('/projects/<project_id>/data', methods=["POST", "PUT"])
@project_from_id
def api_upload_data_to_project(project):  # noqa: F401
    """Get info on the article"""

    # get the project config to modify behavior of dataset
    project_config = project.config

    # remove old dataset if present
    if "dataset_path" in project_config and \
            project_config["dataset_path"] is not None:
        logging.warning("Removing old dataset and adding new dataset.")
        project.remove_dataset()

    # create dataset folder if not present
    Path(project.project_path, "data").mkdir(exist_ok=True)

    if request.form.get('plugin', None):
        url = DatasetManager().find(request.form['plugin']).filepath

    if request.form.get('benchmark', None):
        url = DatasetManager().find(request.form['benchmark']).filepath

    if request.form.get('url', None):
        url = request.form['url']

    if request.form.get('plugin', None) or request.form.get(
            'benchmark', None) or request.form.get('url', None):
        try:
            url_parts = urllib.parse.urlparse(url)
            filename = secure_filename(url_parts.path.rsplit('/', 1)[-1])

            urlretrieve(url, Path(project.project_path, "data") / filename)

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
            fp_data = Path(project.project_path, "data") / filename

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

        data_path_raw = Path(project.project_path, "data") / filename
        data_path = data_path_raw.with_suffix('.csv')

        data = ASReviewData.from_file(data_path_raw)

        if data.labels is None:
            raise ValueError("Upload fully labeled dataset.")

        data.df.rename({data.column_spec["included"]: "debug_label"},
                       axis=1,
                       inplace=True)
        data.to_file(data_path)

    elif project_config["mode"] == PROJECT_MODE_SIMULATE:

        data_path_raw = Path(project.project_path, "data") / filename
        data_path = data_path_raw.with_suffix('.csv')

        data = ASReviewData.from_file(data_path_raw)

        if data.labels is None:
            raise ValueError("Upload fully labeled dataset.")

        data.df["debug_label"] = data.df[data.column_spec["included"]]
        data.to_file(data_path)

    else:
        data_path = Path(project.project_path, "data") / filename

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


@bp.route('/projects/<project_id>/data', methods=["GET"])
@project_from_id
def api_get_project_data(project):  # noqa: F401
    """Get info on the article"""

    if not is_project(project.project_path):
        response = jsonify(message="Project not found.")
        return response, 404

    try:

        # get statistics of the dataset
        as_data = read_data(project)

        statistics = {
            "n_rows": as_data.df.shape[0],
            "n_cols": as_data.df.shape[1],
            "n_duplicates": n_duplicates(as_data),
            "filename": Path(project.config["dataset_path"]).stem,
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


@bp.route('/projects/<project_id>/dataset_writer', methods=["GET"])
@project_from_id
def api_list_dataset_writers(project):
    """List the name and label of available dataset writer"""

    fp_data = Path(project.config["dataset_path"])

    try:
        readers = list_readers()
        writers = list_writers()

        # get write format for the data file
        write_format = None
        for c in readers:
            if fp_data.suffix in c.read_format:
                if write_format is None:
                    write_format = c.write_format

        # get available writers
        payload = {"result": []}
        for c in writers:
            payload["result"].append({
                "enabled": True if c.write_format in write_format else False,
                "name": c.name,
                "label": c.label,
                "caution": c.caution if hasattr(c, "caution") else None
            })

        if not payload["result"]:
            return jsonify(
                message=f"No dataset writer available for {fp_data.suffix} file."
            ), 500

        # remove duplicate writers
        payload["result"] = [
            i for n, i in enumerate(payload["result"])
            if i not in payload["result"][n + 1:]
        ]

    except Exception as err:
        logging.error(err)
        return jsonify(message=f"Failed to retrieve dataset writers. {err}"), 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/search', methods=["GET"])
@project_from_id
def api_search_data(project):  # noqa: F401
    """Search for papers
    """
    q = request.args.get('q', default=None, type=str)
    max_results = request.args.get('n_max', default=10, type=int)

    project_mode = project.config["mode"]

    try:
        payload = {"result": []}
        if q:

            # read the dataset
            as_data = read_data(project)

            # read record_ids of labels from state
            with open_state(project.project_path) as s:
                labeled_record_ids = s.get_dataset(["record_id"
                                                    ])["record_id"].to_list()

            # search for the keywords
            result_idx = fuzzy_find(as_data,
                                    q,
                                    max_return=max_results,
                                    exclude=labeled_record_ids,
                                    by_index=True)

            for record in as_data.record(result_idx):

                debug_label = record.extra_fields.get("debug_label", None)
                debug_label = int(debug_label) if pd.notnull(
                    debug_label) else None

                if project_mode == PROJECT_MODE_SIMULATE:
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


@bp.route('/projects/<project_id>/labeled', methods=["GET"])
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
            data = s.get_dataset(
                ["record_id", "label", "query_strategy", "notes"])
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
            payload = {
                "count": 0,
                "next_page": None,
                "previous_page": None,
                "result": [],
            }
            response = jsonify(payload)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response

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
                return abort(404)

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

        records = read_data(project).record(data["record_id"])

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


@bp.route('/projects/<project_id>/labeled_stats', methods=["GET"])
@project_from_id
def api_get_labeled_stats(project):  # noqa: F401
    """Get all papers classified as prior documents
    """

    try:

        with open_state(project.project_path) as s:
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


@bp.route('/projects/<project_id>/prior_random', methods=["GET"])
@project_from_id
def api_random_prior_papers(project):  # noqa: F401
    """Get a selection of random records.

    This set of records is extracted from the pool, but without
    the already labeled items.
    """

    # get the number of records to return
    n = request.args.get("n", default=5, type=int)
    # get the subset of records to return (for exploration and simulation mode)
    subset = request.args.get("subset", default=None, type=str)

    with open_state(project.project_path) as state:
        pool = state.get_pool().values

    as_data = read_data(project)

    payload = {"result": []}

    if subset in ["relevant", "included"]:
        rel_indices = as_data.df[
            as_data.df["debug_label"] == 1].index.values
        rel_indices_pool = np.intersect1d(pool, rel_indices)

        if len(rel_indices_pool) == 0:
            return jsonify(payload)
        elif n > len(rel_indices_pool):
            rand_pool_relevant = np.random.choice(
                rel_indices_pool, len(rel_indices_pool), replace=False)
        else:
            rand_pool = np.random.choice(pool, n, replace=False)
            rand_pool_relevant = np.random.choice(
                rel_indices_pool, n, replace=False)

        try:
            relevant_records = as_data.record(rand_pool_relevant)
        except Exception as err:
            logging.error(err)
            return jsonify(
                message=f"Failed to load random records. {err}"), 500

        for rr in relevant_records:
            payload["result"].append(
                {
                    "id": int(rr.record_id),
                    "title": rr.title,
                    "abstract": rr.abstract,
                    "authors": rr.authors,
                    "keywords": rr.keywords,
                    "included": None,
                    "_debug_label": 1,
                }
            )

    elif subset in ["irrelevant", "excluded"]:
        irrel_indices = as_data.df[
            as_data.df["debug_label"] == 0].index.values
        irrel_indices_pool = np.intersect1d(pool, irrel_indices)

        if len(irrel_indices_pool) == 0:
            return jsonify(payload)
        elif n > len(irrel_indices_pool):
            rand_pool_irrelevant = np.random.choice(
                irrel_indices_pool, len(irrel_indices_pool), replace=False)
        else:
            rand_pool_irrelevant = np.random.choice(
                irrel_indices_pool, n, replace=False)

        try:
            irrelevant_records = as_data.record(rand_pool_irrelevant)
        except Exception as err:
            logging.error(err)
            return jsonify(
                message=f"Failed to load random records. {err}"), 500

        for ir in irrelevant_records:
            payload["result"].append(
                {
                    "id": int(ir.record_id),
                    "title": ir.title,
                    "abstract": ir.abstract,
                    "authors": ir.authors,
                    "keywords": ir.keywords,
                    "included": None,
                    "_debug_label": 0,
                }
            )

    else:
        if len(pool) == 0:
            return jsonify(payload)
        elif n > len(pool):
            rand_pool = np.random.choice(pool, len(pool), replace=False)
        else:
            rand_pool = np.random.choice(pool, n, replace=False)

        try:
            records = as_data.record(rand_pool)
        except Exception as err:
            logging.error(err)
            return jsonify(
                message=f"Failed to load random records. {err}"), 500

        for r in records:
            payload["result"].append(
                {
                    "id": int(r.record_id),
                    "title": r.title,
                    "abstract": r.abstract,
                    "authors": r.authors,
                    "keywords": r.keywords,
                    "included": None,
                    "_debug_label": None,
                }
            )

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


@bp.route('/projects/<project_id>/algorithms', methods=["GET"])
@project_from_id
def api_get_algorithms(project):  # noqa: F401

    default_payload = {
        "model": DEFAULT_MODEL,
        "feature_extraction": DEFAULT_FEATURE_EXTRACTION,
        "query_strategy": DEFAULT_QUERY_STRATEGY,
        "balance_strategy": DEFAULT_BALANCE_STRATEGY
    }

    # check if there were algorithms stored in the state file
    try:

        with open_state(project.project_path) as state:
            if state.settings is not None:
                payload = {
                    "model": state.settings.model,
                    "feature_extraction": state.settings.feature_extraction,
                    "query_strategy": state.settings.query_strategy,
                    "balance_strategy": state.settings.balance_strategy
                }
            else:
                payload = default_payload
    except (StateNotFoundError):
        payload = default_payload

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/algorithms', methods=["POST"])
@project_from_id
def api_set_algorithms(project):  # noqa: F401

    # TODO@{Jonathan} validate model choice on server side
    ml_model = request.form.get("model", None)
    ml_query_strategy = request.form.get("query_strategy", None)
    ml_balance_strategy = request.form.get("balance_strategy", None)
    ml_feature_extraction = request.form.get("feature_extraction", None)

    # create a new settings object from arguments
    # only used if state file is not present
    asreview_settings = ASReviewSettings(
        model=ml_model,
        query_strategy=ml_query_strategy,
        balance_strategy=ml_balance_strategy,
        feature_extraction=ml_feature_extraction,
        model_param=get_classifier(ml_model).param,
        query_param=get_query_model(ml_query_strategy).param,
        balance_param=get_balance_model(ml_balance_strategy).param,
        feature_param=get_feature_model(ml_feature_extraction).param
    )

    # save the new settings to the state file
    with open_state(project.project_path, read_only=False) as state:
        state.settings = asreview_settings

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/start', methods=["POST"])
@project_from_id
def api_start(project):  # noqa: F401
    """Start training of first model or simulation.
    """

    # the project is a simulation project
    if project.config["mode"] == PROJECT_MODE_SIMULATE:

        # get priors
        with open_state(project.project_path) as s:
            priors = s.get_priors()["record_id"].tolist()

        logging.info("Start simulation")

        try:
            datafile = project.config["dataset_path"]
            logging.info("Project data file found: {}".format(datafile))

            # start simulation
            py_exe = _get_executable()
            run_command = [
                # get executable
                py_exe,
                # get module
                "-m",
                "asreview",
                # run simulation via cli
                "simulate",
                # specify dataset
                "",
                # specify prior indices
                "--prior_idx"
            ] + list(map(str, priors)) + [
                # specify state file
                "--state_file",
                project.project_path,
                # specify write interval
                "--write_interval", "100"
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
                "-m",
                "asreview",
                # train the model via cli
                "web_run_model",
                # specify project id
                project.project_path,
                # output the error of the first model
                "--output_error",
                # mark the first run for status update
                "--first_run"
            ]
            subprocess.Popen(run_command)

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to train the model."), 500

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/status', methods=["GET"])
@project_from_id
def api_get_status(project):  # noqa: F401
    """Check the status of the review
    """

    try:
        status = project.reviews[0]['status']
    except Exception:
        status = None

    if status == "error":
        error_path = project.project_path / "error.json"
        if error_path.exists():
            logging.error("Error on training")
            with open(error_path, "r") as f:
                error_message = json.load(f)["message"]

            raise Exception(error_message)

    response = jsonify({'status': status})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/status', methods=["PUT"])
@project_from_id
def api_status_update(project):
    """Update the status of the review.

    The following status updates are allowed for
    oracle and explore:
    - `review` to `finished`
    - `finished` to `review` if not pool empty
    - `error` to `setup`

    The following status updates are allowed for simulate
    - `error` to `setup`

    Status updates by the user are not allowed in simulation
    mode.

    """

    status = request.form.get("status", type=str)

    current_status = project.config["reviews"][0]["status"]
    mode = project.config["mode"]

    if current_status == "error" and status == "setup":
        project.remove_error(status=status)

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    if mode == PROJECT_MODE_SIMULATE:
        raise ValueError(
            "Not possible to update status of simulation project.")
    else:
        if current_status == "review" and status == "finished":
            project.update_review(status=status)
        elif current_status == "finished" and status == "review":
            project.update_review(status=status)
            # ideally, also check here for empty pool
        else:
            raise ValueError(
                f"Not possible to update status from {current_status} to {status}")

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response


@bp.route('/projects/import_project', methods=["POST"])
def api_import_project():
    """Import uploaded project"""

    # raise error if file not given
    if 'file' not in request.files:
        response = jsonify(message="No ASReview file found to upload.")
        return response, 400

    try:
        project = ASReviewProject.load(
            request.files['file'],
            asreview_path(),
            safe_import=True
        )

    except Exception as err:
        logging.error(err)
        raise ValueError("Failed to import project.")

    return jsonify(project.config)


@bp.route('/projects/<project_id>/export_dataset', methods=["GET"])
@project_from_id
def api_export_dataset(project):
    """Export dataset with relevant/irrelevant labels"""

    # get the export args
    file_format = request.args.get("file_format", None)

    # create temporary folder to store exported dataset
    tmp_path = tempfile.TemporaryDirectory(dir=project.project_path)
    tmp_path_dataset = Path(tmp_path.name, f"export_dataset.{file_format}")

    try:
        # get labels and ranking from state file
        with open_state(project.project_path) as s:
            pool, labeled, pending = s.get_pool_labeled_pending()

        included = labeled[labeled['label'] == 1]
        excluded = labeled[labeled['label'] != 1]
        export_order = included['record_id'].to_list() + \
            pending.to_list() + \
            pool.to_list() + \
            excluded['record_id'].to_list()

        # get writer corresponding to specified file format
        writers = list_writers()
        writer = None
        for c in writers:
            if writer is None:
                if c.name == file_format:
                    writer = c

        # read the dataset into a ASReview data object
        as_data = read_data(project)

        as_data.to_file(
            fp=tmp_path_dataset,
            labels=labeled.values.tolist(),
            ranking=export_order,
            writer=writer)

        return send_file(
            tmp_path_dataset,
            as_attachment=True,
            download_name=f"asreview_dataset_{project.project_id}.{file_format}",
            max_age=0)

    except Exception as err:
        raise Exception(f"Failed to export the {file_format} dataset. {err}")


@bp.route('/projects/<project_id>/export_project', methods=["GET"])
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
    tmpfile = Path(tmpdir.name, project.project_id).with_suffix(".asreview")

    logging.info("Saving project (temporary) to", tmpfile)
    project.export(tmpfile)

    return send_file(tmpfile,
                     as_attachment=True,
                     download_name=f"{project.project_id}.asreview",
                     max_age=0)


def _get_stats(project, include_priors=False):

    try:

        if is_v0_project(project.project_path):
            json_fp = Path(project.project_path, 'result.json')

            # Check if the v0 project is in review.
            if json_fp.exists():

                with open(json_fp, 'r') as f:
                    s = json.load(f)

                # Get the labels.
                labels = np.array([
                    int(sample_data[1]) for query in range(len(s['results']))
                    for sample_data in s['results'][query]['labelled']
                ])

                # Get the record table.
                data_hash = list(s['data_properties'].keys())[0]
                record_table = s['data_properties'][data_hash]['record_table']

                n_records = len(record_table)

            # No result found.
            else:
                labels = np.array([])
                n_records = 0
        else:
            # Check if there is a review started in the project.
            try:
                # get label history
                with open_state(project.project_path) as s:

                    if project.config["reviews"][0]["status"] == "finished" \
                            and project.config["mode"] == PROJECT_MODE_SIMULATE:
                        labels = _get_labels(s, priors=include_priors)
                    else:
                        labels = s.get_labels(priors=include_priors)

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

    return {
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_since_last_inclusion": n_since_last_relevant,
        "n_papers": n_records,
        "n_pool": n_records - n_excluded - n_included
    }


def _get_labels(state_obj, priors=False):

    # get the number of records
    n_records = state_obj.n_records

    # get the labels
    labels = state_obj.get_labels(priors=priors).to_list()

    # if less labels than records, fill with 0
    if len(labels) < n_records:
        labels += [0] * (n_records - len(labels))
        labels = pd.Series(labels)

    return labels


@bp.route('/projects/<project_id>/progress', methods=["GET"])
@project_from_id
def api_get_progress_info(project):  # noqa: F401
    """Get progress statistics of a project"""

    include_priors = request.args.get('priors', True, type=bool)

    response = jsonify(_get_stats(project, include_priors=include_priors))
    response.headers.add('Access-Control-Allow-Origin', '*')

    # return a success response to the client.
    return response


@bp.route('/projects/<project_id>/progress_density', methods=["GET"])
@project_from_id
def api_get_progress_density(project):
    """Get progress density of a project"""

    include_priors = request.args.get('priors', False, type=bool)

    try:
        # get label history
        with open_state(project.project_path) as s:

            if project.config["reviews"][0]["status"] == "finished" \
                    and project.config["mode"] == PROJECT_MODE_SIMULATE:
                data = _get_labels(s, priors=include_priors)
            else:
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


@bp.route('/projects/<project_id>/progress_recall', methods=["GET"])
@project_from_id
def api_get_progress_recall(project):
    """Get cumulative number of inclusions by ASReview/at random"""

    include_priors = request.args.get('priors', False, type=bool)

    try:
        with open_state(project.project_path) as s:

            if project.config["reviews"][0]["status"] == "finished" \
                    and project.config["mode"] == PROJECT_MODE_SIMULATE:
                data = _get_labels(s, priors=include_priors)
            else:
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


@bp.route('/projects/<project_id>/record/<doc_id>', methods=["POST", "PUT"])
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
    record_id = int(request.form.get('doc_id'))
    label = int(request.form.get('label'))
    note = request.form.get('note', type=str)
    if not note:
        note = None

    is_prior = request.form.get('is_prior', default=False)

    retrain_model = False if is_prior == "1" else True
    prior = True if is_prior == "1" else False

    if request.method == 'POST':

        with open_state(project.project_path, read_only=False) as state:

            # add the labels as prior data
            state.add_labeling_data(record_ids=[record_id],
                                    labels=[label],
                                    notes=[note],
                                    prior=prior)

    elif request.method == 'PUT':

        with open_state(project.project_path, read_only=False) as state:

            if label in [0, 1]:
                state.update_decision(record_id, label, note=note)
            elif label == -1:
                state.delete_record_labeling_data(record_id)

    if retrain_model:

        # retrain model
        subprocess.Popen([
            _get_executable(), "-m", "asreview", "web_run_model",
            project.project_path
        ])

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/projects/<project_id>/get_document', methods=["GET"])
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

            as_data = read_data(project)
            record = as_data.record(int(new_instance))

            item = {}
            item['title'] = record.title
            item['authors'] = record.authors
            item['abstract'] = record.abstract
            item['doi'] = record.doi
            item['url'] = record.url

            # return the debug label
            debug_label = record.extra_fields.get("debug_label", None)
            item['_debug_label'] = \
                int(debug_label) if pd.notnull(debug_label) else None

            item["doc_id"] = new_instance
            pool_empty = False
        else:
            # end of pool
            project.update_review(status="finished")
            item = None
            pool_empty = True

    except Exception as err:
        logging.error(err)
        return jsonify(message=f"Failed to retrieve new records. {err}."), 500

    response = jsonify({"result": item, "pool_empty": pool_empty})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/projects/<project_id>/delete', methods=["DELETE"])
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
