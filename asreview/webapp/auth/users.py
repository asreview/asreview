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

from marshmallow import Schema, fields, ValidationError

from asreview.webapp.auth.crud import (  # isort:skip
    get_all_users,
    get_user_by_email,
    add_user,
    get_user_by_id,
    update_user,
    delete_user,
)
from asreview.webapp.auth import models

# TODO: Better data validation and automatic Swagger UI creation: FastAPI?

bp = Blueprint('users', __name__)

# error handlers


class ModelSchema(Schema):
    username = fields.String(required=True)
    email = fields.String(required=True)
    password = fields.String(required=True)


@bp.errorhandler(NotFound)
def user_not_found(user_id):
    message = f"User {user_id} does not exist"
    logging.error(message)
    return jsonify(message=message), 404


@bp.errorhandler(BadRequest)
def email_already_exists():
    message = "Sorry. That email already exists."
    logging.error(message)
    return jsonify(message=message), 400


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

# Users views


@bp.route('/users', methods=["GET"])
def get_users():
    """Returns all users."""
    return get_all_users(), 200


@bp.route('/user/<int:user_id>', methods=["GET"])
def get_user(user_id):
    """Returns a single user."""
    user = get_user_by_id(user_id)
    if not user:
        return user_not_found(user_id)
    return user, 200


@bp.route('/user/create', methods=["POST"])
def create_user():
    """Creates a new user."""
    post_data = request.get_json()
    schema = ModelSchema()
    try:
        schema.load(post_data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    username = post_data.get("username")
    email = post_data.get("email")
    password = post_data.get("password")

    user = get_user_by_email(email)
    if user:
        return email_already_exists()
    add_user(username=username, email=email, password=password)
    response = jsonify(message=f'{email} was added!')
    return response, 201


@bp.route('/user/<int:user_id>/update', methods=["PUT"])
def update_user(user_id):
    """Updates a user."""
    post_data = request.get_json()
    username = post_data.get("username")
    email = post_data.get("email")

    user = get_user_by_id(user_id)
    if not user:
        return user_not_found(user_id)

    if get_user_by_email(email):
        return email_already_exists()

    update_user(user, username, email)
    response = jsonify(message=f"{user.id} was updated!")
    return response, 200


@bp.route('/user/<int:user_id>/delete', methods=["DELETE"])
def delete_user(user_id):
    """"Deletes a user."""
    user = get_user_by_id(user_id)

    if not user:
        return user_not_found(user_id)

    delete_user(user)

    response = jsonify(message=f"{user.email} was removed!")
    return response, 200


# users = Users.as_view('user_list')
# bp.add_url_rule('/users', view_func=users, methods=['GET', ])

# user = User.as_view('user')
# bp.add_url_rule('/user', defaults={'user_id': None},
#                 view_func=user, methods=['GET'])
# bp.add_url_rule('/user/<int:user_id>', view_func=user,
#                 methods=['GET', 'PUT', 'DELETE'])
# bp.add_url_rule(
#     '/user/', view_func=user, methods=['POST'])
