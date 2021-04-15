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

import jwt
from flask import Blueprint
from flask import request
from flask import jsonify
from flask.views import MethodView
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized, Forbidden

from asreview.webapp.auth.crud import add_user, get_user_by_email, get_user_by_id
from asreview.webapp.auth.models import User
from asreview.webapp.extensions import bcrypt

bp = Blueprint('auth', __name__, url_prefix='/auth')

# error handlers


@bp.errorhandler(BadRequest)
def email_already_exists(e):
    message = "Sorry. That email already exists."
    logging.error(message)
    return jsonify(message=message), e.status_code


@bp.errorhandler(NotFound)
def user_not_found(e):
    message = "User not found."
    logging.error(message)
    return jsonify(message=message), e.status_code


@bp.errorhandler(Unauthorized)
def invalid_token(e, message):
    message = message if message else "Invalid token."
    logging.error(message)
    return jsonify(message=message), e.status_code


@bp.errorhandler(Forbidden)
def unauthorized(e, message):
    message = "Token required."
    logging.error(message)
    return jsonify(message=message), e.status_code

# Views


class Register(MethodView):
    def post(self):
        post_data = request.get_json()
        username = post_data.get("username")
        email = post_data.get("email")
        password = post_data.get("password")

        user = get_user_by_email(email)
        if user:
            return email_already_exists()

        user = add_user(username, email, password)
        response = jsonify(user)

        return response, 201


class Login(MethodView):
    def post(self):
        post_data = request.get_json()
        email = post_data.get("email")
        password = post_data.get("password")
        response_object = {}

        user = get_user_by_email(email)
        if not user or not bcrypt.check_password_hash(user.password, password):
            return user_not_found()

        access_token = user.encode_token(user.id, "access")
        refresh_token = user.encode_token(user.id, "refresh")

        response_object = {
            "access_token": access_token.decode(),
            "refresh_token": refresh_token.decode(),
        }
        response = jsonify(response_object)
        return response, 200


class Refresh(MethodView):
    def post(self):
        post_data = request.get_json()
        refresh_token = post_data.get("refresh_token")
        response_object = {}

        try:
            resp = User.decode_token(refresh_token)
            user = get_user_by_id(resp)

            if not user:
                return invalid_token()

            access_token = user.encode_token(user.id, "access")
            refresh_token = user.encode_token(user.id, "refresh")

            response_object = {
                "access_token": access_token.decode(),
                "refresh_token": refresh_token.decode(),
            }
            return response_object, 200
        except jwt.ExpiredSignatureError:
            return invalid_token(message="Signature expired. Please log in again.")
        except jwt.InvalidTokenError:
            return invalid_token(message="Invalid token. Please log in again.")


class Status(MethodView):
    def get(self):
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                access_token = auth_header.split(" ")[1]
                resp = User.decode_token(access_token)
                user = get_user_by_id(resp)
                if not user:
                    return invalid_token()
                return user, 200
            except jwt.ExpiredSignatureError:
                return invalid_token(message="Signature expired. Please log in again.")
            except jwt.InvalidTokenError:
                return invalid_token(message="Invalid token. Please log in again.")
        else:
            return unauthorized()


register = Register.as_view('register')
bp.add_url_rule(
    '/register/', view_func=register, methods=['POST', ])

login = Register.as_view('login')
bp.add_url_rule(
    '/login/', view_func=login, methods=['POST', ])

refresh = Refresh.as_view('refresh')
bp.add_url_rule(
    '/refresh/', view_func=refresh, methods=['POST', ])

status = Refresh.as_view('status')
bp.add_url_rule(
    '/status/', view_func=status, methods=['GET', ])
