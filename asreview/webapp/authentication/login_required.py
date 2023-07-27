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

from functools import wraps

from flask import current_app
from flask import jsonify
from flask import request
from flask_login import current_user
from flask_login.config import EXEMPT_METHODS

from asreview.webapp.authentication.models import Project


def asreview_login_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if not current_app.config.get("AUTHENTICATION_ENABLED"):
            pass
        elif request.method in EXEMPT_METHODS:
            pass
        else:
            if not (bool(current_user) and current_user.is_authenticated):
                return jsonify({"message": "Login required."}), 401

        return func(*args, **kwargs)

    return decorated_view


def project_authorization(f):
    """Decorator function that checks if current user can access
    a project in an authenticated situation"""

    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        if app_is_authenticated(current_app):
            # find the project
            project = Project.query.filter(
                Project.project_id == project_id
            ).one_or_none()
            if project is None:
                return jsonify({"message": "project not found"}), 404
            # if there is a project, check if
            all_users = set([project.owner] + project.collaborators)
            if current_user not in all_users:
                return jsonify({"message": "no permission"}), 403
        return f(project_id, *args, **kwargs)

    return decorated_function


def app_is_authenticated(app):
    """Checks is app is authenticated"""
    return app.config.get("AUTHENTICATION_ENABLED", False)
