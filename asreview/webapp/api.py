import json
import logging
import os
import re
import shutil
import zipfile
import tempfile
import subprocess
import urllib.parse
from copy import deepcopy
from pathlib import Path
from urllib.request import urlretrieve

import numpy as np
from flask import Blueprint
from flask import current_app as app
from flask import request
from flask import Response
from flask import send_file
from flask.json import jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from asreview.datasets import DatasetManager
from asreview.exceptions import BadFileFormatError
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.types import is_project
from asreview.webapp.utils.datasets import get_data_statistics
from asreview.webapp.utils.datasets import get_dataset_metadata
from asreview.webapp.utils.datasets import search_data
from asreview.webapp.utils.io import read_label_history
from asreview.webapp.utils.io import read_pool
from asreview.webapp.utils.paths import asreview_path
from asreview.webapp.utils.paths import get_data_path
from asreview.webapp.utils.paths import get_kwargs_path
from asreview.webapp.utils.paths import get_lock_path
from asreview.webapp.utils.paths import get_proba_path
from asreview.webapp.utils.paths import get_project_file_path
from asreview.webapp.utils.paths import get_project_path
from asreview.webapp.utils.paths import get_tmp_path
from asreview.webapp.utils.paths import list_asreview_project_paths
from asreview.webapp.utils.project import _get_executable
from asreview.webapp.utils.project import add_dataset_to_project
from asreview.webapp.utils.project import export_to_string
from asreview.webapp.utils.project import get_instance
from asreview.webapp.utils.project import get_paper_data
from asreview.webapp.utils.project import get_statistics
from asreview.webapp.utils.project import init_project
from asreview.webapp.utils.project import label_instance
from asreview.webapp.utils.project import read_data
from asreview.webapp.utils.project import move_label_from_labeled_to_pool
from asreview.webapp.utils.validation import check_dataset


bp = Blueprint('api', __name__, url_prefix='/api')
CORS(bp, resources={r"*": {"origins": "*"}})


@bp.route('/boot', methods=["GET"])
def api_boot():  # noqa: F401
    """Get the boot info"""

    if os.environ.get("FLASK_ENV", None) == "development":
        status = "development"
    else:
        status = "asreview"

        try:
            import asreviewcontrib.covid19  # noqa
            status = "asreview-covid19"
        except ImportError:
            logging.debug("covid19 plugin not found")

    response = jsonify({"status": status})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/projects', methods=["GET"])
def api_get_projects():  # noqa: F401
    """Get info on the article"""

    projects = list_asreview_project_paths()
    logging.debug(list_asreview_project_paths)

    project_info = []
    for proj in projects:

        try:
            with open(proj / "project.json", "r") as f:
                res = json.load(f)
                assert res["id"] is not None
                project_info.append(res)
        except Exception as err:
            logging.error(err)

    response = jsonify({
        "result": project_info
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/new', methods=["POST"])
def api_init_project():  # noqa: F401
    """Get info on the article"""

    logging.info("init project")

    project_name = request.form['project_name']
    project_description = request.form['project_description']
    project_authors = request.form['project_authors']

    project_id = re.sub('[^A-Za-z0-9]+', '-', project_name).lower()

    try:
        init_project(
            project_id,
            project_name=project_name,
            project_description=project_description,
            project_authors=project_authors
        )

        response = jsonify({
            "project_id": project_id,
            "project_name": project_name,
            "project_description": project_description,
            "project_authors": project_authors
        })

    except Exception as err:
        logging.error(err)
        response = jsonify(message="project-init-failure")

        return response, 500

    return response


@bp.route('/project/import_project', methods=["POST"])
def api_import_project():
    """Import uploaded project"""

    if 'file' in request.files:

        project_file = request.files['file']
        filename = secure_filename(project_file.filename)

        # check the file format
        if not os.path.splitext(filename)[1] == ".asreview":
            response = jsonify(message="Incorrect file format.")
            return response, 400

        try:

            with zipfile.ZipFile(project_file, "r") as zipObj:
                FileNames = zipObj.namelist()

                # check if the zip file contains a ASReview project
                if sum([fn.endswith("project.json") for fn in FileNames]) == 1:

                    # extract all files to a temporary folder
                    tmpdir = tempfile.TemporaryDirectory()
                    zipObj.extractall(path=tmpdir.name)

                    for fn in FileNames:
                        if fn.endswith("project.json"):
                            fp = Path(tmpdir.name, fn)
                            with open(fp, "r+") as f:
                                project = json.load(f)

                                # if the uploaded project already exists, then make a copy
                                if is_project(project["id"]):
                                    project["id"] += " copy"
                                    project["name"] += " copy"
                                    f.seek(0)
                                    json.dump(project, f)
                                    f.truncate()
                else:
                    response = jsonify(message="No project found within the chosen file.")
                    return response, 404
            try:
                # check if a copy of a project already exists
                os.rename(tmpdir.name, asreview_path() / f"{project['id']}")

            except Exception as err:
                logging.error(err)
                response = jsonify(message=f"A copy of {project['id'][:-5]} already exists.")
                return response, 400

        except Exception as err:
            logging.error(err)
            response = jsonify(message=f"Failed to upload file '{filename}'. {err}")
            return response, 400
    else:
        response = jsonify(message="No file found to upload.")
        return response, 400

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/datasets', methods=["GET"])
def api_demo_data_project():  # noqa: F401
    """Get info on the article"""

    subset = request.args.get('subset', None)

    if subset == "plugin":
        result_datasets = get_dataset_metadata(exclude="builtin")
    elif subset == "test":
        result_datasets = get_dataset_metadata(include="builtin")
    else:
        response = jsonify(message="demo-data-loading-failed")

        return response, 400

    payload = {"result": result_datasets}
    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/upload', methods=["POST"])
def api_upload_data_project(project_id):  # noqa: F401
    """Get info on the article"""

    if not is_project(project_id):
        response = jsonify(message="Project not found.")
        return response, 404

    if request.form.get('demo_data', None):
        # download file and save to folder

        demo_data = DatasetManager().find(request.form['demo_data'])

        if demo_data.dataset_id in ["hall", "ace", "ptsd"]:
            download_url = demo_data.url_demo
        else:
            download_url = demo_data.url

        url_parts = urllib.parse.urlparse(download_url)
        filename = secure_filename(url_parts.path.rsplit('/', 1)[-1])

        urlretrieve(
            download_url,
            get_data_path(project_id) / filename
        )

    elif request.form.get('url', None):
        # download file and save to folder

        download_url = request.form['url']

        try:
            url_parts = urllib.parse.urlparse(download_url)
            filename = secure_filename(url_parts.path.rsplit('/', 1)[-1])

            urlretrieve(
                download_url,
                get_data_path(project_id) / filename
            )

        except ValueError as err:

            logging.error(err)
            message = f"Invalid URL '{download_url}'."

            if isinstance(download_url, str) \
                    and not download_url.startswith("http"):
                message += " Usually, the URL starts with 'http' or 'https'."

            return jsonify(message=message), 400

        except Exception as err:

            logging.error(err)
            message = f"Can't retrieve data from URL {download_url}."

            return jsonify(message=message), 400

    elif 'file' in request.files:

        data_file = request.files['file']

        # check the file is file is in a correct format
        check_dataset(data_file)  # TODO{qubixes}: implement val strategy
        try:

            filename = secure_filename(data_file.filename)
            fp_data = get_data_path(project_id) / filename

            # save the file
            data_file.save(str(fp_data))

        except Exception as err:

            logging.error(err)

            response = jsonify(
                message=f"Failed to upload file '{filename}'. {err}"
            )

            return response, 400
    else:
        response = jsonify(message="No file or dataset found to upload.")
        return response, 400

    try:

        # add the file to the project
        add_dataset_to_project(project_id, filename)

        # get statistics of the dataset
        statistics = get_data_statistics(project_id)
        statistics["filename"] = filename

    # Bad format. TODO{Jonathan} Return informative message with link.
    except BadFileFormatError as err:
        message = f"Failed to upload file '{filename}'. {err}"
        return jsonify(message=message), 400

    except Exception as err:
        message = f"Failed to upload file '{filename}'. {err}"
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

    payload = {"result": []}
    if q:
        result_search = search_data(project_id, q=q, n_max=max_results)

        for paper in result_search:
            payload["result"].append({
                "id": int(paper.record_id),
                "title": paper.title,
                "abstract": paper.abstract,
                "authors": paper.authors,
                "keywords": paper.keywords,
                "included": int(paper.final_included)
            })

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/labelitem', methods=["POST"])
def api_label_item(project_id):  # noqa: F401
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

    # [TODO]project_id, paper_i, label, is_prior=None
    label_instance(
        project_id,
        doc_id,
        label,
        retrain_model=retrain_model
    )

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/prior', methods=["GET"])
def api_get_prior(project_id):  # noqa: F401
    """Get all papers classified as prior documents
    """
    lock_fp = get_lock_path(project_id)
    with SQLiteLock(lock_fp, blocking=True, lock_name="active"):
        label_history = read_label_history(project_id)

    indices = [x[0] for x in label_history]

    records = read_data(project_id).record(indices)

    payload = {"result": []}
    for i, record in enumerate(records):

        payload["result"].append({
            "id": int(record.record_id),
            "title": record.title,
            "abstract": record.abstract,
            "authors": record.authors,
            "keywords": record.keywords,
            "included": int(label_history[i][1])
        })

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/prior_random', methods=["GET"])
def api_random_prior_papers(project_id):  # noqa: F401
    """Get a selection of random papers to find exclusions.

    This set of papers is extracted from the pool, but without
    the already labeled items.
    """

    lock_fp = get_lock_path(project_id)
    with SQLiteLock(lock_fp, blocking=True, lock_name="active"):
        pool = read_pool(project_id)

#     with open(get_labeled_path(project_id, 0), "r") as f_label:
#         prior_labeled = json.load(f_label)

    # excluded the already labeled items from our random selection.
#     prior_labeled_index = [int(label) for label in prior_labeled.keys()]
#     pool = [i for i in pool if i not in prior_labeled_index]

    # sample from the pool (this is already done atm of initializing
    # the pool. But doing it again because a double shuffle is always
    # best)

    try:
        pool_random = np.random.choice(pool, 5, replace=False)
    except Exception:
        raise ValueError("Not enough random indices to sample from.")

    records = read_data(project_id).record(pool_random)

    payload = {"result": []}
    for record in records:

        payload["result"].append({
            "id": int(record.record_id),
            "title": record.title,
            "abstract": record.abstract,
            "authors": record.authors,
            "keywords": record.keywords,
            "included": None
        })

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/start', methods=["POST"])
def api_start(project_id):  # noqa: F401
    """Start training the model
    """

    # get the CLI arguments
    asr_kwargs = deepcopy(app.config['asr_kwargs'])

    # add the machine learning model to the kwargs
    # TODO@{Jonathan} validate model choice on server side
    ml_model = request.form.get("machine_learning_model", None)
    if ml_model:
        asr_kwargs["model"] = ml_model

    # write the kwargs to a file
    with open(get_kwargs_path(project_id), "w") as fp:
        json.dump(asr_kwargs, fp)

    # start training the model

    py_exe = _get_executable()
    run_command = [
        py_exe,
        "-m", "asreview",
        "web_run_model",
        project_id,
        "--label_method",
        "prior"
    ]
    subprocess.Popen(run_command)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/model/init_ready', methods=["GET"])
def api_init_model_ready(project_id):  # noqa: F401
    """Check if trained model is available
    """

    error_path = get_project_path(project_id) / "error.json"
    if error_path.exists():
        print("error on training")
        with open(error_path, "r") as f:
            error_message = json.load(f)
        return jsonify(error_message), 400

    if get_proba_path(project_id).exists():
        logging.info("Model trained - go to review screen")
        response = jsonify(
            {'status': 1}
        )
    else:
        response = jsonify(
            {'status': 0}
        )

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/export', methods=["GET"])
def export_results(project_id):

    # get the export args
    file_type = request.args.get('file_type', None)
    logging.info(f"Start exporting results to '{file_type}'")
    print(f"Start exporting results to '{file_type}'")

    if file_type == "csv":
        dataset_str = export_to_string(project_id, export_type="csv")

        return Response(
            dataset_str,
            mimetype="text/csv",
            headers={"Content-disposition":
                     f"attachment; filename=asreview_result_{project_id}.csv"})
    else:  # excel

        dataset_str = export_to_string(project_id, export_type="excel")
        fp_tmp_export = Path(get_tmp_path(project_id), "export_result.xlsx")

        return send_file(
            fp_tmp_export,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # noqa
            as_attachment=True,
            attachment_filename=f"asreview_result_{project_id}.xlsx",
            cache_timeout=0
        )


@bp.route('/project/<project_id>/export_project', methods=["GET"])
def export_project(project_id):
    """Export a zipped project file"""

    tmpdir = tempfile.TemporaryDirectory()

    shutil.make_archive(
        Path(tmpdir.name, f"export_{project_id}"),
        "zip", 
        get_project_path(project_id)
    )
    fp_tmp_export = Path(tmpdir.name, f"export_{project_id}.zip")

    return send_file(
        fp_tmp_export,
        as_attachment=True,
        attachment_filename=f"{project_id}.asreview",
        cache_timeout=0
    )


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
    """Get progress info on the article"""

    project_file_path = get_project_file_path(project_id)

    # open the projects file
    with open(project_file_path, "r") as f_read:
        project_dict = json.load(f_read)

    statistics = get_statistics(project_id)

    response = jsonify({**project_dict, **statistics})
    response.headers.add('Access-Control-Allow-Origin', '*')

    # return a success response to the client.
    return response


# I think we don't need this one
@bp.route('/project/<project_id>/record/<doc_id>', methods=["POST"])
def api_classify_instance(project_id, doc_id):  # noqa: F401
    """Retrieve classification result.

    This request handles the document identifier and the corresponding label.
    The result is stored in a temp location. If this storage exceeds a certain
    amount of values, then the model is triggered. The values of the location
    are passed to the model and the storaged is cleared. This model will run
    in the background.
    """
    # return the combination of document_id and label.
    doc_id = request.form['doc_id']
    label = request.form['label']

    label_instance(project_id, doc_id, label, retrain_model=True)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/record/<doc_id>', methods=["PUT"])
def api_update_classify_instance(project_id, doc_id):
    """Update classification result."""

    doc_id = request.form['doc_id']
    label = request.form['label']

    move_label_from_labeled_to_pool(project_id, doc_id)
    label_instance(project_id, doc_id, label, retrain_model=True)

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/get_document', methods=["GET"])
def api_get_document(project_id):  # noqa: F401
    """Retrieve documents in order of review.

    After these documents were retrieved, the queue on the client side is
    updated.
    This resuest can get triggered after each document classification.
    Although it might be better to call this function after 20 requests on the
    client side.
    """

    new_instance = get_instance(project_id)

    if new_instance is None:  # don't use 'if not new_instance:'

        item = None
        pool_empty = True
    else:

        item = get_paper_data(
            project_id,
            new_instance,
            return_debug_label=True
        )
        item["doc_id"] = new_instance
        pool_empty = False

    response = jsonify({
        "result": item,
        "pool_empty": pool_empty
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/delete', methods=["DELETE"])
def api_delete_project(project_id):  # noqa: F401
    """Get info on the article"""

    # some checks to check if there is a project to delete
    if project_id == "" or project_id is None:
        response = jsonify(message="project-delete-failure")
        return response, 500

    logging.info(f"delete project {project_id}")

    project_path = get_project_path(project_id)

    if project_path.exists() and project_path.is_dir():
        shutil.rmtree(project_path)

        response = jsonify({'success': True})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    response = jsonify(message="project-delete-failure")
    return response, 500
