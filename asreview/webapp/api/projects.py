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
import socket
import tempfile
import time
import math
from dataclasses import asdict
from dataclasses import replace
from pathlib import Path
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
from sqlalchemy import and_
from werkzeug.exceptions import InternalServerError
from werkzeug.utils import secure_filename

from sklearn.feature_extraction.text import TfidfVectorizer


import asreview as asr
from asreview.project.api import PROJECT_MODE_SIMULATE
from asreview.datasets import DatasetManager
from asreview.extensions import extensions
from asreview.extensions import load_extension
from asreview.models import default_model
from asreview.project.exceptions import ProjectError
from asreview.project.exceptions import ProjectNotFoundError
from asreview.project.api import is_project
from asreview.search import fuzzy_find
from asreview.settings import ReviewSettings
from asreview.state.contextmanager import open_state
from asreview.utils import _check_model
from asreview.utils import _get_filename_from_url
from asreview.webapp import DB
from asreview.webapp.authentication.decorators import current_user_projects
from asreview.webapp.authentication.decorators import project_authorization
from asreview.webapp.authentication.models import Project
from asreview.webapp.task_manager.task_manager import DEFAULT_TASK_MANAGER_HOST
from asreview.webapp.task_manager.task_manager import DEFAULT_TASK_MANAGER_PORT
from asreview.webapp.tasks import run_model
from asreview.webapp.tasks import run_simulation
from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_project_path

bp = Blueprint("api", __name__, url_prefix="/api")


def _fill_last_ranking(project, ranking):
    """Fill the last ranking with a random or top-down ranking.

    Parameters
    ----------
    project: asreview.Project
        The project to fill the last ranking of.
    ranking: str
        The type of ranking to fill the last ranking with. Either "random" or
        "top-down".
    """

    if ranking not in ["random", "top-down"]:
        raise ValueError(f"Unknown ranking type: {ranking}")

    record_ids = project.data_store["record_id"]
    if ranking == "random":
        ranked_record_ids = record_ids.sample(frac=1)
    elif ranking == "top-down":
        ranked_record_ids = record_ids
    with open_state(project.project_path) as state:
        state.add_last_ranking(ranked_record_ids.values, None, ranking, None, None)


def _run_model(project):
    # if there is a socket, it means we would like to delegate
    # training / simulation to the queue manager,
    # otherwise run training / simulation directly
    simulation = project.config["mode"] == PROJECT_MODE_SIMULATE

    if not current_app.testing:
        try:
            client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            client_socket.connect(
                (
                    current_app.config.get(
                        "TASK_MANAGER_HOST", DEFAULT_TASK_MANAGER_HOST
                    ),
                    current_app.config.get(
                        "TASK_MANAGER_PORT", DEFAULT_TASK_MANAGER_PORT
                    ),
                )
            )
            payload = {
                "action": "insert",
                "project_id": project.config["id"],
                "simulation": simulation,
            }
            # send
            client_socket.sendall(json.dumps(payload).encode("utf-8"))
        except socket.error:
            raise RuntimeError("Queue manager is not alive.")
        finally:
            client_socket.close()

    else:
        if simulation:
            run_simulation(project)
        else:
            run_model(project)


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
    for project, db_project in projects:
        try:
            project_config = project.config

            if mode is not None and project_config["mode"] != mode:
                continue

            if not current_app.config.get("LOGIN_DISABLED", False):
                project_config["roles"] = {
                    "owner": db_project.owner_id == current_user.id
                }
            else:
                project_config["roles"] = {"owner": True}

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

    return jsonify({"result": project_info})


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
    project.data_dir.mkdir(exist_ok=True)

    try:
        if request.form.get("plugin", None):
            project.add_dataset(request.form["plugin"])
        elif request.form.get("benchmark", None):
            project.add_dataset(request.form["benchmark"])
        elif request.form.get("url", None):
            project.add_dataset(request.form["url"])
        elif "file" in request.files:
            project.add_dataset(
                secure_filename(request.files["file"].filename),
                file_writer=request.files["file"].save,
            )
        else:
            return jsonify(message="No file or dataset found to import."), 400

        project.add_review()

        n_labeled = project.data_store["included"].notnull().sum()

        if n_labeled > 0 and n_labeled < len(project.data_store):
            with open_state(project.project_path) as state:
                labeled_indices = np.where(
                    (project.data_store["included"] == 1)
                    | (project.data_store["included"] == 0)
                )[0]

                labels = project.data_store["included"][labeled_indices].tolist()
                labeled_record_ids = project.data_store["record_ids"][
                    labeled_indices
                ].tolist()

                state.add_labeling_data(
                    record_ids=labeled_record_ids,
                    labels=labels,
                    user_id=None,
                )

    except Exception as err:
        try:
            project.remove_dataset()
        except Exception:
            pass

        return jsonify(message=f"Failed to import file. {err}"), 400

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
        return jsonify(
            message="Not possible to upgrade Version 0 projects, see LINK."
        ), 400

    return jsonify({"success": True})


@bp.route("/projects/<project_id>/info", methods=["GET"])
@login_required
@project_authorization
def api_get_project_info(project):  # noqa: F401
    """"""
    project_config = project.config

    if current_app.config.get("LOGIN_DISABLED", False):
        project_config["roles"] = {"owner": True}
        return jsonify(project_config)

    db_project = Project.query.filter(
        Project.project_id == project.config.get("id", 0)
    ).one_or_none()

    if db_project:
        project_config["roles"] = {"owner": db_project.owner_id == current_user.id}

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

    data = project.data_store[["included", "title", "abstract", "doi", "url"]]
    data = data.replace("", None)
    data.url = data.url.fillna(data.doi)

    return jsonify(
        {
            "n_rows": len(data),
            "n_unlabeled": len(data)
            - len(np.where(data.included == 1)[0])
            - len(np.where(data.included == 0)[0]),
            "n_relevant": len(np.where(data.included == 1)[0]),
            "n_irrelevant": len(np.where(data.included == 0)[0]),
            "n_duplicates": int(data.doi.duplicated().sum()),
            "n_missing_title": int(data.title.isnull().sum()),
            "n_missing_abstract": int(data.abstract.isnull().sum()),
            "n_missing_urn": int(data.url.isnull().sum()),
            "n_english": None,
            "filename": Path(project.config["dataset_path"]).stem,
        }
    )


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
    """Search for records"""
    q = request.args.get("q", default=None, type=str)
    max_results = request.args.get("n_max", default=10, type=int)

    if not q:
        return jsonify({"result": []})

    search_data = project.data_store[["title", "authors", "keywords"]]

    with open_state(project.project_path) as s:
        labeled_record_ids = s.get_results_table()["record_id"].to_list()

    result_ids = fuzzy_find(
        search_data,
        q,
        max_return=max_results,
        exclude=labeled_record_ids,
    )

    result = []
    for result_id in result_ids:
        record = project.data_store.get_records(result_id)
        record_d = asdict(record)
        record_d["state"] = None
        record_d["tags_form"] = project.config.get("tags", None)
        result.append(record_d)

    return jsonify({"result": result})


@bp.route("/projects/<project_id>/labeled", methods=["GET"])
@login_required
@project_authorization
def api_get_labeled(project):  # noqa: F401
    """Get all records classified as labeled documents"""

    page = request.args.get("page", default=None, type=int)
    per_page = request.args.get("per_page", default=20, type=int)
    subset = request.args.get("subset", default="all", type=str)
    filters = request.args.getlist("filter", type=str)
    latest_first = request.args.get("latest_first", default=1, type=int)

    with open_state(project.project_path) as s:
        if "is_prior" in filters:
            state_data = s.get_priors()
        else:
            state_data = s.get_results_table()

    if subset == "relevant":
        state_data = state_data[state_data["label"] == 1]
    elif subset == "irrelevant":
        state_data = state_data[state_data["label"] == 0]
    else:
        state_data = state_data[~state_data["label"].isnull()]

    if "has_note" in filters:
        state_data = state_data[~state_data["note"].isnull()]

    if latest_first == 1:
        state_data = state_data.iloc[::-1]

    # count labeled records and max pages
    if len(state_data) == 0:
        payload = {
            "count": 0,
            "next_page": None,
            "previous_page": None,
            "result": [],
        }
        return jsonify(payload)

    max_page = math.ceil(len(state_data) / per_page)

    if page is not None:
        if page > max_page:
            return abort(404)

        idx_start = (page - 1) * per_page
        idx_end = page * per_page
        state_data = state_data.iloc[idx_start:idx_end].copy()

        next_page = page + 1 if page < max_page else None
        previous_page = page - 1 if page > 1 else None
    else:
        next_page = None
        previous_page = None

    if not current_app.config.get("LOGIN_DISABLED", False):
        project_entry = Project.query.filter(
            Project.project_id == project.project_id
        ).one_or_none()
        users = {
            **{
                u.id: {**u.summarize(), "owner": False}
                for u in project_entry.collaborators
            },
            project_entry.owner.id: {**project_entry.owner.summarize(), "owner": True},
        }
        users = {
            i: {**u, "current_user": current_user.id == u["id"]}
            for i, u in users.items()
        }

    records = project.data_store.get_records(state_data["record_id"].to_list())
    result = []
    for (_, state), record in zip(state_data.iterrows(), records):
        record_d = asdict(record)
        record_d["state"] = state.to_dict()
        record_d["tags_form"] = project.config.get("tags", None)

        if not current_app.config.get("LOGIN_DISABLED", False):
            record_d["state"]["user"] = users.get(record_d["state"]["user_id"], None)
        else:
            record_d["state"]["user"] = None

        del record_d["state"]["user_id"]
        result.append(record_d)

    return jsonify(
        {
            "count": len(state_data),
            "next_page": next_page,
            "previous_page": previous_page,
            "result": result,
        }
    )


@bp.route("/projects/<project_id>/labeled_stats", methods=["GET"])
@login_required
@project_authorization
def api_get_labeled_stats(project):  # noqa: F401
    """Get all records classified as prior documents"""

    # Retrieve the include_priors parameter from the request's query.
    include_priors = request.args.get("priors", True, type=bool)

    try:
        with open_state(project.project_path) as s:
            data = s.get_results_table(["label", "query_strategy"])
            data_prior = data[data["query_strategy"].isnull()]

            # If the 'include_priors' flag is set to False, filter out records that have a query strategy marked as prior.
            if not include_priors:
                data = data[data["query_strategy"] != "prior"]

        return jsonify(
            {
                "n": len(data),
                "n_inclusions": int(sum(data["label"] == 1)),
                "n_exclusions": int(sum(data["label"] == 0)),
                "n_prior": len(data_prior),
                "n_prior_inclusions": int(sum(data_prior["label"] == 1)),
                "n_prior_exclusions": int(sum(data_prior["label"] == 0)),
            }
        )
    except FileNotFoundError:
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


@bp.route("/algorithms", methods=["GET"])
@login_required
def api_list_algorithms():
    """List the names and labels of available algorithms"""

    entry_points_per_submodel = [
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

    for entry_points, key in zip(entry_points_per_submodel, payload.keys()):
        for e in entry_points:
            model_class = e.load()

            if hasattr(model_class, "label"):
                payload[key].append(
                    {"name": model_class.name, "label": model_class.label}
                )
            else:
                payload[key].append(
                    {"name": model_class.name, "label": model_class.name}
                )

    return jsonify(payload)


@bp.route("/projects/<project_id>/algorithms", methods=["GET"])
@login_required
@project_authorization
def api_get_algorithms(project):  # noqa: F401
    """Get the algorithms used in the project"""

    settings = ReviewSettings(**default_model())

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

    settings = ReviewSettings(
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
        json.dump(asdict(settings), f)

    return jsonify(asdict(settings))


# @bp.route("/projects/<project_id>/stopping", methods=["GET"])
# @login_required
# @project_authorization
# def api_get_stopping(project):  # noqa: F401
#     """Get the stopping algorithms used in the project"""

#     stopping = Stopping()

#     try:
#         stopping = stopping.from_file(
#             Path(
#                 project.project_path,
#                 "reviews",
#                 project.reviews[0]["id"],
#                 "stopping_metadata.json",
#             )
#         )
#     except FileNotFoundError:
#         pass

#     return jsonify(asdict(stopping))


@bp.route("/projects/<project_id>/wordcounts", methods=["GET"])
@login_required
@project_authorization
def api_get_wordcounts(project):  # noqa: F401
    """Get the word counts used in the project"""

    df_user_input_data = project.read_input_data()

    with open_state(project.project_path) as s:
        data = s.get_results_table()

    record_ids_rel = data[data["label"] == 1]["record_id"].to_list()
    record_ids_irrel = data[data["label"] == 0]["record_id"].to_list()

    df_rel = df_user_input_data.iloc[record_ids_rel]["abstract"].fillna("").to_list()
    df_irrel = (
        df_user_input_data.iloc[record_ids_irrel]["abstract"].fillna("").to_list()
    )

    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(df_rel)
        feature_array = np.array(vectorizer.get_feature_names_out())
        tfidf_sorting = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
        top_n_rel = feature_array[tfidf_sorting][:15]

        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(df_irrel)
        feature_array = np.array(vectorizer.get_feature_names_out())
        tfidf_sorting = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
        top_n_irrel = feature_array[tfidf_sorting][:15]

        return jsonify(
            {"relevant": top_n_rel.tolist(), "irrelevant": top_n_irrel.tolist()}
        )
    except ValueError:
        return jsonify({"relevant": [], "irrelevant": []})


@bp.route("/projects/<project_id>/train", methods=["POST"])
@login_required
@project_authorization
def api_train(project):  # noqa: F401
    """Start training of first model or simulation."""

    if ranking := request.form.get("ranking", type=str, default=None):
        _fill_last_ranking(project, ranking)
        return jsonify({"success": True})

    try:
        _run_model(project)

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

    return jsonify({"status": project.reviews[0]["status"]})


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
    oracle:
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

    if current_status == "setup" and status == "review":
        is_simulation = project.config["mode"] == PROJECT_MODE_SIMULATE

        with open_state(project) as s:
            labels = s.get_results_table()["label"].to_list()

        if not (pk := 0 in labels and 1 in labels) and not is_simulation:
            _fill_last_ranking(project, "random")

        if trigger_model and (pk or is_simulation):
            _run_model(project)

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

    return jsonify({"status": status}), 201


@bp.route("/projects/import", methods=["POST"])
@login_required
def api_import_project():
    """Import project"""

    # raise error if file not given
    if "file" not in request.files:
        return jsonify(message="No ASReview file found to import."), 400

    try:
        project = asr.Project.load(
            request.files["file"], asreview_path(), safe_import=True
        )
    except Exception as err:
        raise ValueError("Failed to import project.") from err

    settings_fp = Path(
        project.project_path,
        "reviews",
        project.config["reviews"][0]["id"],
        "settings_metadata.json",
    )
    settings = ReviewSettings.from_file(settings_fp)

    warnings = []
    try:
        _check_model(settings)
    except ValueError as err:
        settings.reset_model()
        with open(settings_fp, "w") as f:
            json.dump(asdict(settings), f)
        warnings.append(
            str(err) + " Check if an extension with the model is installed."
        )
        warnings.append(
            " The model settings have been reset to the default model and"
            " can be changed in the project settings."
        )

    if not current_app.config.get("LOGIN_DISABLED", False):
        current_user.projects.append(Project(project_id=project.config.get("id")))
        DB.session.commit()

    project.config["roles"] = {"owner": True}
    return jsonify({"data": project.config, "warnings": warnings})


def _flatten_tags(results, tags_config):
    if tags_config is None:
        del results["tags"]
        return results

    df_tags = []
    for _, row in results["tags"].items():
        tags = {}
        for group in row:
            for tag in group["values"]:
                tags[f"tag_{group['id']}_{tag['id']}"] = int(tag.get("checked", False))

        df_tags.append(tags)

    return pd.concat(
        [
            results.drop("tags", axis=1),
            pd.DataFrame(df_tags, index=results.index, dtype="Int64"),
        ],
        axis=1,
    )


@bp.route("/projects/<project_id>/export_dataset", methods=["GET"])
@login_required
@project_authorization
def api_export_dataset(project):
    """Export dataset with relevant/irrelevant labels"""

    file_format = request.args.get("format", default="csv", type=str)
    export_user_details = request.args.get("user", default=1, type=int)
    collections = request.args.getlist("collections", type=str)

    df_user_input_data = project.read_input_data()
    df_user_input_data = df_user_input_data.loc[
        :, ~df_user_input_data.columns.str.startswith("asreview_")
    ]

    with open_state(project.project_path) as s:
        df_results = s.get_results_table().set_index("record_id")
        df_pool = s.get_pool()

    export_order = []

    if "relevant" in collections:
        export_order.extend(df_results[df_results["label"] == 1].index.to_list())

    if "not_seen" in collections:
        export_order.extend(df_pool.to_list())

    if "irrelevant" in collections:
        export_order.extend(df_results[df_results["label"] == 0].index.to_list())

    df_results = _flatten_tags(
        df_results,
        project.config.get("tags", None),
    )

    # remove model results, can be implemented later with advanced export
    df_results.drop(
        columns=[
            "classifier",
            "query_strategy",
            "balance_strategy",
            "feature_extraction",
            "training_set",
        ],
        inplace=True,
    )

    # add user information
    if not current_app.config.get("LOGIN_DISABLED", False) and export_user_details:
        project_entry = Project.query.filter(
            Project.project_id == project.project_id
        ).one_or_none()
        users = {
            **{u.id: {**u.summarize()} for u in project_entry.collaborators},
            project_entry.owner.id: {**project_entry.owner.summarize()},
        }
        df_results["user_name"] = df_results["user_id"].map(
            lambda x: users.get(x, {}).get("name", None)
        )
        df_results["user_email"] = df_results["user_id"].map(
            lambda x: users.get(x, {}).get("email", None)
        )

    del df_results["user_id"]

    df_export = df_user_input_data.join(
        df_results.add_prefix("asreview_"), how="left"
    ).loc[export_order]

    tmp_path = tempfile.TemporaryDirectory()
    tmp_path_dataset = Path(tmp_path.name, f"export_dataset.{file_format}")

    writer = load_extension("writers", f".{file_format}")
    writer.write_data(df_export, tmp_path_dataset)

    return send_file(
        tmp_path_dataset,
        as_attachment=True,
        max_age=0,
        download_name=f"asreview_{'+'.join(collections)}_{project.config['name']}.{file_format}",
    )


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

    project_export_name = secure_filename(project.config["name"])

    tmpdir = tempfile.TemporaryDirectory()
    tmpfile = Path(tmpdir.name, project_export_name).with_suffix(".asreview")

    logging.info("Saving project (temporary) to %s", tmpfile)
    project.export(tmpfile)

    return send_file(
        tmpfile,
        as_attachment=True,
        max_age=0,
    )


def _get_labels(state_obj, priors=False):
    # get the number of records
    n_records = state_obj.n_records

    # get the labels
    labels = state_obj.get_labels(priors=priors).to_list()

    # if less labels than records, fill with 0
    if len(labels) < n_records:
        labels += [0] * (n_records - len(labels))

    return pd.Series(labels)


@bp.route("/projects/<project_id>/progress", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_info(project):  # noqa: F401
    """Get progress statistics of a project"""

    include_priors = request.args.get("priors", True, type=bool)

    try:
        is_project(project)

        with open_state(project.project_path) as s:
            labels = s.get_results_table(priors=include_priors)["label"]
            labels_without_priors = s.get_results_table(priors=False)["label"]
        n_records = len(project.data_store)

    except (FileNotFoundError, ValueError, ProjectError):
        labels = np.array([])
        labels_without_priors = np.array([])
        n_records = 0

    if (
        project.config.get("mode") == PROJECT_MODE_SIMULATE
        and project.data_store["included"].sum() == labels.sum()
    ):
        return jsonify(
            {
                "n_included": int(sum(labels == 1)),
                "n_excluded": n_records - int(sum(labels == 1)),
                "n_included_no_priors": int(sum(labels_without_priors == 1)),
                "n_excluded_no_priors": int(sum(labels_without_priors == 0))
                + (n_records - len(labels)),
                "n_records": n_records,
                "n_pool": 0,
            }
        )

    return jsonify(
        {
            "n_included": int(sum(labels == 1)),
            "n_excluded": int(sum(labels == 0)),
            "n_included_no_priors": int(sum(labels_without_priors == 1)),
            "n_excluded_no_priors": int(sum(labels_without_priors == 0)),
            "n_records": n_records,
            "n_pool": n_records - len(labels),
        }
    )


@bp.route("/projects/<project_id>/stopping", methods=["GET"])
@login_required
@project_authorization
def api_get_stopping(project):  # noqa: F401
    """Get stopping of a project"""

    settings_fp = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )
    stopping = ReviewSettings.from_file(settings_fp).stopping

    if stopping is None:
        threshold = 50
    else:
        threshold = stopping[0]["params"]["threshold"]

    with open_state(project.project_path) as s:
        labels = s.get_results_table(priors=False)["label"]

    if len(labels) > 0 and int(sum(labels == 1)) > 0:
        last_relevant_index = len(labels) - 1 - np.argmax(labels[::-1] == 1)
        n_since_last_relevant = int(sum(labels[last_relevant_index + 1 :] == 0))
    else:
        n_since_last_relevant = 0

    return jsonify(
        [
            {
                "id": "n_since_last_inclusion",
                "params": {
                    "threshold": threshold,
                },
                "value": n_since_last_relevant,
                "stop": n_since_last_relevant is not None
                and n_since_last_relevant >= threshold,
            }
        ]
    )


@bp.route("/projects/<project_id>/stopping", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_mutate_stopping(project):  # noqa: F401
    """Mutate stopping of a project"""

    settings_fp = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )
    settings = ReviewSettings.from_file(settings_fp)

    settings = replace(
        settings,
        stopping=[
            {
                "id": request.form.get("id", "n_since_last_inclusion"),
                "params": {
                    "threshold": request.form.get("threshold", 50, type=int),
                },
            }
        ],
    )

    with open(settings_fp, "w") as f:
        json.dump(asdict(settings), f)

    return jsonify(settings.stopping)


@bp.route("/projects/<project_id>/progress_data", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_data(project):  # Consolidated endpoint
    """Get raw progress data of a project"""

    include_priors = request.args.get("priors", False, type=bool)

    with open_state(project.project_path) as s:
        labels = s.get_results_table("label", priors=include_priors)
        labels_with_priors = s.get_results_table("label", priors=True)

    if (
        project.config.get("mode") == PROJECT_MODE_SIMULATE
        and project.data_store["included"].sum() == labels_with_priors["label"].sum()
    ):
        labels = pd.DataFrame(
            {
                "label": labels["label"].to_list()
                + np.zeros(len(project.data_store) - len(labels)).tolist(),
            }
        )

    return jsonify(labels.to_dict(orient="records"))


@bp.route("/projects/<project_id>/record/<record_id>", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_label_record(project, record_id):  # noqa: F401
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

    tags = request.form.get("tags", type=str)
    if not tags:
        tags = []
    else:
        tags = json.loads(tags)

    retrain_model = bool(request.form.get("retrain_model", default=False))

    user_id = (
        None if current_app.config.get("LOGIN_DISABLED", False) else current_user.id
    )

    with open_state(project.project_path) as state:
        if label in [0, 1]:
            state.add_labeling_data(
                record_ids=[record_id],
                labels=[label],
                tags=[tags],
                user_id=user_id,
            )
        elif label == -1:
            state.delete_record_labeling_data(record_id)
        else:
            raise ValueError(f"Invalid label {label}")

    if retrain_model:
        _run_model(project)

    if request.method == "POST":
        return jsonify({"success": True})
    else:
        with open_state(project.project_path) as state:
            record = state.get_results_record(record_id)

        item = asdict(project.data_store.get_records(record_id))
        item["state"] = record.iloc[0].to_dict()
        item["tags_form"] = project.config.get("tags", None)
        item["state"]["user"] = None
        del item["state"]["user_id"]

        return jsonify({"result": item})


@bp.route("/projects/<project_id>/record/<record_id>/note", methods=["PUT"])
@login_required
@project_authorization
def api_update_note(project, record_id):  # noqa: F401
    note = request.form.get("note", type=str)
    note = note if note != "" else None

    with open_state(project.project_path) as state:
        state.update_note(record_id, note)

    return jsonify({"success": True})


@bp.route("/projects/<project_id>/get_document", methods=["GET"])
@login_required
@project_authorization
def api_get_document(project):  # noqa: F401
    """Retrieve unlabeled record in order of review."""

    user_id = (
        None if current_app.config.get("LOGIN_DISABLED", False) else current_user.id
    )

    with open_state(project.project_path) as state:
        pending = state.get_pending(user_id=user_id)

        if pending.empty:
            try:
                pending = state.query_top_ranked(user_id=user_id)
            except ValueError:
                ranking = state.get_last_ranking_table()
                pool = state.get_pool()

                if not ranking.empty and pool.empty:
                    project.update_review(status="finished")

                return jsonify(
                    {"result": None, "pool_empty": not ranking.empty and pool.empty}
                )

    item = asdict(project.data_store.get_records(pending["record_id"].iloc[0]))
    item["state"] = pending.iloc[0].to_dict()
    item["tags_form"] = project.config.get("tags", None)
    item["state"]["user"] = None
    del item["state"]["user_id"]

    try:
        item["error"] = project.get_review_error()
    except ValueError:
        pass

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

        return jsonify({"success": True})


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
