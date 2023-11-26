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
from flask_login import current_user

from asreview.project import ASReviewProject
from asreview.project import ProjectNotFoundError
from asreview.project import get_project_path
from asreview.project import get_projects
from asreview.project import is_project
from asreview.webapp.authentication.models import Project


def project_authorization(f):
    """Decorator function that checks if current user can access
    a project in an authenticated situation"""

    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        if current_app.config.get("LOGIN_DISABLED", False):
            project_path = get_project_path(project_id)
            if not is_project(project_path):
                raise ProjectNotFoundError(f"Project '{project_id}' not found")
            project = ASReviewProject(project_path, project_id=project_id)
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
        if not is_project(project_path):
            raise ProjectNotFoundError(f"Project '{project_id}' not found")
        project = ASReviewProject(project_path, project_id=project_id)

        return f(project, *args, **kwargs)

    return decorated_function


def current_user_projects(f):
    """Decorator that returns all authenticated projects"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_app.config.get("LOGIN_DISABLED", False):
            projects = get_projects(None)
        else:
            # authenticated with User accounts
            user_db_projects = list(current_user.projects) + list(
                current_user.involved_in
            )
            projects = get_projects(
                [project.project_path for project in user_db_projects]
            )

        return f(projects, *args, **kwargs)

    return decorated_function
