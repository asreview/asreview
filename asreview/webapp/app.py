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
from flask import request
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


def create_app(config_path=None):
    """Create a new ASReview webapp.

    For use with WSGI servers, such as gunicorn:

        > gunicorn -w 4 -b "127.0.0.1:5006" "asreview.webapp.app:create_app()"

    Returns
    -------
    Flask:
        The ASReview webapp.
    """

    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="build/static",
        template_folder="build",
    )

    app.config.from_prefixed_env()  # deprecated, remove in version 2.0
    app.config.from_prefixed_env("ASREVIEW_LAB")

    # deprecated, remove in version 2.0
    if app.config.get("CONFIGFILE", None):
        app.config["CONFIG_PATH"] = app.config["CONFIGFILE"]

    # load config from file
    if config_fp := (config_path or app.config.get("CONFIG_PATH", None)):
        app.config.from_file(Path(config_fp).absolute(), load=tomllib.load, text=False)

    # remove all lock files per project folder
    for f in asreview_path().iterdir():
        if f.is_dir():
            # remove lock files
            [lockfile.unlink(missing_ok=True) for lockfile in f.glob("*.lock")]

    # if there are no cors and config is in debug mode, add default cors
    if app.debug and not app.config.get("CORS_ORIGINS", None):
        app.config["CORS_ORIGINS"] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    CORS(app, supports_credentials=True)

    with app.app_context():
        app.register_blueprint(projects.bp)

    if not app.config.get("LOGIN_DISABLED", False):
        # config JSON Web Tokens
        login_manager = LoginManager(app)
        login_manager.init_app(app)
        login_manager.session_protection = "strong"

        # Register a callback function for current_user.
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

        if not app.config.get("SQLALCHEMY_DATABASE_URI", None):
            env = "development" if app.debug else "production"
            env = "test" if app.testing else env
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

        with app.app_context():
            app.register_blueprint(auth.bp)
            app.register_blueprint(team.bp)

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

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
    @app.route("/signin", methods=["GET"])
    @app.route("/signup", methods=["GET"])
    @app.route("/confirm_account", methods=["GET"])
    @app.route("/oauth_callback", methods=["GET"])
    @app.route("/profile", methods=["GET"])
    @app.route("/get_profile", methods=["GET"])
    @app.route("/update_profile", methods=["GET"])
    @app.route("/projects/", methods=["GET"])
    @app.route("/projects/<project_id>/", methods=["GET"])
    @app.route("/projects/<project_id>/<tab>/", methods=["GET"])
    @app.route("/forgot_password", methods=["GET"])
    @app.route("/reset_password", methods=["GET"])
    def index(**kwargs):
        return render_template("index.html", api_url=app.config.get("API_URL", "/"))

    @app.route("/favicon.ico")
    @app.route("/favicon.png")
    @app.route("/robots.txt")
    def static_from_root():
        return send_from_directory(
            "build", request.path[1:]
        )

    @app.route("/boot", methods=["GET"])
    def api_boot():
        """Get the boot info."""

        authenticated = not app.config.get("LOGIN_DISABLED", False)

        response = {
            "authentication": authenticated,
            "version": asreview_version,
            "login_info": app.config.get("LOGIN_INFO", None),
        }

        if authenticated:

            response["allow_account_creation"] = app.config.get(
                "ALLOW_ACCOUNT_CREATION", False
            )
            response["allow_teams"] = app.config.get("ALLOW_TEAMS", False)

            response["email_verification"] = bool(
                app.config.get("EMAIL_VERIFICATION", False)
            )

            response["email_config"] = all(
                [
                    app.config.get("MAIL_SERVER", False),
                    app.config.get("MAIL_USERNAME", False),
                    app.config.get("MAIL_PASSWORD", False),
                ]
            )

            # if oauth config is provided
            if isinstance(app.config.get("OAUTH", False), OAuthHandler):
                if params := app.config.get("OAUTH").front_end_params():
                    response["oauth"] = params

        return jsonify(response)

    return app
