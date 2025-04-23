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

from functools import wraps

from flask import abort
from flask import current_app
from flask import jsonify
from flask import request
from flask_login import current_user
from flask_login.config import EXEMPT_METHODS
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import HTTPException

import asreview as asr
from asreview.project.api import is_project
from asreview.project.exceptions import ProjectNotFoundError
from asreview.webapp import DB
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User
from asreview.webapp._authentication.remote_user_handler import RemoteUserHandler
from asreview.webapp._authentication.utils import perform_login_user
from asreview.webapp.utils import get_project_path
from asreview.webapp.utils import get_projects


def login_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_app.config.get("AUTHENTICATION"):
            pass
        elif request.method in EXEMPT_METHODS:
            pass
        else:
            if not (bool(current_user) and current_user.is_authenticated):
                return jsonify({"message": "Login required."}), 401

        return func(*args, **kwargs)

    return decorated_view


def project_authorization(f):
    """
    Decorator to enforce project-level authorization for a given route.

    This decorator checks whether the current user has the necessary permissions
    to access a specific project. It handles both authenticated and unauthenticated
    scenarios, raising appropriate errors or returning a 403 response if access
    is denied.

    In an unauthenticated situation:
    - Verifies if the project exists on the filesystem.
    - Raises a `ProjectNotFoundError` if the project does not exist.

    In an authenticated situation:
    - Checks if the project exists in the database.
    - Raises a `ProjectNotFoundError` if the project does not exist.
    - Verifies if the current user is the owner or a collaborator of the project.
    - Returns a 403 response if the user lacks the necessary permissions.

    Args:
        f (Callable): The route handler function to wrap.

    Returns:
        Callable: The wrapped function with project-level authorization enforced.

    Raises:
        ProjectNotFoundError: If the project does not exist in either the filesystem
                              or the database.
    """

    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        if not current_app.config.get("AUTHENTICATION", True):
            project_path = get_project_path(project_id)
            if not is_project(project_path, raise_on_old_version=True):
                raise ProjectNotFoundError(f"Project '{project_id}' not found")
            project = asr.Project(project_path, project_id=project_id)
            return f(project, *args, **kwargs)

        # find the project
        project = Project.query.filter(Project.project_id == project_id).one_or_none()

        # raise ProjectNotFoundError if not exists
        if project is None:
            raise ProjectNotFoundError(f"Project '{project_id}' not found")

        # if there is a project, check if permissiton
        all_users = set([project.owner] + project.collaborators)
        if current_user not in all_users:
            return jsonify({"message": "no permission"}), 403

        project_path = get_project_path(project_id)
        if not is_project(project_path, raise_on_old_version=True):
            raise ProjectNotFoundError(f"Project '{project_id}' not found")
        project = asr.Project(project_path, project_id=project_id)

        return f(project, *args, **kwargs)

    return decorated_function


def current_user_projects(f):
    """Decorator that returns all authenticated projects"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_app.config.get("AUTHENTICATION", True):
            projects = [(project, None) for project in get_projects(None)]
        else:
            # authenticated with User accounts
            user_db_projects = list(current_user.projects) + list(
                current_user.involved_in
            )
            projects = get_projects(
                [project.project_path for project in user_db_projects]
            )
            projects = zip(projects, user_db_projects)

        return f(projects, *args, **kwargs)

    return decorated_function


def login_remote_user(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if (
            current_app.config.get("AUTHENTICATION", True)
            and not current_user.is_authenticated
        ):
            remote_user_handler = current_app.config.get("REMOTE_USER", False)

            if isinstance(remote_user_handler, RemoteUserHandler):
                try:
                    user_info = remote_user_handler.handle_request(request.environ)
                except HTTPException as e:
                    return jsonify({"message": e.description}), 401

                if user_info["identifier"]:
                    user = User.query.filter(
                        User.identifier == user_info["identifier"]
                    ).one_or_none()
                    if not user:
                        try:
                            user = User(
                                **user_info,
                                origin="remote",
                                public=True,
                                confirmed=True,
                            )
                            DB.session.add(user)
                            DB.session.commit()
                        except (IntegrityError, SQLAlchemyError):
                            DB.session.rollback()
                            abort(
                                500,
                                description="Error attempting to create user based on remote user authentication.",
                            )
                    perform_login_user(user, current_app)
        return f(*args, **kwargs)

    return decorated_function
