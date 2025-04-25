# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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
from pathlib import Path

try:
    import tomllib
except ImportError:
    import tomli as tomllib

from flask import Flask
from flask import redirect
from flask import request
from flask import send_from_directory
from flask.templating import render_template
from flask_cors import CORS
from flask_login import LoginManager
from flask_login import current_user
from werkzeug.exceptions import InternalServerError

from asreview import __version__ as asreview_version
from asreview.webapp import DB
from asreview.webapp._api import auth
from asreview.webapp._api import projects
from asreview.webapp._api import team
from asreview.webapp._authentication.decorators import login_remote_user
from asreview.webapp._authentication.models import User
from asreview.webapp._authentication.oauth_handler import OAuthHandler
from asreview.webapp._authentication.remote_user_handler import RemoteUserHandler
from asreview.webapp.utils import asreview_path


def create_app(**config_vars):
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

    app.config.from_prefixed_env("ASREVIEW_LAB")
    app.config.from_mapping(**{k.upper(): v for k, v in config_vars.items()})
    if config_fp := app.config.get("CONFIG_PATH", None):
        app.config.from_file(Path(config_fp).absolute(), load=tomllib.load, text=False)

    # if there are no cors and config is in debug mode, add default cors
    if app.debug and not app.config.get("CORS_ORIGINS", None):
        app.config["CORS_ORIGINS"] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    CORS(app, supports_credentials=True, expose_headers=["Content-Disposition"])

    with app.app_context():
        app.register_blueprint(projects.bp)

    if app.config.get("AUTHENTICATION", True):
        # Login Manager
        login_manager = LoginManager(app)
        login_manager.init_app(app)
        login_manager.session_protection = "strong"

        # set authentication to True when no auth. arguments are provided.
        app.config["AUTHENTICATION"] = True
        app.config["LOGIN_DURATION"] = int(app.config.get("LOGIN_DURATION", 31))

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
            # set configuration
            app.config["OAUTH"] = OAuthHandler(app.config["OAUTH"])
            # check if user set ALLOW_ACCOUNT_CREATION to True, then
            # raise error
            if app.config.get("ALLOW_ACCOUNT_CREATION"):
                raise ValueError(
                    "When oAuth is used for authentication, the app "
                    "will not allow account creation"
                )
            # explicitly set account creation to False when oAuth is
            # used to avoid account conflicts.
            app.config["ALLOW_ACCOUNT_CREATION"] = False
        if bool(app.config.get("REMOTE_USER", False)):
            app.config["REMOTE_USER"] = RemoteUserHandler(app.config["REMOTE_USER"])

        with app.app_context():
            app.register_blueprint(auth.bp)
            app.register_blueprint(team.bp)

    # Ensure the instance folder exists.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route("/favicon.ico")
    @app.route("/favicon-<path:path>")
    @app.route("/android-chrome-<path:path>")
    @app.route("/apple-touch-icon.png")
    @app.route("/social-preview.png")
    @app.route("/robots.txt")
    @app.route("/app.webmanifest")
    def static_from_root(path=None):
        return send_from_directory("build", request.path[1:])

    @app.errorhandler(InternalServerError)
    def error_500(e):
        """Return JSON instead of HTML for HTTP errors."""
        response = e.get_response()
        response.data = json.dumps(
            {
                "code": e.code,
                "name": e.name,
                "description": e.description,
            }
        )
        logging.error(e.description)
        response.content_type = "application/json"
        return response

    @app.route("/signin", methods=["GET"])
    @app.route("/oauth_callback", methods=["GET"])
    @app.route("/reset_password", methods=["GET"])
    def index(**kwargs):
        if isinstance(app.config.get("OAUTH", False), OAuthHandler):
            oauth_params = json.dumps(app.config.get("OAUTH").front_end_params())
        else:
            oauth_params = str(False).lower()

        return render_template(
            "index.html",
            api_url=app.config.get("API_URL", "/"),
            asreview_version=asreview_version,
            authentication=str(app.config.get("AUTHENTICATION", True)).lower(),
            login_info=app.config.get("LOGIN_INFO", ""),
            allow_account_creation=str(
                app.config.get("ALLOW_ACCOUNT_CREATION", True)
            ).lower(),
            email_verification=str(app.config.get("EMAIL_VERIFICATION", False)).lower(),
            oauth=oauth_params,
        )

    @app.route("/", methods=["GET"])
    @app.route("/<path:url>", methods=["GET"])
    @login_remote_user
    def index_protected(**kwargs):
        if app.config.get("AUTHENTICATION", True) and not current_user.is_authenticated:
            return redirect("/signin")

        return index(**kwargs)

    # The task manager needs to be configured if not in testing
    if not (app.testing):
        # I want people to be able to configure the host and port of
        # the task manager by using the env var TASK_MANAGER_ENDPOINT.
        # This var needs to provide host and port in 1 string.
        endpoint = app.config.get("TASK_MANAGER_ENDPOINT", False)
        if endpoint:
            endpoint = endpoint.split(":")
            app.config["TASK_MANAGER_HOST"] = endpoint[0]
            app.config["TASK_MANAGER_PORT"] = int(endpoint[1])

    return app
