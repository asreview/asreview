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

import logging
import os
import webbrowser
from threading import Timer

from flask import Flask
from flask import send_from_directory
from flask.json import jsonify
from flask.templating import render_template
from flask_cors import CORS
from gevent.pywsgi import WSGIServer
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
from asreview.entry_points.lab import _lab_parser
from asreview.webapp import api
from asreview.webapp.utils.misc import check_port_in_use
from asreview.webapp.utils.project import clean_project_tmp_files
from asreview.webapp.utils.project import clean_all_project_tmp_files

# set logging level
if os.environ.get('FLASK_ENV', "") == "development":
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)


def _url(host, port, protocol):
    """Create url from host and port."""
    return f"{protocol}{host}:{port}/"


def _open_browser(host, port, protocol, no_browser):
    """Open ASReview in browser if flag is set.

    Otherwise, it displays an alert to copy and paste the url
    at which ASReview is currently served.
    """
    if no_browser:
        print(
            "\nTo access ASReview LAB, copy and paste "
            "this url in a browser "
            f"{_url(host, port, protocol)}\n"
        )
        return

    start_url = _url(host, port, protocol)
    Timer(1, lambda: webbrowser.open_new(start_url)).start()
    print(
        f"Start browser at {start_url}"
        "\n\n\n\nIf your browser doesn't open. "
        f"Please navigate to '{start_url}'\n\n\n\n"
    )


def create_app(**kwargs):

    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="build/static",
        template_folder="build"
    )

    # Get the ASReview arguments.
    kwargs.pop("dataset", None)
    app.config['asr_kwargs'] = kwargs

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app, resources={r"*": {"origins": "*"}})

    app.register_blueprint(api.bp)

    @app.errorhandler(InternalServerError)
    def error_500(e):
        original = getattr(e, "original_exception", None)

        if original is None:
            # direct 500 error, such as abort(500)
            logging.error(e)
            return jsonify(message="Whoops, something went wrong."), 500

        # wrapped unhandled error
        logging.error(e.original_exception)
        return jsonify(message=str(e.original_exception)), 500

    @app.route('/', methods=['GET'])
    def index():

        return render_template("index.html")

    @app.route('/favicon.ico')
    def send_favicon():
        return send_from_directory(
            'build',
            'favicon.ico',
            mimetype='image/vnd.microsoft.icon'
        )

    @app.route('/boot', methods=["GET"])
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

    return app


def main(argv):

    parser = _lab_parser(prog="lab")
    args = parser.parse_args(argv)

    app = create_app(
        embedding_fp=args.embedding_fp,
        config_file=args.config_file,
        seed=args.seed
    )
    app.config['PROPAGATE_EXCEPTIONS'] = False

    # ssl certificate, key and protocol
    certfile = args.certfile
    keyfile = args.keyfile
    ssl_context = None
    if certfile and keyfile:
        protocol = "https://"
        ssl_context = (certfile, keyfile)
    else:
        protocol = "http://"

    # clean all projects
    if args.clean_all_projects:
        print("Cleaning all project files.")
        clean_all_project_tmp_files()
        print("Done")
        return

    # clean project by project_id
    if args.clean_project is not None:
        print(f"Cleaning project file '{args.clean_project}'.")
        clean_project_tmp_files(args.clean_project)
        print("Done")
        return

    flask_dev = os.environ.get('FLASK_ENV', "") == "development"
    host = args.ip
    port = args.port
    port_retries = args.port_retries
    # if port is already taken find another one
    if not os.environ.get('FLASK_ENV', "") == "development":
        original_port = port
        while check_port_in_use(host, port) is True:
            old_port = port
            port = int(port) + 1
            if port - original_port >= port_retries:
                raise ConnectionError(
                    "Could not find an available port \n"
                    "to launch ASReview LAB. Last port \n"
                    f"was {str(port)}"
                )
            print(
                f"Port {old_port} is in use.\n* Trying to start at {port}"
            )

    # open webbrowser if not in flask development mode
    if flask_dev is False:
        _open_browser(host, port, protocol, args.no_browser)

    # run app in flask mode only if flask_env == development is True
    if flask_dev is True:
        app.run(host=host, port=port, ssl_context=ssl_context)
    else:
        ssl_args = {'keyfile': keyfile, 'certfile': certfile} if ssl_context else {}
        server = WSGIServer((host, port), app, **ssl_args)
        server.serve_forever()
