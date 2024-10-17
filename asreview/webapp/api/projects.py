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
from sqlalchemy import and_
from werkzeug.exceptions import InternalServerError
from werkzeug.utils import secure_filename

import asreview as asr
from asreview.config import PROJECT_MODE_SIMULATE
from asreview.datasets import DatasetManager
from asreview.extensions import extensions
from asreview.extensions import load_extension
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
from asreview.statistics import n_unlabeled
from asreview.utils import _check_model
from asreview.utils import _get_filename_from_url
from asreview.utils import _reset_model_settings
from asreview.webapp import DB
from asreview.webapp.authentication.decorators import current_user_projects
from asreview.webapp.authentication.decorators import project_authorization
from asreview.webapp.authentication.models import Project
from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_project_path

bp = Blueprint("api", __name__, url_prefix="/api")


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

        state.add_last_ranking(records.values, None, ranking, None, None)


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


@bp.route("/projects/stats", methods=["GET"])
@login_required
@current_user_projects
def api_get_projects_stats(projects):  # noqa: F401
    """Get dashboard statistics of all projects"""

    stats_counter = {"n_in_review": 0, "n_finished": 0, "n_setup": 0}

    for project, _ in projects:
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

        n_labeled = (
            0 if as_data.labels is None else n_irrelevant(as_data) + n_relevant(as_data)
        )

        if n_labeled > 0 and n_labeled < len(as_data):
            with open_state(project.project_path) as state:
                labeled_indices = np.where(
                    (as_data.labels == 1) | (as_data.labels == 0)
                )[0]

                labels = as_data.labels[labeled_indices].tolist()
                labeled_record_ids = as_data.record_ids[labeled_indices].tolist()

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

    try:
        as_data = project.read_data()
    except FileNotFoundError:
        return jsonify({"filename": None})

    if as_data.url is not None:
        urn = pd.Series(as_data.url).replace("", None)
    else:
        urn = pd.Series([None] * len(as_data))

    if as_data.doi is not None:
        doi = pd.Series(as_data.doi).replace("", None)
        urn.fillna(doi, inplace=True)

    return jsonify(
        {
            "n_rows": len(as_data),
            "n_unlabeled": n_unlabeled(as_data),
            "n_relevant": n_relevant(as_data),
            "n_irrelevant": n_irrelevant(as_data),
            "n_duplicates": n_duplicates(as_data),
            "n_missing_title": int(
                pd.Series(as_data.title).replace("", None).isnull().sum()
            ),
            "n_missing_abstract": int(
                pd.Series(as_data.abstract).replace("", None).isnull().sum()
            ),
            "n_missing_urn": int(urn.isnull().sum()),
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
        record_d["state"] = None
        record_d["tags_form"] = project.config.get("tags", None)
        result.append(record_d)

    return jsonify({"result": result})


@bp.route("/projects/<project_id>/labeled", methods=["GET"])
@login_required
@project_authorization
def api_get_labeled(project):  # noqa: F401
    """Get all papers classified as labeled documents"""

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
    count = len(state_data)
    if count == 0:
        payload = {
            "count": 0,
            "next_page": None,
            "previous_page": None,
            "result": [],
        }
        return jsonify(payload)

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
    for (_, state), record in zip(state_data.iterrows(), records):
        record_d = asdict(record)
        record_d["state"] = state.to_dict()
        record_d["tags_form"] = project.config.get("tags", None)
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
    settings = ReviewSettings().from_file(settings_fp)

    warnings = []
    try:
        _check_model(settings)
    except ValueError as err:
        settings_model_reset = _reset_model_settings(settings)
        with open(settings_fp, "w") as f:
            json.dump(asdict(settings_model_reset), f)
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
    collections = request.args.getlist("collections", type=str)

    df_user_input_data = project.read_data().to_dataframe()
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


def _get_stats(project, include_priors=False):
    try:
        is_project(project)

        as_data = project.read_data()

        # Get label history
        with open_state(project.project_path) as s:
            labels = s.get_results_table(priors=include_priors)["label"]
            labels_without_priors = s.get_results_table(priors=False)["label"]
        n_records = len(as_data)

    except (StateNotFoundError, ValueError, ProjectError):
        labels = np.array([])
        labels_without_priors = np.array([])
        n_records = 0

    n_included = int(sum(labels == 1))
    n_excluded = int(sum(labels == 0))

    n_included_no_priors = int(sum(labels_without_priors == 1))
    n_excluded_no_priors = int(sum(labels_without_priors == 0))

    if n_included > 0:
        try:
            # Find the last relevant label index
            last_relevant_index = len(labels) - 1 - np.argmax(labels[::-1] == 1)
            n_since_last_relevant = int(sum(labels[last_relevant_index + 1 :] == 0))
        except Exception:
            n_since_last_relevant = "-"
    else:
        n_since_last_relevant = 0

    if len(labels_without_priors) > 0 and n_included > 0:
        try:
            # Find the last relevant label index without priors
            last_relevant_index_no_priors = (
                len(labels_without_priors)
                - 1
                - np.argmax(labels_without_priors[::-1] == 1)
            )
            n_since_last_relevant_no_priors = int(
                sum(labels_without_priors[last_relevant_index_no_priors + 1 :] == 0)
            )
        except Exception:
            n_since_last_relevant_no_priors = "-"
    else:
        n_since_last_relevant_no_priors = None

    return {
        "n_included": n_included,
        "n_excluded": n_excluded,
        "n_included_no_priors": n_included_no_priors,
        "n_excluded_no_priors": n_excluded_no_priors,
        "n_since_last_inclusion": n_since_last_relevant,
        "n_since_last_inclusion_no_priors": n_since_last_relevant_no_priors,
        "n_papers": n_records,
        "n_pool": n_records - n_excluded - n_included,
    }


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

    return jsonify(_get_stats(project, include_priors=include_priors))


@bp.route("/projects/<project_id>/progress_data", methods=["GET"])
@login_required
@project_authorization
def api_get_progress_data(project):  # Consolidated endpoint
    """Get raw progress data of a project"""

    include_priors = request.args.get("priors", False, type=bool)

    with open_state(project.project_path) as s:
        data = s.get_results_table("label", priors=include_priors)

    return jsonify(data.to_dict(orient="records"))


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
        subprocess.Popen(
            [
                sys.executable if sys.executable else "python",
                "-m",
                "asreview",
                "web_run_model",
                str(project.project_path),
            ]
        )

    if request.method == "POST":
        return jsonify({"success": True})
    else:
        with open_state(project.project_path) as state:
            record = state.get_results_record(record_id)

        as_data = project.read_data()
        item = asdict(as_data.record(record_id))
        item["state"] = record.iloc[0].to_dict()
        item["tags_form"] = project.config.get("tags", None)

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
    """Retrieve record in order of review."""

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

    as_data = project.read_data()
    item = asdict(as_data.record(pending["record_id"].iloc[0]))
    item["state"] = pending.iloc[0].to_dict()
    item["tags_form"] = project.config.get("tags", None)

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
