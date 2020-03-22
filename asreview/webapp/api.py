
import re
import json
import logging
from pathlib import Path

from flask.json import jsonify
from flask_cors import CORS
from flask import request, Blueprint
from werkzeug.utils import secure_filename

import numpy as np

from asreview.webapp.utils.paths import asreview_path, get_labeled_path, get_pool_path
from asreview.webapp.utils.paths import list_asreview_project_paths
from asreview.webapp.utils.paths import get_data_path
from asreview.webapp.utils.project import get_paper_data
from asreview.webapp.utils.project import label_instance
from asreview.webapp.utils.project import get_instance
from asreview.webapp.utils.project import init_project, read_data

from asreview.webapp.types import is_project
from asreview.webapp.utils.validation import check_dataset
from asreview.webapp.utils.project import add_dataset_to_project
from asreview.webapp.utils.datasets import search_data


bp = Blueprint('api', __name__, url_prefix='/api')
CORS(bp, resources={r"*": {"origins": "*"}})


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
        "results": project_info
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/new', methods=["POST"])
def api_init_project():  # noqa: F401
    """Get info on the article"""

    print("init project")

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


@bp.route('/project/<project_id>/upload', methods=["POST"])
def api_upload_data_project(project_id):  # noqa: F401
    """Get info on the article"""

    if not is_project(project_id):
        response = jsonify(message="project-not-found")
        return response, 404

    if 'file' not in request.files:
        response = jsonify(message="no-file-found")
        return response, 500

    data_file = request.files['file']

    # check the file is file is in a correct format
    check_dataset(data_file)  # TODO{qubixes}: implement validation strategy
    try:

        filename = secure_filename(data_file.filename)
        fp_data = get_data_path(project_id) / filename

        # save the file
        data_file.save(str(fp_data))

        add_dataset_to_project(project_id, filename)

    except Exception as err:

        logging.error(err)

        # reset the state of the project to the start
        # TODO{qubixes} do this with a copy of the project as a backup?

        response = jsonify(message="project-upload-failure")

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

    retrain_model = True if is_prior else False

    # [TODO]project_id, paper_i, label, is_prior=None
    label_instance(
        project_id,
        doc_id,
        label,
        is_prior=is_prior,
        retrain_model=retrain_model
    )

    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/prior', methods=["GET"])
def api_get_prior(project_id):  # noqa: F401
    """Get all papers classified as prior documents
    """

    with open(get_labeled_path(project_id, 0), "r") as f:
        labeled = json.load(f)

    indices, labels = zip(*labeled.items())
    indices = [int(i) for i in indices]

    records = read_data(project_id).record(indices)

    payload = {"result": []}
    for i, record in enumerate(records):

        payload["result"].append({
            "id": int(record.record_id),
            "title": record.title,
            "abstract": record.abstract,
            "authors": record.authors,
            "keywords": record.keywords,
            "included": int(labels[i])
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

    with open(get_pool_path(project_id, 0), "r") as f_pool:
        pool = json.load(f_pool)

    with open(get_labeled_path(project_id, 0), "r") as f_label:
        prior_labeled = json.load(f_label)

    # excluded the already labeled items from our random selection.
    prior_labeled_index = [int(label) for label in prior_labeled.keys()]
    pool = [i for i in pool if i not in prior_labeled_index]

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


@bp.route('/project/<project_id>/document/<doc_id>/info', methods=["GET"])
def api_get_article_info(project_id, doc_id=None):  # noqa: F401
    """Get info on the article"""

    response = jsonify(get_paper_data(paper_id=doc_id))
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


@bp.route('/project/<project_id>/progress', methods=["GET"])
def api_get_progress_info(project_id):  # noqa: F401
    """Get progress info on the article"""
    response = jsonify({'total': None, 'total_pool': None})
    response.headers.add('Access-Control-Allow-Origin', '*')

    # return a success response to the client.
    return response

# I think we don't need this one
# @bp.route('/project/<project_id>/record/<doc_id>', methods=["POST"])
# def api_classify_instance(project_id, doc_id):  # noqa: F401
#     """Retrieve classification result.

#     This request handles the document identifier and the corresponding label.
#     The result is stored in a temp location. If this storage exceeds a certain
#     amount of values, then the model is triggered. The values of the location
#     are passed to the model and the storaged is cleared. This model will run
#     in the background.
#     """
#     # return the combination of document_id and label.
#     doc_id = request.form['doc_id']
#     label = request.form['label']

#     label_instance(doc_id, label)

#     response = jsonify({'success': True})
#     response.headers.add('Access-Control-Allow-Origin', '*')

#     return response


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
    payload = get_paper_data(new_instance)
    payload["doc_id"] = new_instance

    response = jsonify(payload)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

