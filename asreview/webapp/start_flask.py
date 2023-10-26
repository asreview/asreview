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

import argparse
import logging
import os
import socket
import webbrowser
from pathlib import Path
from threading import Timer

try:
    import tomllib
except ImportError:
    import tomli as tomllib

from flask import Flask
from flask import send_from_directory
from flask.json import jsonify
from flask.templating import render_template
from flask_cors import CORS
from flask_login import LoginManager
from gevent.pywsgi import WSGIServer
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
from asreview._deprecated import DeprecateAction
from asreview._deprecated import mark_deprecated_help_strings
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

# Host name
HOST_NAME = os.getenv("ASREVIEW_HOST")
if HOST_NAME is None:
    HOST_NAME = "localhost"
# Default Port number
PORT_NUMBER = 5000

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


def _lab_parser():
    # parse arguments if available
    parser = argparse.ArgumentParser(
        prog="lab",
        description="""ASReview LAB - Active learning for Systematic Reviews.""",  # noqa
        formatter_class=argparse.RawTextHelpFormatter,
    )

    parser.add_argument(
        "--clean-project",
        dest="clean_project",
        default=None,
        type=str,
        help="Safe cleanup of temporary files in project.",
    )

    parser.add_argument(
        "--clean-all-projects",
        dest="clean_all_projects",
        default=None,
        action="store_true",
        help="Safe cleanup of temporary files in all projects.",
    )

    parser.add_argument(
        "--ip",
        default=HOST_NAME,
        type=str,
        action=DeprecateAction,
        help="The IP address the server will listen on. Use the --host argument.",
    )

    parser.add_argument(
        "--host",
        default=HOST_NAME,
        type=str,
        help="The IP address the server will listen on.",
    )

    parser.add_argument(
        "--port",
        default=PORT_NUMBER,
        type=int,
        help="The port the server will listen on.",
    )

    parser.add_argument(
        "--enable-auth",
        dest="enable_authentication",
        action="store_true",
        help="Enable authentication.",
    )

    parser.add_argument(
        "--auth-database-uri",
        default=None,
        type=str,
        help="URI of authentication database.",
    )

    parser.add_argument(
        "--secret-key",
        default=None,
        type=str,
        help="Secret key for authentication.",
    )

    parser.add_argument(
        "--salt",
        default=None,
        type=str,
        help="When using authentication, a salt code is needed" "for hasing passwords.",
    )

    parser.add_argument(
        "--flask-configfile",
        default="",
        type=str,
        help="Full path to a TOML file containing Flask parameters"
        "for authentication.",
    )

    parser.add_argument(
        "--no-browser",
        dest="no_browser",
        action="store_true",
        help="Do not open ASReview LAB in a browser after startup.",
    )

    parser.add_argument(
        "--port-retries",
        dest="port_retries",
        default=50,
        type=int,
        help="The number of additional ports to try if the"
        "specified port is not available.",
    )

    parser.add_argument(
        "--certfile",
        default="",
        type=str,
        help="The full path to an SSL/TLS certificate file.",
    )

    parser.add_argument(
        "--keyfile",
        default="",
        type=str,
        help="The full path to a private key file for usage with SSL/TLS.",
    )

    parser.add_argument(
        "--config_file",
        type=str,
        default=None,
        help="Deprecated, see subcommand simulate.",
        action=DeprecateAction,
    )

    parser.add_argument(
        "--seed",
        default=None,
        type=int,
        help="Deprecated, see subcommand simulate.",
        action=DeprecateAction,
    )

    parser.add_argument(
        "--embedding",
        type=str,
        default=None,
        dest="embedding_fp",
        help="File path of embedding matrix. Required for LSTM models.",
    )
    return parser


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
    app.config["PORT"] = kwargs.get("port")
    app.config["HOST"] = kwargs.get("host")

    # Read config parameters if possible, this overrides
    # the previous assignments. Flask config parameters may come
    # as an environment var or from an argument. Argument
    # takes precedence.
    config_from_env = os.environ.get("FLASK_CONFIGFILE", "").strip()
    config_from_arg = kwargs.get("flask_configfile", "").strip()
    config_file_path = config_from_arg or config_from_env

    # Use absolute path, because otherwise it is relative to the config root.
    if config_file_path != "":
        config_file_path = Path(config_file_path)
        if config_file_path.suffix == ".toml":
            app.config.from_file(
                config_file_path.absolute(),
                load=tomllib.load,
                text=False
            )
        else:
            raise ValueError("'flask_configfile' should have a .toml extension")

    # If the frontend runs on a different port, or even on a different
    # URL, then allowed-origins must be set to avoid CORS issues. You can
    # set the allowed-origins in the config file. In the previous lines
    # the config file has been read.
    # If the allowed-origins are not set by now, they are set to
    # False, which will bypass setting any CORS parameters!
    if not app.config.get("ALLOWED_ORIGINS", False):
        app.config["ALLOWED_ORIGINS"] = False

    if not app.config["ALLOWED_ORIGINS"] and os.environ.get("FLASK_DEBUG", "") == "1":
        app.config["ALLOWED_ORIGINS"] = [f"http://{app.config['HOST']}:3000"]

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
        # This ensures the app handles the anonymous user
        # when authentication is disabled and there is no
        # configuration file
        app.config["SECRET_KEY"] = ""

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

        # We must be sure we have a SQLAlchemy database URI. At this
        # stage the TOML file has been read. See if we haven't found
        # such a URI.
        if not app.config.get("SQLALCHEMY_DATABASE_URI", False):
            # there is no configuration, check CLI parameters
            cli_database_uri = (kwargs.get("auth_database_uri") or "").strip()

            # if we still haven't found a database URI, create a sqlite3 database
            if cli_database_uri != "":
                app.config["SQLALCHEMY_DATABASE_URI"] = cli_database_uri
            else:
                # create default path
                uri = os.path.join(asreview_path(), f"asreview.{env}.sqlite")
                app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{uri}"

        # initialize app for SQLAlchemy
        DB.init_app(app)

        with app.app_context():
            # create tables in case they don't exist
            DB.create_all()

        # store oauth config in oauth handler
        if bool(app.config.get("OAUTH", False)):
            app.config["OAUTH"] = OAuthHandler(app.config["OAUTH"])

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # We only need CORS if they are necessary: when the frontend is
    # running on a different port, or even url, we need to set the
    # allowed origins to avoid CORS problems. The allowed-origins
    # can be set in the config file.
    if app.config.get("ALLOWED_ORIGINS", False):
        CORS(app, origins=app.config.get("ALLOWED_ORIGINS"), supports_credentials=True)

    with app.app_context():
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
    @app.route("/confirm_account", methods=["GET"])
    @app.route("/oauth_callback", methods=["GET"])
    @app.route("/projects/", methods=["GET"])
    @app.route("/projects/<project_id>/", methods=["GET"])
    @app.route("/projects/<project_id>/<tab>/", methods=["GET"])
    @app.route("/reset_password", methods=["GET"])
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
        authenticated = app.config.get("AUTHENTICATION_ENABLED", False)

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
    parser = _lab_parser()
    mark_deprecated_help_strings(parser)
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

    host = app.config.get("HOST")
    port = app.config.get("PORT")

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
