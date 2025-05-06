# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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
import math
import shutil
import socket
import tempfile
import time
import zipfile
from dataclasses import asdict
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
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.utils import compute_sample_weight
from sqlalchemy import and_
from werkzeug.exceptions import InternalServerError
from werkzeug.utils import secure_filename

import asreview as asr
from asreview.data.search import fuzzy_find
from asreview.data.utils import duplicated
from asreview.datasets import DatasetManager
from asreview.extensions import extensions
from asreview.extensions import load_extension
from asreview.learner import ActiveLearningCycle
from asreview.learner import ActiveLearningCycleData
from asreview.models import AI_MODEL_CONFIGURATIONS
from asreview.models import get_ai_config
from asreview.models.stoppers import NConsecutiveIrrelevant
from asreview.project.api import PROJECT_MODE_SIMULATE
from asreview.project.exceptions import ProjectError
from asreview.project.exceptions import ProjectNotFoundError
from asreview.project.migrate import migrate_project_v1_v2
from asreview.state.contextmanager import open_state
from asreview.utils import _get_filename_from_url
from asreview.webapp import DB
from asreview.webapp._api.utils import add_id_to_tags
from asreview.webapp._api.utils import get_all_model_components
from asreview.webapp._api.utils import read_tags_data
from asreview.webapp._authentication.decorators import current_user_projects
from asreview.webapp._authentication.decorators import login_required
from asreview.webapp._authentication.decorators import project_authorization
from asreview.webapp._authentication.models import Project
from asreview.webapp._task_manager.task_manager import DEFAULT_TASK_MANAGER_HOST
from asreview.webapp._task_manager.task_manager import DEFAULT_TASK_MANAGER_PORT
from asreview.webapp._tasks import run_model
from asreview.webapp._tasks import run_simulation
from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_project_path

try:
    import importlib.metadata

    importlib.metadata.distribution("asreview-dory")
    DORY_INSTALLED = True
except importlib.metadata.PackageNotFoundError:
    DORY_INSTALLED = False


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

    if ranking not in ["random", "top_down"]:
        raise ValueError(f"Unknown ranking type: {ranking}")

    record_ids = project.data_store["record_id"]
    if ranking == "random":
        ranked_record_ids = record_ids.sample(frac=1)
    elif ranking == "top_down":
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
    logging.exception(e)
    return jsonify(message=message), 400


@bp.errorhandler(ProjectNotFoundError)
def project_not_found(e):
    message = str(e) if str(e) else "Project not found."
    logging.exception(message)
    return jsonify(message=message), 404


@bp.errorhandler(InternalServerError)
def error_500(e):
    original = getattr(e, "original_exception", None)

    if original is None or str(e.original_exception) == "":
        # direct 500 error, such as abort(500)
        logging.exception(e)
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
    project_upgrade_count = 0

    for project, db_project in projects:
        try:
            project_config = project.config

            if project_config.get("version", "").startswith("1."):
                project_upgrade_count += 1
                continue

            if mode and project_config.get("mode") != mode:
                continue

            if current_app.config.get("AUTHENTICATION", True):
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

    return jsonify({"result": project_info, "upgrade_count": project_upgrade_count})


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

        with open(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            ),
            "w",
        ) as f:
            model = get_ai_config()
            json.dump(
                {"name": model["name"], "current_value": asdict(model["value"])}, f
            )

        n_labeled = project.data_store["included"].notnull().sum()

        if n_labeled > 0 and n_labeled < len(project.data_store):
            with open_state(project.project_path) as state:
                labeled_indices = np.where(
                    (project.data_store["included"] == 1)
                    | (project.data_store["included"] == 0)
                )[0]

                labels = project.data_store["included"][labeled_indices].tolist()
                labeled_record_ids = project.data_store["record_id"][
                    labeled_indices
                ].tolist()

                state.add_labeling_data(
                    record_ids=labeled_record_ids,
                    labels=labels,
                    user_id=None,
                )

    except Exception as err:
        try:
            shutil.rmtree(get_project_path(project_id))
        except Exception:
            pass

        logging.exception(err)
        return jsonify(message=f"Failed to create project for this dataset. {err}"), 400

    if current_app.config.get("AUTHENTICATION", True):
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


@bp.route("/upgrade/projects", methods=["PUT"])
@login_required
@current_user_projects
def api_upgrade_projects(projects):
    """Get upgrade project"""

    for project, _ in projects:
        if project.config.get("version", "").startswith("1."):
            migrate_project_v1_v2(project.project_path)
        elif project.config.get("version", "").startswith("2."):
            pass
        else:
            raise ValueError(
                f"Project version {project.config.get('version', '')} not supported."
            )

    return jsonify({"success": True})


@bp.route("/projects/<project_id>/info", methods=["GET"])
@login_required
@project_authorization
def api_get_project_info(project):  # noqa: F401
    """"""
    project_config = project.config

    if current_app.config.get("AUTHENTICATION", True):
        # find project
        db_project = Project.query.filter(
            Project.project_id == project.config.get("id", 0)
        ).one_or_none()

        if db_project:
            project_config["roles"] = {"owner": db_project.owner_id == current_user.id}

    else:
        project_config["roles"] = {"owner": True}

    return jsonify(project_config)


@bp.route("/projects/<project_id>/info", methods=["PUT"])
@login_required
@project_authorization
def api_update_project_info(project):  # noqa: F401
    """Update project info"""

    update_dict = request.form.to_dict()

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
            logging.exception(err)
            return jsonify(message="Failed to load plugin datasets."), 500

    elif subset == "benchmark":
        try:
            # collect the datasets metadata
            result_datasets = manager.list(include=["synergy", "benchmark-nature"])

        except Exception as err:
            logging.exception(err)
            return jsonify(message="Failed to load benchmark datasets."), 500

    else:
        return jsonify(message="demo-data-loading-failed"), 400

    return jsonify({"result": result_datasets})


@bp.route("/projects/<project_id>/data", methods=["GET"])
@login_required
@project_authorization
def api_get_project_data(project):  # noqa: F401
    """"""

    data = project.data_store[["included", "title", "abstract", "doi", "url"]].replace(
        "", None
    )

    return jsonify(
        {
            "n_rows": len(data),
            "n_unlabeled": len(data)
            - len(np.where(data.included == 1)[0])
            - len(np.where(data.included == 0)[0]),
            "n_relevant": len(np.where(data.included == 1)[0]),
            "n_irrelevant": len(np.where(data.included == 0)[0]),
            "n_duplicated": int(duplicated(data).sum()),
            "n_missing_title": int(data.title.isnull().sum()),
            "n_missing_abstract": int(data.abstract.isnull().sum()),
            "n_urn": int(data.url.fillna(data.doi).notnull().sum()),
            "n_english": None,
            "filename": Path(project.config["datasets"][0]["name"]).stem,
        }
    )


@bp.route("/projects/<project_id>/dataset_writer", methods=["GET"])
@login_required
@project_authorization
def api_list_dataset_writers(project):
    """List the name and label of available dataset writer"""

    fp_data = Path(project.config["datasets"][0]["name"])

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
        record_d["tags_form"] = read_tags_data(project)
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

    if current_app.config.get("AUTHENTICATION", True):
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
        record_d["tags_form"] = read_tags_data(project)

        if current_app.config.get("AUTHENTICATION", True):
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
            data = s.get_results_table(["label", "querier"])
            data_prior = data[data["querier"].isnull()]

            # If the 'include_priors' flag is set to False, filter out records that have a query strategy marked as prior.
            if not include_priors:
                data = data[data["querier"] != "prior"]

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


@bp.route("/learners", methods=["GET"])
@login_required
def api_list_learners():
    """List the names and labels of available algorithms"""

    return jsonify(
        {
            "learners": [
                {
                    "name": learner["name"],
                    "label": learner["label"],
                    "type": learner["type"],
                    "is_available": learner.get("extensions", None) is None
                    or DORY_INSTALLED,
                }
                for learner in AI_MODEL_CONFIGURATIONS
            ],
            "models": get_all_model_components(),
        }
    )


@bp.route("/projects/<project_id>/learner", methods=["GET"])
@login_required
@project_authorization
def api_get_learner(project):  # noqa: F401
    """Get the latest learner used in the project"""

    with open(
        Path(
            project.project_path,
            "reviews",
            project.reviews[0]["id"],
            "settings_metadata.json",
        )
    ) as f:
        return jsonify(json.load(f))


@bp.route("/projects/<project_id>/learner", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_set_learner(project):  # noqa: F401
    """Set the learner used in the project"""

    name = request.form.get("name", "custom")

    if name == "custom":
        current_value = json.loads(request.form.get("current_value", "{}"))
        current_value = {k: v for k, v in current_value.items() if v != ""}
    else:
        current_value = asdict(get_ai_config(name)["value"])

    fp = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )

    with open(fp, "w") as f:
        settings = {"name": name, "current_value": current_value}
        json.dump(settings, f)

    project.remove_review_error()

    return jsonify(settings)


@bp.route("/projects/<project_id>/wordcounts", methods=["GET"])
@login_required
@project_authorization
def api_get_wordcounts(project):  # noqa: F401
    """Get the word counts used in the project"""

    df_data = project.data_store[["record_id", "abstract"]]

    with open_state(project.project_path) as s:
        results = s.get_results_table(columns=["record_id", "label"])

    df_data_labels = df_data.merge(results, on="record_id", how="inner")

    try:
        count_vectorizer = CountVectorizer(ngram_range=(1, 2), stop_words="english")
        fm = count_vectorizer.fit_transform(df_data_labels["abstract"])

        nb = MultinomialNB()
        nb.fit(
            fm,
            df_data_labels["label"],
            sample_weight=compute_sample_weight("balanced", df_data_labels["label"]),
        )

        weights = nb.feature_log_prob_[1, :] - nb.feature_log_prob_[0, :]
        feature_names = count_vectorizer.get_feature_names_out()

        return jsonify(
            {
                "relevant": feature_names[np.argsort(weights)][:15:-1].tolist(),
                "irrelevant": feature_names[np.argsort(weights)][:15].tolist(),
            }
        )
    except (ValueError, IndexError):
        return jsonify({"relevant": None, "irrelevant": None})


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
        logging.exception(err)
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

    warnings = []

    # raise error if file not given
    if "file" not in request.files:
        return jsonify(message="No ASReview file found to import."), 400

    with zipfile.ZipFile(request.files["file"], "r") as zip_obj:
        try:
            with zip_obj.open("project.json") as f:
                project_config = json.load(f)
        except KeyError as err:
            raise ValueError("Invalid ASReview project file.") from err

    if project_config["version"].startswith("1."):
        warnings.append(
            "This project was created in an older version of ASReview LAB (version 1)."
            " The active learning model has been reset to the default model and"
            " can be changed in the project settings."
        )

    try:
        project = asr.Project.load(
            request.files["file"], asreview_path(), safe_import=True
        )
    except Exception as err:
        logging.exception(err)
        raise ValueError("Failed to import project.") from err

    fp_al_cycle = Path(
        project.project_path,
        "reviews",
        project.config["reviews"][0]["id"],
        "settings_metadata.json",
    )

    with open(fp_al_cycle, "r") as f:
        current_cycle = json.load(f)["current_value"]

    try:
        ActiveLearningCycle.from_meta(ActiveLearningCycleData(**current_cycle))
    except ValueError as err:
        with open(fp_al_cycle, "w") as f:
            model = get_ai_config()
            json.dump(
                {"name": model["name"], "current_value": asdict(model["value"])}, f
            )

        warnings.append(
            str(err) + " It might be removed from this version of ASReview LAB or you "
            "need to install an extension to use this model component."
        )
        warnings.append(
            "The active learning model has been reset to the default model and"
            " can be changed in the project settings."
        )

    if current_app.config.get("AUTHENTICATION", True):
        current_user.projects.append(Project(project_id=project.config.get("id")))
        DB.session.commit()

    project.config["roles"] = {"owner": True}
    return jsonify({"data": project.config, "warnings": warnings})


@bp.route("/projects/<project_id>/tags", methods=["GET"])
@login_required
@project_authorization
def get_tag_groups(project):
    tags_path = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "tags.json",
    )

    try:
        with open(tags_path, "r") as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify([])
    except Exception as err:
        logging.exception(err)
        return jsonify([]), 500


@bp.route("/projects/<project_id>/tags", methods=["POST"])
@login_required
@project_authorization
def create_tag_group(project):
    tags_path = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "tags.json",
    )

    new_tag_group = json.loads(request.form.get("group", "[]"))

    if not new_tag_group:
        return jsonify(message="No tag group found."), 400

    def add_ids_to_group(group, group_id=0):
        group["id"] = group_id
        return add_id_to_tags(group)

    try:
        with open(tags_path, "r") as f:
            tags = json.load(f)

        tags.append(
            add_ids_to_group(
                new_tag_group, group_id=max([g["id"] for g in tags], default=0) + 1
            )
        )

        with open(tags_path, "w") as f:
            json.dump(tags, f)

        return jsonify(tags)

    except FileNotFoundError:
        new_tag_group = add_ids_to_group(new_tag_group)

        with open(tags_path, "w") as f:
            json.dump([new_tag_group], f)

        return jsonify([new_tag_group])
    except Exception as err:
        logging.exception(err)
        return jsonify(message="Failed to create tag group."), 500


@bp.route("/projects/<project_id>/tags/<int:group_id>", methods=["PUT"])
@login_required
@project_authorization
def update_tag_group(project, group_id):
    """Update a single tag group by its ID."""
    tags_path = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "tags.json",
    )

    updated_tag_group = json.loads(request.form.get("group", "[]"))

    if not updated_tag_group:
        return jsonify(message="No tag group found."), 400

    if "label" not in updated_tag_group:
        return jsonify(message="No tag group label found."), 400

    if "export" not in updated_tag_group:
        return jsonify(message="No tag group export found."), 400

    if "values" not in updated_tag_group:
        return jsonify(message="No tag group values found."), 400

    updated_tag_group = add_id_to_tags(updated_tag_group)

    try:
        with open(tags_path, "r") as f:
            groups = json.load(f)

        group_index = next(
            (i for i, g in enumerate(groups) if g["id"] == group_id), None
        )

        if group_index is None:
            return jsonify(message=f"Tag group '{group_id}' not found."), 404

        groups[group_index] = updated_tag_group

        with open(tags_path, "w") as f:
            json.dump(groups, f)

        return jsonify(updated_tag_group)
    except FileNotFoundError:
        return jsonify(message=f"Tag group '{group_id}' not found."), 404
    except Exception as err:
        logging.exception(err)
        return jsonify(message="Failed to update tag group."), 500


def _flatten_tags(results, tags_config):
    if tags_config is None:
        del results["tags"]
        return results

    df_tags = []
    for _, row in results["tags"].items():
        tags = {}
        for group in row:
            for tag in group["values"]:
                tags[f"tag_{group['export']}_{tag['export']}"] = int(
                    tag.get("checked", False)
                )

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
    export_name = request.args.get("export_name", default=1, type=int)
    export_email = request.args.get("export_email", default=1, type=int)
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
        read_tags_data(project),
    )

    df_results["time"] = pd.to_datetime(df_results["time"], unit="s").dt.strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    # remove model results, can be implemented later with advanced export
    df_results.drop(
        columns=[
            "classifier",
            "querier",
            "balancer",
            "feature_extractor",
            "training_set",
        ],
        inplace=True,
    )

    # add user information
    if current_app.config.get("AUTHENTICATION", True):
        project_entry = Project.query.filter(
            Project.project_id == project.project_id
        ).one_or_none()
        users = {
            **{u.id: {**u.summarize()} for u in project_entry.collaborators},
            project_entry.owner.id: {**project_entry.owner.summarize()},
        }
        if export_name:
            df_results["user_name"] = df_results["user_id"].map(
                lambda x: users.get(x, {}).get("name", None)
            )
        if export_email:
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
        download_name=(
            f"asreview_{'+'.join(collections)}_"
            f"{project.config['name'].replace(' ', '_')}.{file_format}"
        ),
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
        with open_state(project.project_path) as s:
            labels = s.get_results_table(priors=include_priors)["label"]
            labels_without_priors = s.get_results_table(priors=False)["label"]

        n_records = len(project.data_store)
        n_priors = len(labels) - len(labels_without_priors)

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
                "n_records_no_priors": n_records - n_priors,
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
            "n_records_no_priors": n_records - n_priors,
            "n_pool": n_records - len(labels),
        }
    )


@bp.route("/projects/<project_id>/stopping", methods=["GET"])
@login_required
@project_authorization
def api_get_stopper(project):  # noqa: F401
    """Get stopper of a project"""

    fp_al_cycle = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )

    with open(fp_al_cycle, "r") as f:
        cycle = ActiveLearningCycleData(**json.load(f).get("current_value", {}))

    stopper = ActiveLearningCycle.from_meta(cycle).stopper

    if stopper is None:
        return jsonify({"name": None, "params": None})

    with open_state(project.project_path) as s:
        results = s.get_results_table(priors=False)
        labels = results["label"]

    if len(labels) > 0:
        if int(sum(labels == 1)) > 0:
            last_relevant_index = len(labels) - 1 - np.argmax(labels[::-1] == 1)
            n_since_last_relevant = int(sum(labels[last_relevant_index + 1 :] == 0))
        else:
            n_since_last_relevant = int(sum(labels == 0))
    else:
        n_since_last_relevant = 0

    data = project.data_store[["record_id"]]

    return jsonify(
        {
            "id": stopper.name,
            "params": stopper.get_params(),
            "value": n_since_last_relevant,
            "stop": stopper.stop(results, data),
        }
    )


@bp.route("/projects/<project_id>/stopping", methods=["POST", "PUT"])
@login_required
@project_authorization
def api_mutate_stopper(project):  # noqa: F401
    """Mutate stopper of a project"""

    fp_al_cycle = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )

    with open(fp_al_cycle, "r") as f:
        data = json.load(f)

    data["current_value"]["stopper"] = NConsecutiveIrrelevant.name
    data["current_value"]["stopper_param"] = {"n": request.form.get("n", 50, type=int)}

    with open(fp_al_cycle, "w") as f:
        json.dump(data, f)

    return api_get_stopper(project.project_id)


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
        current_user.id if current_app.config.get("AUTHENTICATION", True) else None
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
        item["tags_form"] = read_tags_data(project)
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


@bp.route("/projects/<project_id>/get_record", methods=["GET"])
@login_required
@project_authorization
def api_get_record(project):  # noqa: F401
    """Retrieve unlabeled record in order of review."""

    user_id = (
        current_user.id if current_app.config.get("AUTHENTICATION", True) else None
    )

    if project.config["reviews"][0]["status"] == "finished":
        return jsonify({"result": None, "status": "finished"})

    with open_state(project.project_path) as state:
        pending = state.get_pending(user_id=user_id)

        if pending.empty:
            try:
                pending = state.query_top_ranked(user_id=user_id)
            except ValueError:
                ranking = state.get_last_ranking_table()
                pool = state.get_pool()

                if not ranking.empty and pool.empty:
                    return jsonify({"result": None, "status": "review"})
                else:
                    return jsonify({"result": None, "status": "setup"})

    item = asdict(project.data_store.get_records(pending["record_id"].iloc[0]))
    item["state"] = pending.iloc[0].to_dict()
    item["tags_form"] = read_tags_data(project)
    item["state"]["user"] = None
    del item["state"]["user_id"]

    try:
        item["error"] = project.get_review_error()
    except ValueError:
        pass

    return jsonify({"result": item, "status": "review"})


@bp.route("/projects/<project_id>/delete", methods=["DELETE"])
@login_required
@project_authorization
def api_delete_project(project):  # noqa: F401
    """"""

    if project.project_path.exists() and project.project_path.is_dir():
        try:
            # remove from database if applicable
            if current_app.config.get("AUTHENTICATION", True):
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
            logging.exception(err)
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
        raise ValueError("Can't determine file format for this URL.")
    else:
        try:
            dh = datahugger.info(uri)
            files = dh.files.copy()

            for i, _f in enumerate(files):
                files[i]["disabled"] = Path(files[i]["name"]).suffix not in reader_keys

            return jsonify(files=files), 201
        except Exception:
            if uri.startswith("https://doi.org/") or uri.startswith("http://doi.org/"):
                raise ValueError("Can't retrieve files for this DOI.")
            else:
                raise ValueError("Can't retrieve files for this URL.")
