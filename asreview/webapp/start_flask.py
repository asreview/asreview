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

import logging
import os
from pathlib import Path

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
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
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


def create_app(env = "development", config_file=None, **kwargs):

    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="build/static",
        template_folder="build",
    )
    app.config.from_prefixed_env()

    if (config_file_path := config_file or app.config.get("CONFIGFILE", "")):
        app.config.from_file(
            Path(config_file_path).absolute(), load=tomllib.load, text=False
        )

    # If the frontend runs on a different port, or even on a different
    # URL, then allowed-origins must be set to avoid CORS issues. You can
    # set the allowed-origins in the config file. In the previous lines
    # the config file has been read.
    # If the allowed-origins are not set by now, they are set to
    # False, which will bypass setting any CORS parameters!
    if not app.config.get("ALLOWED_ORIGINS", False):
        app.config["ALLOWED_ORIGINS"] = False

    if not app.config["ALLOWED_ORIGINS"] and app.debug:
        app.config["ALLOWED_ORIGINS"] = [
            "http://localhost:3000", "http://127.0.0.1:3000"]

    # config JSON Web Tokens
    login_manager = LoginManager(app)
    login_manager.init_app(app)
    login_manager.session_protection = "strong"

    if not app.config.get("AUTHENTICATION_ENABLED", False):
        app.config["SECRET_KEY"] = ""

        # This is necessary to pass the test_webapp.py tests
        @login_manager.user_loader
        def load_user(user_id):
            return False

    elif app.config.get("AUTHENTICATION_ENABLED", False):
        # Register a callback function for current_user.
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

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
    def index():
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
