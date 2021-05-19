# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

import logging
import os

from flask import Blueprint
from flask import send_from_directory
from flask.json import jsonify
from flask.templating import render_template
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version

bp = Blueprint('base',
               __name__,
               static_folder="../build/static",
               template_folder="../build")


@bp.errorhandler(InternalServerError)
def error_500(e):
    original = getattr(e, "original_exception", None)

    if original is None:
        # direct 500 error, such as abort(500)
        logging.error(e)
        return jsonify(message="Whoops, something went wrong."), 500

    # wrapped unhandled error
    logging.error(e.original_exception)
    return jsonify(message=str(e.original_exception)), 500


@bp.route('/', methods=['GET'])
def index():
    return render_template("index.html")


@bp.route('/favicon.ico')
def send_favicon():
    return send_from_directory(
        'build',
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )


@bp.route('/boot', methods=["GET"])
def api_boot():
    """Get the boot info."""
    if os.environ.get("FLASK_ENV", None) == "development":
        status = "development"
    else:
        status = "asreview"

        try:
            import asreviewcontrib.covid19  # noqa
            status = "asreview-covid19"
        except ImportError:
            logging.debug("covid19 plugin not found")

    # get the asreview version

    response = jsonify({
        "status": status,
        "version": asreview_version,
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response
