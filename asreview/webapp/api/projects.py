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
import sys
import tempfile
import time
from dataclasses import asdict
from itertools import chain
from pathlib import Path
from urllib.request import urlretrieve
from uuid import uuid4

import datahugger
import numpy as np
import pandas as pd
from flask import Blueprint
from flask import abort
from flask import current_app
from flask import jsonify
from flask import request
from flask import send_file
from flask_login import current_user
from flask_login import login_required
from sklearn.preprocessing import MultiLabelBinarizer
from sqlalchemy import and_
from werkzeug.exceptions import InternalServerError
from werkzeug.utils import secure_filename

import asreview as asr
from asreview.config import LABEL_NA
from asreview.config import PROJECT_MODE_EXPLORE
from asreview.config import PROJECT_MODE_ORACLE
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.datasets import DatasetManager
from asreview.extensions import extensions
from asreview.project import ProjectError
from asreview.project import ProjectNotFoundError
from asreview.project import is_project
from asreview.search import fuzzy_find
from asreview.settings import ReviewSettings
from asreview.state.contextmanager import open_state
from asreview.state.exceptions import StateNotFoundError
from asreview.statistics import n_duplicates
from asreview.statistics import n_irrelevant
from asreview.statistics import n_relevant
from asreview.utils import _get_filename_from_url
from asreview.webapp import DB
from asreview.webapp.authentication.decorators import current_user_projects
from asreview.webapp.authentication.decorators import project_authorization
from asreview.webapp.authentication.models import Project
from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_project_path

bp = Blueprint("api", __name__, url_prefix="/api")


def _extract_tags(custom_metadata_str):
    if not isinstance(custom_metadata_str, str):
        return None

    obj = json.loads(custom_metadata_str)

    if "tags" in obj:
        return obj["tags"]
    else:
        return None


def _get_tag_composite_id(group_id, tag_id):
    return f"{group_id}:{tag_id}"


def _fill_last_ranking(project, ranking):
    """Fill the last ranking with a random or top-down ranking.

    Arguments
    ---------
    project: asreview.Project
        The project to fill the last ranking of.
    ranking: str
        The type of ranking to fill the last ranking with. Either "random" or
        "top-down".
    """

    if ranking not in ["random", "top-down"]:
        raise ValueError(f"Unknown ranking type: {ranking}")

    as_data = project.read_data()
    record_table = pd.Series(as_data.record_ids, name="record_id")

    with open_state(project.project_path) as state:
        if ranking == "random":
            records = record_table.sample(frac=1)
        elif ranking == "top-down":
            records = record_table

        state.add_last_ranking(records.values, ranking, ranking, ranking, ranking, -1)


# error handlers
@bp.errorhandler(ValueError)
def value_error(e):
    message = str(e) if str(e) else "Incorrect value."
    logging.error(message)
    return jsonify(message=message), 400


@bp.errorhandler(ProjectNotFoundError)
def project_not_found(e):
    message = str(e) if str(e) else "Project not found."
    logging.error(message)
    return jsonify(message=message), 404


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
@bp.route("/projects", methods=["GET"])
@login_required
@current_user_projects
def api_get_projects(projects):  # noqa: F401
    """"""

    mode = request.args.get("subset", None)

    project_info = []

    # for project, owner_id in zip(projects, owner_ids):
    for project in projects:
        try:
            project_config = project.config

            if mode is not None and project_config["mode"] != mode:
                continue

            if not current_app.config.get("LOGIN_DISABLED", False):
                project_config["owner_id"] = current_user.id

            logging.info("Project found: {}".format(project_config["id"]))
            project_info.append(project_config)

        except Exception as err:
            logging.error(err)

    # sort the projects based on created_at_unix
    project_info = sorted(
        project_info,
        key=lambda y: (y["created_at_unix"] is not None, y["created_at_unix"]),
        reverse=True,
    )

    response = jsonify({"result": project_info})

    return response


@bp.route("/projects/stats", methods=["GET"])
@login_required
@current_user_projects
def api_get_projects_stats(projects):  # noqa: F401
    """Get dashboard statistics of all projects"""

    stats_counter = {"n_in_review": 0, "n_finished": 0, "n_setup": 0}

    for project in projects:
        project_config = project.config

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

    return jsonify({"result": stats_counter})


@bp.route("/projects/create", methods=["POST"])
@login_required
def api_create_project():  # noqa: F401
    """Create a new project"""

    project_id = uuid4().hex

    project = asr.Project.create(
        get_project_path(project_id),
        project_id=project_id,
        project_mode=request.form["mode"],
        project_name=request.form["mode"] + "_" + time.strftime("%Y%m%d-%H%M%S"),
    )

    # get the project config to modify behavior of dataset
    project_config = project.config

    # remove old dataset if present
    if "dataset_path" in project_config and project_config["dataset_path"] is not None:
        logging.warning("Removing old dataset and adding new dataset.")
        project.remove_dataset()

    # create dataset folder if not present
    Path(project.project_path, "data").mkdir(exist_ok=True)

    if request.form.get("plugin", None):
        ds = DatasetManager().find(request.form["plugin"])
        filename = ds.filename
        ds.to_file(Path(project.project_path, "data", filename))

    elif request.form.get("benchmark", None):
        ds = DatasetManager().find(request.form["benchmark"])
        filename = ds.filename
        ds.to_file(Path(project.project_path, "data", filename))

    elif url := request.form.get("url", None):
        if request.form.get("filename", None):
            filename = request.form["filename"]
        else:
            filename = _get_filename_from_url(url)

        try:
            urlretrieve(url, Path(project.project_path, "data") / filename)
        except Exception:
            return jsonify(message=f"Can't retrieve data from URL {url}."), 400

    elif "file" in request.files:
        try:
            filename = secure_filename(request.files["file"].filename)
            fp_data = Path(project.project_path, "data") / filename

            request.files["file"].save(str(fp_data))

        except Exception as err:
            return jsonify(message=f"Failed to import file '{filename}'. {err}"), 400
    else:
        return jsonify(message="No file or dataset found to import."), 400

    data_path = Path(project.project_path, "data") / filename

    try:
        as_data = project.add_dataset(data_path.name)
        project.add_review()

        with open_state(project.project_path) as state:
            # if the data contains labels and oracle mode, add them to the state file
            if (
                project.config["mode"] == PROJECT_MODE_ORACLE
                and as_data.labels is not None
            ):
                labeled_indices = np.where(as_data.labels != LABEL_NA)[0]
                labels = as_data.labels[labeled_indices].tolist()
                labeled_record_ids = as_data.record_ids[labeled_indices].tolist()

                # add the labels as prior data
                state.add_labeling_data(
                    record_ids=labeled_record_ids,
                    labels=labels,
                    notes=[None for _ in labeled_record_ids],
                    prior=True,
                )

    except Exception as err:
        try:
            project.remove_dataset()
        except Exception:
            pass

        return jsonify(message=f"Failed to import file '{filename}'. {err}"), 400

    if current_app.config.get("LOGIN_DISABLED", False):
        return jsonify(project.config), 201

    # create a database entry for this project
    current_user.projects.append(Project(project_id=project_id))
    DB.session.commit()

    return jsonify(project.config), 201


@bp.route("/dataset_readers", methods=["GET"])
@login_required
def api_list_data_readers():
    """Get the list of available data readers and read formats."""
    payload = {"result": []}
    for e in extensions("readers"):
        payload["result"].append({"extension": e.name})
    return jsonify(payload)


@bp.route("/projects/<project_id>/upgrade_if_old", methods=["GET"])
@login_required
@project_authorization
def api_upgrade_project_if_old(project):
    """Get upgrade project if it is v0.x"""

    if project.config["version"].startswith("0"):
        response = jsonify(
            message="Not possible to upgrade Version 0 projects, see LINK."
        )
        return response, 400

    response = jsonify({"success": True})
    return response


@bp.route("/projects/<project_id>/info", methods=["GET"])
@login_required
@project_authorization
def api_get_project_info(project):  # noqa: F401
    """"""
    project_config = project.config

    if current_app.config.get("LOGIN_DISABLED", False):
        return jsonify(project_config)

    db_project = Project.query.filter(
        Project.project_id == project.config.get("id", 0)
    ).one_or_none()
    if db_project:
        project_config["ownerId"] = db_project.owner_id

    return jsonify(project_config)


@bp.route("/projects/<project_id>/info", methods=["PUT"])
@login_required
@project_authorization
def api_update_project_info(project):  # noqa: F401
    """Update project info"""

    update_dict = request.form.to_dict()

    if "tags" in update_dict:
        update_dict["tags"] = json.loads(update_dict["tags"])

    if "name" in update_dict:
        if len(update_dict["name"]) == 0:
            raise ValueError("Project title should be at least 1 character")

    project.update_config(**update_dict)

    return api_get_project_info(project.project_id)


@bp.route("/datasets", methods=["GET"])
@login_required
def api_demo_data_project():  # noqa: F401
    """"""

    subset = request.args.get("subset", None)

    manager = DatasetManager()

    if subset == "plugin":
        try:
            result_datasets = manager.list(
                exclude=["builtin", "synergy", "benchmark", "benchmark-nature"]
            )

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load plugin datasets."), 500

    elif subset == "benchmark":
        try:
            # collect the datasets metadata
            result_datasets = manager.list(include=["synergy", "benchmark-nature"])

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to load benchmark datasets."), 500

    else:
        return jsonify(message="demo-data-loading-failed"), 400

    return jsonify({"result": result_datasets})


@bp.route("/projects/<project_id>/data", methods=["GET"])
@login_required
@project_authorization
def api_get_project_data(project):  # noqa: F401
    """"""

    try:
        # get statistics of the dataset
        as_data = project.read_data()

        statistics = {
            "n_rows": len(as_data),
            "n_relevant": n_relevant(as_data),
            "n_irrelevant": n_irrelevant(as_data),
            "n_duplicates": n_duplicates(as_data),
            "n_missing_title": int(
                pd.Series(as_data.title).replace("", None).isnull().sum()
            ),
            "n_missing_abstract": int(
                pd.Series(as_data.abstract).replace("", None).isnull().sum()
            ),
            "n_english": None,
            "filename": Path(project.config["dataset_path"]).stem,
        }

    except FileNotFoundError as err:
        logging.info(err)
        statistics = {"filename": None}

    return jsonify(statistics)


@bp.route("/projects/<project_id>/dataset_writer", methods=["GET"])
@login_required
@project_authorization
def api_list_dataset_writers(project):
    """List the name and label of available dataset writer"""

    fp_data = Path(project.config["dataset_path"])

    readers = extensions("readers")
    writers = extensions("writers")

    # get write format for the data file
    write_format = None
    for c in readers:
        c_loaded = c.load()
        if fp_data.suffix in c_loaded.read_format:
            if write_format is None:
                write_format = c_loaded.write_format

    # get available writers
    payload = {"result": []}
    for c in writers:
        c_loaded = c.load()
        payload["result"].append(
            {
                "enabled": True if c_loaded.write_format in write_format else False,
                "name": c_loaded.name,
                "label": c_loaded.label,
                "caution": c_loaded.caution if hasattr(c_loaded, "caution") else None,
            }
        )

    if not payload["result"]:
        return (
            jsonify(message=f"No dataset writer available for {fp_data.suffix} file."),
            500,
        )

    # remove duplicate writers
    payload["result"] = [
        i
        for n, i in enumerate(payload["result"])
        if i not in payload["result"][(n + 1) :]
    ]

    return jsonify(payload)


@bp.route("/projects/<project_id>/search", methods=["GET"])
@login_required
@project_authorization
def api_search_data(project):  # noqa: F401
    """Search for papers"""
    q = request.args.get("q", default=None, type=str)
    max_results = request.args.get("n_max", default=10, type=int)

    if not q:
        return jsonify({"result": []})

    as_data = project.read_data()

    with open_state(project.project_path) as s:
        labeled_record_ids = s.get_results_table()["record_id"].to_list()

    result_ids = fuzzy_find(
        as_data,
        q,
        max_return=max_results,
        exclude=labeled_record_ids,
    )

    result = []
    for record in as_data.record(result_ids):
        record_d = asdict(record)
        record_d["included"] = -1
        record_d["label_from_dataset"] = record.included
        result.append(record_d)

    return jsonify({"result": result})


@bp.route("/projects/<project_id>/labeled", methods=["GET"])
@login_required
@project_authorization
def api_get_labeled(project):  # noqa: F401
    """Get all papers classified as labeled documents"""

    page = request.args.get("page", default=None, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    subset = request.args.getlist("subset")
    latest_first = request.args.get("latest_first", default=1, type=int)

    with open_state(project.project_path) as s:
        state_data = s.get_results_table(
            ["record_id", "label", "query_strategy", "notes", "custom_metadata_json"]
        )
        state_data["prior"] = (state_data["query_strategy"] == "prior").astype(int)

    if any(s in subset for s in ["relevant", "included"]):
        state_data = state_data[state_data["label"] == 1]
    elif any(s in subset for s in ["irrelevant", "excluded"]):
        state_data = state_data[state_data["label"] == 0]
    else:
        state_data = state_data[~state_data["label"].isnull()]

    if "note" in subset:
        state_data = state_data[~state_data["notes"].isnull()]

    if "prior" in subset:
        state_data = state_data[state_data["prior"] == 1]

    if latest_first == 1:
        state_data = state_data.iloc[::-1]

    # count labeled records and max pages
    count = len(state_data)
    if count == 0:
        payload = {
            "count": 0,
            "next_page": None,
            "previous_page": None,
            "result": [],
        }
        response = jsonify(payload)

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
            state_data = state_data.iloc[idx_start:idx_end, :].copy()
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

    records = project.read_data().record(state_data["record_id"])

    result = []
    for i, record in zip(state_data.index.tolist(), records):
        # add variables from record
        record_d = asdict(record)
        record_d["label_from_dataset"] = record.included

        # add variables from state
        record_d["included"] = int(state_data.loc[i, "label"])
        record_d["note"] = state_data.loc[i, "notes"]
        record_d["tags"] = _extract_tags(state_data.loc[i, "custom_metadata_json"])
        record_d["prior"] = int(state_data.loc[i, "prior"])

        result.append(record_d)

    return jsonify(
        {
            "count": count,
            "next_page": next_page,
            "previous_page": previous_page,
            "result": result,
        }
    )


@bp.route("/projects/<project_id>/labeled_stats", methods=["GET"])
@login_required
@project_authorization
def api_get_labeled_stats(project):  # noqa: F401
    """Get all papers classified as prior documents"""

    try:
        with open_state(project.project_path) as s:
            data = s.get_results_table(["label", "query_strategy"])
            data_prior = data[data["query_strategy"] == "prior"]

        return jsonify(
            {
                "n": len(data),
                "n_inclusions": sum(data["label"] == 1),
                "n_exclusions": sum(data["label"] == 0),
                "n_prior": len(data_prior),
                "n_prior_inclusions": sum(data_prior["label"] == 1),
                "n_prior_exclusions": sum(data_prior["label"] == 0),
            }
        )
    except StateNotFoundError:
        return jsonify(
            {
                "n": 0,
                "n_inclusions": 0,
                "n_exclusions": 0,
                "n_prior": 0,
                "n_prior_inclusions": 0,
                "n_prior_exclusions": 0,
            }
        )


@bp.route("/projects/<project_id>/prior_random", methods=["GET"])
@login_required
@project_authorization
def api_random_prior_papers(project):  # noqa: F401
    """Get a selection of random records.

    This set of records is extracted from the pool, but without
    the already labeled items.
    """

    n = request.args.get("n", default=5, type=int)
    subset = request.args.get("subset", default=None, type=str)

    if subset == "relevant":
        label = 1
    elif subset == "irrelevant":
        label = 0
    elif subset == "not_seen":
        label = LABEL_NA
    else:
        label = None

    as_data = project.read_data()

    if subset in ["relevant", "irrelevant"] and as_data.labels is None:
        indices = []
    elif subset in ["relevant", "irrelevant", "not_seen"]:
        indices = as_data.df[as_data.labels == label].index.values
    else:
        indices = as_data.df.index.values

    with open_state(project.project_path) as state:
        labeled = state.get_results_table()["record_id"].values

    pool = np.setdiff1d(indices, labeled, assume_unique=True)
    rand_pool = np.random.choice(pool, min(len(pool), n), replace=False)

    payload = {"result": []}
    for record in as_data.record(rand_pool):
        record_d = asdict(record)
        record_d["included"] = None
        record_d["label_from_dataset"] = record.included
        payload["result"].append(record_d)

    return jsonify(payload)


@bp.route("/algorithms", methods=["GET"])
@login_required
def api_list_algorithms():
    """List the names and labels of available algorithms"""

    classes = [
        extensions("models.balance"),
        extensions("models.classifiers"),
        extensions("models.feature_extraction"),
        extensions("models.query"),
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
                payload[key].append({"name": method.name, "label": method.label})
            else:
                payload[key].append({"name": method.name, "label": method.name})

    return jsonify(payload)


@bp.route("/projects/<project_id>/algorithms", methods=["GET"])
@login_required
@project_authorization
def api_get_algorithms(project):  # noqa: F401
    """Get the algorithms used in the project"""

    settings = ReviewSettings()

    try:
        settings = settings.from_file(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            )
        )
    except FileNotFoundError:
        pass

    return jsonify(asdict(settings))


@bp.route("/projects/<project_id>/algorithms", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_set_algorithms(project):  # noqa: F401
    """Set the algorithms used in the project"""

    asreview_settings = ReviewSettings(
        classifier=request.form.get("classifier"),
        query_strategy=request.form.get("query_strategy"),
        balance_strategy=request.form.get("balance_strategy"),
        feature_extraction=request.form.get("feature_extraction"),
    )

    with open(
        Path(
            project.project_path,
            "reviews",
            project.reviews[0]["id"],
            "settings_metadata.json",
        ),
        "w",
    ) as f:
        json.dump(asdict(asreview_settings), f)

    return jsonify({"success": True})


@bp.route("/projects/<project_id>/train", methods=["POST"])
@login_required
@project_authorization
def api_train(project):  # noqa: F401
    """Start training of first model or simulation."""

    if ranking := request.form.get("ranking", type=str, default=None):
        _fill_last_ranking(project, ranking)
        return jsonify({"success": True})

    try:
        run_command = [
            sys.executable if sys.executable else "python",
            "-m",
            "asreview",
            "web_run_model",
            str(project.project_path),
        ]
        subprocess.Popen(run_command)

    except Exception as err:
        logging.error(err)
        message = f"Failed to train the model. {err}"
        return jsonify(message=message), 400

    return jsonify({"success": True})


@bp.route("/projects/<project_id>/status", methods=["GET"])
@login_required
@project_authorization
def api_get_status(project):  # noqa: F401
    """Check the status of the review"""

    try:
        status = project.reviews[0]["status"]
    except Exception:
        status = None

    if status == "error":
        error_path = project.project_path / "error.json"
        if error_path.exists():
            logging.error("Error on training")
            with open(error_path) as f:
                error_message = json.load(f)["message"]

            raise Exception(error_message)

    response = jsonify({"status": status})

    return response


@bp.route("/projects/<project_id>/reviews", methods=["GET"])
@login_required
@project_authorization
def api_get_reviews(project):  # noqa: F401
    """Check the status of the review"""

    return jsonify({"data": project.config["reviews"]})


@bp.route("/projects/<project_id>/reviews/<int:review_id>", methods=["GET"])
@login_required
@project_authorization
def api_get_review(project, review_id):  # noqa: F401
    """Check the status of the review"""

    data = project.config["reviews"][review_id]
    data["mode"] = project.config["mode"]

    return jsonify({"data": data})


@bp.route("/projects/<project_id>/reviews/<int:review_id>", methods=["PUT"])
@login_required
@project_authorization
def api_update_review_status(project, review_id):
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
    trigger_model = request.form.get("trigger_model", type=bool, default=False)

    current_status = project.config["reviews"][review_id]["status"]

    if current_status == "error" and status == "setup":
        project.remove_error(status=status)
        return jsonify({"success": True})

    if current_status == "setup" and status == "review":
        is_simulation = project.config["mode"] == PROJECT_MODE_SIMULATE

        with open_state(project) as s:
            labels = s.get_results_table()["label"].to_list()

        if not (pk := 0 in labels and 1 in labels) and not is_simulation:
            _fill_last_ranking(project, "random")

        if trigger_model and (pk or is_simulation):
            try:
                subprocess.Popen(
                    [
                        sys.executable if sys.executable else "python",
                        "-m",
                        "asreview",
                        "web_run_model",
                        str(project.project_path),
                    ]
                )

            except Exception as err:
                return jsonify(message=f"Failed to train the model. {err}"), 400

        project.update_review(status=status)

    elif current_status == "review" and status == "finished":
        project.update_review(status=status)
    elif current_status == "finished" and status == "review":
        project.update_review(status=status)
        # ideally, also check here for empty pool
    else:
        raise ValueError(
            f"Not possible to update status from {current_status} to {status}"
        )

    return jsonify({"success": True})


@bp.route("/projects/import_project", methods=["POST"])
@login_required
def api_import_project():
    """Import project"""

    # raise error if file not given
    if "file" not in request.files:
        response = jsonify(message="No ASReview file found to import.")
        return response, 400

    try:
        project = asr.Project.load(
            request.files["file"], asreview_path(), safe_import=True
        )

    except Exception as err:
        logging.error(err)
        raise ValueError("Failed to import project.")

    if current_app.config.get("LOGIN_DISABLED", False):
        return jsonify(project.config)

    # create a database entry for this project
    current_user.projects.append(Project(project_id=project.config.get("id")))
    project.config["owner_id"] = current_user.id
    DB.session.commit()

    return jsonify(project.config)


def _add_tags_to_export_data(project, export_data, state_df):
    tags_df = state_df[["custom_metadata_json"]].copy()

    tags_df["tags"] = (
        tags_df["custom_metadata_json"]
        .apply(lambda d: _extract_tags(d))
        .apply(lambda d: d if isinstance(d, list) else [])
    )

    unused_tags = []
    tags_config = project.config.get("tags")

    if tags_config is not None:
        all_tags = [
            [_get_tag_composite_id(group["id"], tag["id"]) for tag in group["values"]]
            for group in tags_config
        ]
        all_tags = list(chain.from_iterable(all_tags))
        used_tags = set(tags_df["tags"].explode().unique())
        unused_tags = [tag for tag in all_tags if tag not in used_tags]

    mlb = MultiLabelBinarizer()

    tags_df = pd.DataFrame(
        data=mlb.fit_transform(tags_df["tags"]),
        columns=mlb.classes_,
        index=tags_df.index,
    )

    tags_df = tags_df.assign(**{unused_tag: 0 for unused_tag in unused_tags})

    export_data.df = export_data.df.join(tags_df, on="record_id")


@bp.route("/projects/<project_id>/export_dataset", methods=["GET"])
@login_required
@project_authorization
def api_export_dataset(project):
    """Export dataset with relevant/irrelevant labels"""

    # get the export args
    file_format = request.args.get("file_format", None)
    dataset_label = request.args.get("dataset_label", default="all")

    # create temporary folder to store exported dataset
    tmp_path = tempfile.TemporaryDirectory()
    tmp_path_dataset = Path(tmp_path.name, f"export_dataset.{file_format}")

    try:
        # get labels and ranking from state file
        with open_state(project.project_path) as s:
            # todo: execute in single transaction (most likely it already does)
            pool = s.get_pool()
            labeled = s.get_results_table()[["record_id", "label"]]

            state_df = s.get_results_table().set_index("record_id")

        included = labeled[labeled["label"] == 1]
        excluded = labeled[labeled["label"] != 1]

        if dataset_label == "relevant":
            export_order = included["record_id"].to_list()
            labeled = included
        else:
            export_order = (
                included["record_id"].to_list()
                + pool.to_list()
                + excluded["record_id"].to_list()
            )

        # get writer corresponding to specified file format
        writers = extensions("writers")
        writer = None
        for c in writers:
            if writer is None:
                if c.name == file_format:
                    writer = c

        # read the dataset into a ASReview data object
        as_data = project.read_data()

        # Add a new column 'is_prior' to the dataset
        if "asreview_prior" in as_data.df:
            as_data.df.drop("asreview_prior", axis=1, inplace=True)

        state_df["asreview_prior"] = state_df.query_strategy.eq("prior").astype("Int64")
        as_data.df = as_data.df.join(state_df["asreview_prior"], on="record_id")

        # Adding Notes from State file to the exported dataset
        # Check if exported_notes column already exists due to multiple screenings
        screening = 0
        for col in as_data.df:
            if col == "exported_notes":
                screening = 0
            elif col.startswith("exported_notes"):
                try:
                    screening = int(col.split("_")[2])
                except IndexError:
                    screening = 0
        screening += 1

        state_df.rename(
            columns={
                "notes": f"exported_notes_{screening}",
            },
            inplace=True,
        )

        as_data.df = as_data.df.join(
            state_df[f"exported_notes_{screening}"], on="record_id"
        )

        _add_tags_to_export_data(project, as_data, state_df)

        # keep labels in exploration mode
        keep_old_labels = project.config["mode"] == PROJECT_MODE_EXPLORE

        as_data.to_file(
            fp=tmp_path_dataset,
            labels=labeled.values.tolist(),
            ranking=export_order,
            writer=writer,
            keep_old_labels=keep_old_labels,
        )

        return send_file(
            tmp_path_dataset,
            as_attachment=True,
            max_age=0,
        )

    except Exception as err:
        raise Exception(f"Failed to export the {file_format} dataset. {err}")


@bp.route("/projects/<project_id>/export_project", methods=["GET"])
@login_required
@project_authorization
def export_project(project):
    """Export the project file.

    The ASReview project file is a file with .asreview extension.
    The ASReview project file is a zipped file and contains
    all information to continue working on the project as well
    as the original dataset.
    """

    # create a temp folder to zip
    tmpdir = tempfile.TemporaryDirectory()
    tmpfile = Path(tmpdir.name, project.project_id).with_suffix(".asreview")

    logging.info("Saving project (temporary) to %s", tmpfile)
    project.export(tmpfile)

    return send_file(
        tmpfile,
        as_attachment=True,
        max_age=0,
    )


def _get_stats(project, include_priors=False):
    # Check if there is a review started in the project.
    try:
        is_project(project)

        as_data = project.read_data()

        # get label history
        with open_state(project.project_path) as s:
            labels = s.get_labels(priors=include_priors)

        n_records = len(as_data)

    # No state file found or not init.
    except (StateNotFoundError, ValueError, ProjectError):
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
        "n_pool": n_records - n_excluded - n_included,
    }


@bp.route("/projects/<project_id>/progress", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_info(project):  # noqa: F401
    """Get progress statistics of a project"""

    include_priors = request.args.get("priors", True, type=bool)

    response = jsonify(_get_stats(project, include_priors=include_priors))

    # return a success response to the client.
    return response


@bp.route("/projects/<project_id>/progress_density", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_density(project):
    """Get progress density of a project"""

    include_priors = request.args.get("priors", False, type=bool)

    # get label history
    with open_state(project.project_path) as s:
        data = s.get_labels(priors=include_priors)

    # create a dataset with the rolling mean of every 10 papers
    df = (
        data.to_frame(name="Relevant")
        .reset_index(drop=True)
        .rolling(10, min_periods=1)
        .mean()
    )
    df["Total"] = df.index + 1

    # transform mean(percentage) to number
    for i in range(0, len(df)):
        if df.loc[i, "Total"] < 10:
            df.loc[i, "Irrelevant"] = (1 - df.loc[i, "Relevant"]) * df.loc[i, "Total"]
            df.loc[i, "Relevant"] = df.loc[i, "Total"] - df.loc[i, "Irrelevant"]
        else:
            df.loc[i, "Irrelevant"] = (1 - df.loc[i, "Relevant"]) * 10
            df.loc[i, "Relevant"] = 10 - df.loc[i, "Irrelevant"]

    df = df.round(1).to_dict(orient="records")
    for d in df:
        d["x"] = d.pop("Total")

    df_relevant = [{k: v for k, v in d.items() if k != "Irrelevant"} for d in df]
    for d in df_relevant:
        d["y"] = d.pop("Relevant")

    df_irrelevant = [{k: v for k, v in d.items() if k != "Relevant"} for d in df]
    for d in df_irrelevant:
        d["y"] = d.pop("Irrelevant")

    payload = {"relevant": df_relevant, "irrelevant": df_irrelevant}

    return jsonify(payload)


@bp.route("/projects/<project_id>/progress_recall", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_recall(project):
    """Get cumulative number of inclusions by ASReview/at random"""

    include_priors = request.args.get("priors", False, type=bool)

    as_data = project.read_data()

    with open_state(project.project_path) as s:
        data = s.get_labels(priors=include_priors)

    # create a dataset with the cumulative number of inclusions
    df = data.to_frame(name="Relevant").reset_index(drop=True).cumsum()
    df["Total"] = df.index + 1
    df["Random"] = (df["Total"] * (df["Relevant"][-1:] / len(as_data)).values).round()

    df = df.round(1).to_dict(orient="records")
    for d in df:
        d["x"] = d.pop("Total")

    df_asreview = [{k: v for k, v in d.items() if k != "Random"} for d in df]
    for d in df_asreview:
        d["y"] = d.pop("Relevant")

    df_random = [{k: v for k, v in d.items() if k != "Relevant"} for d in df]
    for d in df_random:
        d["y"] = d.pop("Random")

    payload = {"asreview": df_asreview, "random": df_random}

    return jsonify(payload)


@bp.route("/projects/<project_id>/record/<record_id>", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_classify_instance(project, record_id):  # noqa: F401
    """Label item

    This request handles the document identifier and the corresponding label.
    The result is stored in a temp location. If this storage exceeds a certain
    amount of values, then the model is triggered. The values of the location
    are passed to the model and the storaged is cleared. This model will run
    in the background.
    """
    # return the combination of document_id and label.
    record_id = int(request.form.get("record_id"))

    label = int(request.form.get("label"))

    note = request.form.get("note", type=str)
    if not note:
        note = None

    tags = request.form.get("tags", type=str)
    if not tags:
        tags = []
    else:
        tags = json.loads(tags)

    is_prior = request.form.get("is_prior", default=False)

    retrain_model = False if is_prior == "1" else True
    prior = True if is_prior == "1" else False

    user_id = (
        None if current_app.config.get("LOGIN_DISABLED", False) else current_user.id
    )

    if request.method == "POST":
        with open_state(project.project_path) as state:
            # add the labels as prior data
            state.add_labeling_data(
                record_ids=[record_id],
                labels=[label],
                notes=[note],
                tags_list=[tags],
                prior=prior,
                user_id=user_id,
            )

    elif request.method == "PUT":
        with open_state(project.project_path) as state:
            if label in [0, 1]:
                state.update_decision(record_id, label, note=note, tags=tags)
            elif label == -1:
                state.delete_record_labeling_data(record_id)

    if retrain_model:
        # retrain model
        subprocess.Popen(
            [
                sys.executable if sys.executable else "python",
                "-m",
                "asreview",
                "web_run_model",
                str(project.project_path),
            ]
        )

    response = jsonify({"success": True})

    return response


@bp.route("/projects/<project_id>/get_document", methods=["GET"])
@login_required
@project_authorization
def api_get_document(project):  # noqa: F401
    """Retrieve record in order of review."""

    user_id = (
        None if current_app.config.get("LOGIN_DISABLED", False) else current_user.id
    )

    with open_state(project.project_path) as state:
        pending = state.get_pending(user_id=user_id)

        if pending.empty:
            try:
                rank_n_1 = state.get_pool()[:1].to_list()

                # there is a ranking, but pool is empty
                if rank_n_1 == []:
                    project.update_review(status="finished")
                    return jsonify(
                        {"result": None, "pool_empty": True, "has_ranking": False}
                    )

            except ValueError:
                # there is no ranking and get_pool raises an error
                return jsonify(
                    {"result": None, "pool_empty": False, "has_ranking": False}
                )

            state.query_top_ranked(user_id=user_id)
            pending = state.get_pending(user_id=user_id)

    as_data = project.read_data()
    item = asdict(as_data.record(pending["record_id"].iloc[0]))
    item["label_from_dataset"] = item["included"]
    item["state"] = pending.iloc[0].to_dict()

    return jsonify({"result": item, "pool_empty": False, "has_ranking": True})


@bp.route("/projects/<project_id>/delete", methods=["DELETE"])
@login_required
@project_authorization
def api_delete_project(project):  # noqa: F401
    """"""

    if project.project_path.exists() and project.project_path.is_dir():
        try:
            # remove from database if applicable
            if not current_app.config.get("LOGIN_DISABLED", False):
                project = Project.query.filter(
                    and_(
                        Project.project_id == project.project_id,
                        Project.owner_id == current_user.id,
                    )
                ).one_or_none()

                if project is not None:
                    DB.session.delete(project)
                    DB.session.commit()
                else:
                    return jsonify(message="Failed to delete project in DB."), 500

            # and remove the folder
            shutil.rmtree(project.project_path)

        except Exception as err:
            logging.error(err)
            return jsonify(message="Failed to delete project."), 500

        response = jsonify({"success": True})

        return response


@bp.route("/resolve_uri", methods=["GET"])
@login_required
def api_resolve_uri():  # noqa: F401
    """Resolve the uri of the dataset upload"""

    uri = request.args.get("uri")

    if uri and uri.startswith("10."):
        uri = f"https://doi.org/{uri}"

    filename = _get_filename_from_url(uri)

    reader_keys = [e.name for e in extensions("readers")]

    if filename and Path(filename).suffix and Path(filename).suffix in reader_keys:
        return jsonify(files=[{"link": uri, "name": filename}]), 201
    elif filename and not Path(filename).suffix:
        raise ValueError("Can't determine file format.")
    else:
        try:
            dh = datahugger.info(uri)
            files = dh.files.copy()

            for i, _f in enumerate(files):
                files[i]["disabled"] = Path(files[i]["name"]).suffix not in reader_keys

            return jsonify(files=files), 201
        except Exception:
            raise ValueError("Can't retrieve files.")
