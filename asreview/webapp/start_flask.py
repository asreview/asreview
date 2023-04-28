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
import os
import socket
import webbrowser
from threading import Timer

from flask import Flask
from flask import send_from_directory
from flask.json import jsonify
from flask.templating import render_template
from flask_cors import CORS
from flask_login import LoginManager
from gevent.pywsgi import WSGIServer
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
from asreview.entry_points.lab import _lab_parser
from asreview.project import ASReviewProject
from asreview.project import get_project_path
from asreview.project import get_projects
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.api import auth
from asreview.webapp.api import projects
from asreview.webapp.api import team
from asreview.webapp.authentication.models import User
from asreview.webapp.authentication.oauth_handler import OAuthHandler

# set logging level
if (
    os.environ.get("FLASK_DEBUG", "") == "1"
    or os.environ.get("DEBUG", "") == "1"
    or os.environ.get("FLASK_ENV", "") == "development"
):
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.INFO)


def _url(host, port, protocol):
    """Create url from host and port."""
    return f"{protocol}{host}:{port}/"


def _check_port_in_use(host, port):
    """Check if port is already in use.

    Arguments
    ---------
    host: str
        The current host.
    port: int
        The host port to be checked.

    Returns
    -------
    bool:
        True if port is in use, false otherwise.
    """
    logging.info(f"Checking if host and port are available :: {host}:{port}")
    host = host.replace("https://", "").replace("http://", "")
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


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
        template_folder="build",
    )

    # Get the ASReview arguments.
    app.config["asr_kwargs"] = kwargs
    app.config["AUTHENTICATION_ENABLED"] = kwargs.get("enable_authentication", False)
    app.config["SECRET_KEY"] = kwargs.get("secret_key", False)
    app.config["SECURITY_PASSWORD_SALT"] = kwargs.get("salt", False)

    # Read config parameters if possible, this overrides
    # the previous assignments.
    config_file_path = kwargs.get("flask_configfile", "").strip()
    if config_file_path != "":
        app.config.from_file(config_file_path, load=json.load)

    # set env (test / development / production) according to
    # Flask 2.2 specs (ENV is deprecated)
    if app.config.get("TESTING", None) is True:
        env = "test"
    elif app.config.get("DEBUG", None) is True:
        env = "development"
    else:
        env = "production"

    # config JSON Web Tokens
    login_manager = LoginManager(app)
    login_manager.init_app(app)
    login_manager.session_protection = "strong"

    if app.config["AUTHENTICATION_ENABLED"] is False:
        # This is necessary to pass the test_webapp.py tests
        @login_manager.user_loader
        def load_user(user_id):
            return False

    # setup all database/authentication related resources,
    # only do this when AUTHENTICATION_ENABLED is explicitly True
    elif app.config["AUTHENTICATION_ENABLED"] is True:
        # Register a callback function for current_user.
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

        # In this code-block we make sure certain authentication-related
        # config parameters are set.
        # TODO: should I raise a custom Exception, like MissingParameterError?
        if not app.config.get("SECRET_KEY", False):
            raise ValueError(
                "Please start an authenticated app with a "
                + "secret key parameter (SECRET_KEY)"
            )

        if not app.config.get("SECURITY_PASSWORD_SALT", False):
            raise ValueError(
                "Please start an authenticated app with a "
                + "security password salt (SECURITY_PASSWORD_SALT)"
            )

        if app.config.get("EMAIL_VERIFICATION", False) and not app.config.get(
            "EMAIL_CONFIG", False
        ):
            raise ValueError(
                "Missing email configuration to facilitate email verification"
            )

        # set email config for Flask-Mail
        conf = app.config.get("EMAIL_CONFIG", {})
        app.config["MAIL_SERVER"] = conf.get("SERVER")
        app.config["MAIL_PORT"] = conf.get("PORT", 465)
        app.config["MAIL_USERNAME"] = conf.get("USERNAME")
        app.config["MAIL_PASSWORD"] = conf.get("PASSWORD")
        app.config["MAIL_USE_TLS"] = conf.get("USE_TLS", False)
        app.config["MAIL_USE_SSL"] = conf.get("USE_SSL", False)
        app.config["MAIL_REPLY_ADDRESS"] = conf.get("REPLY_ADDRESS")

        # We must be sure we have a database URI
        if not app.config.get("SQLALCHEMY_DATABASE_URI", False):
            # create default path
            uri = os.path.join(asreview_path(), f"asreview.{env}.sqlite")
            app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{uri}"

        # store oauth config in oauth handler
        if bool(app.config.get("OAUTH", False)):
            app.config["OAUTH"] = OAuthHandler(app.config["OAUTH"])

        # create the database plus table(s)
        DB.init_app(app)
        with app.app_context():
            DB.create_all()

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # TODO@{Casper}:
    # !! Not sure about this, but since the front-end and back-end
    # !! are coupled I think origins should be set to the URL and
    # !! not to '*'
    CORS(
        app,
        resources={
            r"*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ]
            }
        },
    )

    app.register_blueprint(projects.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(team.bp)

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

    @app.route("/", methods=["GET"])
    @app.route("/projects/", methods=["GET"])
    @app.route("/projects/<project_id>/", methods=["GET"])
    @app.route("/projects/<project_id>/<tab>/", methods=["GET"])
    def index(**kwargs):
        return render_template("index.html")

    @app.route("/favicon.ico")
    def send_favicon():
        return send_from_directory(
            "build", "favicon.ico", mimetype="image/vnd.microsoft.icon"
        )

    @app.route("/boot", methods=["GET"])
    def api_boot():
        """Get the boot info."""
        if app.config.get("DEBUG", None) is True:
            status = "development"
        else:
            status = "asreview"

        # the big one
        authenticated = bool(app.config["AUTHENTICATION_ENABLED"])

        response = {
            "status": status,
            "authentication": authenticated,
            "version": asreview_version,
        }

        # if we do authentication we have a lot of extra parameters
        if authenticated:
            # if recaptcha config is provided for account creation
            if app.config.get("RE_CAPTCHA_V3", False):
                response["recaptchav3_key"] = app.config["RE_CAPTCHA_V3"].get(
                    "KEY", False
                )

            # check if users can create accounts
            response["allow_account_creation"] = app.config.get(
                "ALLOW_ACCOUNT_CREATION", False
            )

            response["allow_teams"] = app.config.get("ALLOW_TEAMS", False)

            # check if we are doing email verification
            response["email_verification"] = bool(
                app.config.get("EMAIL_VERIFICATION", False)
            )

            # check if there is an email server setup (forgot password)
            response["email_config"] = bool(app.config.get("EMAIL_CONFIG", False))

            # if oauth config is provided
            if isinstance(app.config.get("OAUTH", False), OAuthHandler):
                params = app.config.get("OAUTH").front_end_params()
                # and there something in it, just to be sure
                if params:
                    response["oauth"] = params

        return jsonify(response)

    return app


def main(argv):
    parser = _lab_parser(prog="lab")
    args = parser.parse_args(argv)

    app = create_app(**vars(args))
    app.config["PROPAGATE_EXCEPTIONS"] = False

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
    # TODO@{Casper}: this needs a little bit
    # of work, we need to access all sub-folders
    if args.clean_all_projects:
        print("Cleaning all project files.")
        for project in get_projects():
            project.clean_tmp_files()
        print("Done")
        return

    # clean project by project_id
    # TODO@{Casper}: cleaning without a user context
    # is meaningless -> I think we should remove this
    # option
    if args.clean_project is not None:
        print(f"Cleaning project file '{args.clean_project}'.")
        ASReviewProject(get_project_path(args.clean_project)).clean_tmp_files()
        print("Done")
        return

    flask_dev = app.config.get("DEBUG", False)
    host = args.ip
    port = args.port
    port_retries = args.port_retries
    # if port is already taken find another one
    if not flask_dev:
        original_port = port
        while _check_port_in_use(host, port) is True:
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

    # run app in flask mode only if we run in development mode
    if flask_dev is True:
        app.run(host=host, port=port, ssl_context=ssl_context)
    else:
        ssl_args = {"keyfile": keyfile, "certfile": certfile} if ssl_context else {}
        server = WSGIServer((host, port), app, **ssl_args)
        server.serve_forever()
