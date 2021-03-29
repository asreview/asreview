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

from flask import Blueprint
from flask import request
from flask import jsonify
from flask.views import MethodView
from werkzeug.exceptions import InternalServerError
from werkzeug.exceptions import NotFound
from werkzeug.exceptions import BadRequest

from asreview.webapp.auth.crud import (  # isort:skip
    get_all_users,
    get_user_by_email,
    add_user,
    get_user_by_id,
    update_user,
    delete_user,
)
from asreview.webapp.auth.models import User

# TODO: add flask-smorest for data validation and
#   automatic Swagger UI creation

bp = Blueprint('users', __name__, url_prefix='/users')

# error handlers


@bp.errorhandler(NotFound)
def user_not_found(e, user_id):
    message = f"User {user_id} does not exist"
    logging.error(message)
    return jsonify(message=message), e.status_code


@bp.errorhandler(BadRequest)
def email_already_exists(e):
    message = "Sorry. That email already exists."
    logging.error(message)
    return jsonify(message=message), e.status_code


@bp.errorhandler(InternalServerError)
def error_500(e):
    original = getattr(e, "original_exception", None)

    if original is None or str(e.original_exception) == "":
        # direct 500 error, such as abort(500)
        logging.error(e)
        return jsonify(message="Whoops, something went wrong."), 500

    # wrapped unhandled error
    logging.error(e.original_exception)
    return jsonify(message=str(e.original_exception)), 500

# Views


class UsersList(MethodView):
    def get(self):
        """Returns all users.   """
        return get_all_users(), 200

    def post(self):
        """Creates a new user."""
        post_data = request.get_json()
        username = post_data.get("username")
        email = post_data.get("email")
        password = post_data.get("password")

        try:
            user = get_user_by_email(email)
            if user:
                return email_already_exists()
            add_user(username, email, password)
            response = jsonify(message=f'{email} was added!')
            return response, 201

        except Exception as err:
            logging.error(err)


class Users(MethodView):
    def get(self, user_id):
        """Returns a single user."""
        user = get_user_by_id(user_id)
        if not user:
            return user_not_found()
        return user, 200

    def put(self, user_id):
        """Updates a user."""
        post_data = request.get_json()
        username = post_data.get("username")
        email = post_data.get("email")

        user = get_user_by_id(user_id)
        if not user:
            return user_not_found()

        if get_user_by_email(email):
            return email_already_exists()

        update_user(user, username, email)
        response = jsonify(message=f"{user.id} was updated!")
        return response, 200

    def delete(self, user_id):
        """"Deletes a user."""
        user = get_user_by_id(user_id)

        if not user:
            return user_not_found()

        delete_user(user)

        response = jsonify(message=f"{user.email} was removed!")
        return response, 200


users_list = UsersList.as_view('user_list')
bp.add_url_rule('/users_list/', view_func=users_list, methods=['GET', ])
bp.add_url_rule(
    '/users_list/', defaults={'user_id': None}, view_func=users_list, methods=['POST', ])


users = Users.as_view('users')
bp.add_url_rule('/users/', defaults={'user_id': None},
                view_func=users, methods=['GET', ])
bp.add_url_rule('/users/<int:user_id>', view_func=users,
                methods=['GET', 'PUT', 'DELETE'])
