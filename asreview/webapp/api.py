
import os
import re
import json
import logging
import subprocess
import shlex
from urllib.request import urlretrieve
import urllib.parse


from flask.json import jsonify
from flask_cors import CORS
from flask import request, Blueprint, Response
from werkzeug.utils import secure_filename

import numpy as np

from asreview.datasets import get_dataset
from asreview.webapp.utils.paths import list_asreview_project_paths
from asreview.webapp.utils.paths import get_data_path, get_project_file_path
from asreview.webapp.utils.paths import get_lock_path, get_proba_path
from asreview.webapp.utils.project import get_paper_data, get_statistics,\
    export_to_string
from asreview.webapp.utils.project import label_instance
from asreview.webapp.utils.project import get_instance
from asreview.webapp.utils.project import init_project, read_data

from asreview.webapp.types import is_project
from asreview.webapp.utils.validation import check_dataset
from asreview.webapp.utils.project import add_dataset_to_project
from asreview.webapp.utils.datasets import search_data
from asreview.webapp.sqlock import SQLiteLock
from asreview.webapp.utils.io import read_pool, read_label_history


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


@bp.route('/demo_data', methods=["GET"])
def api_demo_data_project():  # noqa: F401
    """Get info on the article"""

    try:
        from asreview.datasets import get_available_datasets

        result_datasets = []
        datasets = get_available_datasets()
        for group_name, group in datasets.items():
            for dataset_key, dataset in group.items():
                result_datasets.append(dataset.to_dict())

        payload = {"result": result_datasets}

    except Exception as err:
        logging.error(err)
        response = jsonify(message="demo-data-loading-failed")

        return response, 500

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/upload', methods=["POST"])
def api_upload_data_project(project_id):  # noqa: F401
    """Get info on the article"""

    if not is_project(project_id):
        response = jsonify(message="project-not-found")
        return response, 404

    if request.form.get('demo_data', None):
        # download file and save to folder

        demo_data = get_dataset(request.form['demo_data'])

        url_parts = urllib.parse.urlparse(demo_data.url)
        filename = url_parts.path.rsplit('/', 1)[-1]

        urlretrieve(
            demo_data.url,
            get_data_path(project_id) / filename
        )

        add_dataset_to_project(project_id, filename)

    elif 'file' in request.files:

        data_file = request.files['file']

        # check the file is file is in a correct format
        check_dataset(data_file)  # TODO{qubixes}: implement val strategy
        try:

            filename = secure_filename(data_file.filename)
            fp_data = get_data_path(project_id) / filename

            # save the file
            data_file.save(str(fp_data))

            add_dataset_to_project(project_id, filename)

        except Exception as err:

            logging.error(err)

            response = jsonify(message="project-upload-failure")

            return response, 500
    else:
        response = jsonify(message="no-file-found")
        return response, 500

    return jsonify({"success": True})


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
    # start training the model
    run_command = f"python -m asreview web_run_model '{project_id}' 1"
    subprocess.Popen(shlex.split(run_command))

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@bp.route('/project/<project_id>/model/init_ready', methods=["GET"])
def api_init_model_ready(project_id):  # noqa: F401
    """Check if trained model is available
    """

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

    dataset_str = export_to_string(project_id)

    return Response(
        dataset_str,
        mimetype="text/csv",
        headers={"Content-disposition":
                 f"attachment; filename=asreview_result_{project_id}.csv"})


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
    payload = get_paper_data(
        project_id,
        new_instance,
        return_debug_label=True
    )
    payload["doc_id"] = new_instance

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
