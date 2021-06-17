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
import webbrowser
from threading import Timer

from flask import Flask
from flask_restx import Api
from gevent.pywsgi import WSGIServer

from asreview.entry_points.lab import _lab_parser
from asreview.webapp.api import base
import asreview.webapp.api.api as project_api
from asreview.webapp.api.users.users import users_namespace
from asreview.webapp.api.users.auth import auth_namespace
from asreview.webapp.utils.misc import check_port_in_use
from asreview.webapp.utils.project import clean_project_tmp_files
from asreview.webapp.utils.project import clean_all_project_tmp_files
from asreview.webapp.extensions import admin
from asreview.webapp.extensions import bcrypt
from asreview.webapp.extensions import db
from asreview.webapp.extensions import cors

# Auth imports
from asreview.webapp.auth import auth

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
    # Flask_restx blueprint registration
    api = Api(
        version="1.0",
        title="ASReview back-end API",
        doc="/doc",
    )

    # Get the ASReview arguments
    kwargs.pop("dataset", None)
    app.config['asr_kwargs'] = kwargs
    # Use BaseConfig arguments
    app.config.from_object("asreview.webapp.config.BaseConfig")

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    auth.reinit(auth_file=kwargs.get('auth_file', None))

    register_extensions(app)
    register_blueprints(app, api)

    return app


def register_extensions(app):
    """Register Flask extensions."""
    cors.init_app(app, resources={r"*": {"origins": "*"}})
    bcrypt.init_app(app)
    db.init_app(app)
    if os.getenv("FLASK_ENV") == "development":
        admin.init_app(app)
    return None


def register_blueprints(app, api):
    """Register Flask blueprints."""
    # Flask standard blueprint registration
    app.register_blueprint(project_api.bp)
    app.register_blueprint(base.bp)
    # Flask-restx
    api.add_namespace(auth_namespace, path="/auth")
    api.add_namespace(users_namespace, path="/users")
    api.init_app(app)

    return None


def main(argv):

    parser = _lab_parser(prog="lab")
    args = parser.parse_args(argv)

    app = create_app(
        embedding_fp=args.embedding_fp,
        config_file=args.config_file,
        seed=args.seed,
        auth_file=args.authfile
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

    # TODO IF user didn't insert password or username: create anon user
    # with app.app_context():
    #     db.create_all()
    #     if db.session.query(User).filter_by(username='test').count() < 1:
    #         db.session.add(User(
    #             username='randomusername',
    #             password= 'strongpassword',
    #               email = 'strongpassword',
    #             roles='admin'
    #         ))
    #     db.session.commit()
    # TODO Save pass and username and show it to user (TERMINAL: pass; user)
    # TODO AND send token with URL to authenticate user (TERMINAL: URL)

    flask_dev = os.environ.get('FLASK_ENV', "") == "development"
    host = args.ip
    port = args.port
    port_retries = args.port_retries
    # if port is already taken find another one
    if flask_dev is False:
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
            print(f"Port {old_port} is in use.\n* Trying to start at {port}")

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
