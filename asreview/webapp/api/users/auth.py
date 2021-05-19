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
from flask_restx import Namespace, Resource, fields

from asreview.webapp.api.users.crud import add_user, get_user_by_email, get_user_by_id
from asreview.webapp.api.users.models import User
from asreview.webapp.extensions import bcrypt

# Views


auth_namespace = Namespace("auth")
user = auth_namespace.model(
    "User",
    {
        "username": fields.String(required=True),
        "email": fields.String(required=True),
    },
)
full_user = auth_namespace.clone(
    "Full User", user, {"password": fields.String(required=True)}
)
login = auth_namespace.model(
    "User",
    {
        "email": fields.String(required=True),
        "password": fields.String(required=True),
    },
)

refresh = auth_namespace.model(
    "Refresh", {"refresh_token": fields.String(required=True)}
)

tokens = auth_namespace.clone(
    "Access and refresh_tokens", refresh, {"access_token": fields.String(required=True)}
)
parser = auth_namespace.parser()
parser.add_argument("Authorization", location="headers")


class Register(Resource):
    @auth_namespace.marshal_with(user)
    @auth_namespace.expect(full_user, validate=True)
    @auth_namespace.response(201, "Success")
    @auth_namespace.response(400, "Sorry. That email already exists.")
    def post(self):
        post_data = request.get_json()
        username = post_data.get("username")
        email = post_data.get("email")
        password = post_data.get("password")

        user = get_user_by_email(email)
        if user:
            auth_namespace.abort(400, "Sorry. That email already exists.")

        user = add_user(username, email, password)
        return user, 201


class Login(Resource):
    @auth_namespace.marshal_with(tokens)
    @auth_namespace.expect(login, validate=True)
    @auth_namespace.response(200, "Success")
    @auth_namespace.response(404, "User does not exist")
    def post(self):
        post_data = request.get_json()
        email = post_data.get("email")
        password = post_data.get("password")
        response_object = {}

        user = get_user_by_email(email)
        if not user or not bcrypt.check_password_hash(user.password, password):
            auth_namespace.abort(404, "User does not exist")

        access_token = user.encode_token(user.id, "access")
        refresh_token = user.encode_token(user.id, "refresh")

        response_object = {
            "access_token": access_token.decode(),
            "refresh_token": refresh_token.decode(),
        }
        return response_object, 200


class Refresh(Resource):
    @auth_namespace.marshal_with(tokens)
    @auth_namespace.expect(refresh, validate=True)
    @auth_namespace.response(200, "Success")
    @auth_namespace.response(401, "Invalid token")
    def post(self):
        post_data = request.get_json()
        refresh_token = post_data.get("refresh_token")
        response_object = {}

        try:
            resp = User.decode_token(refresh_token)
            user = get_user_by_id(resp)

            if not user:
                auth_namespace.abort(401, "Invalid token")

            access_token = user.encode_token(user.id, "access")
            refresh_token = user.encode_token(user.id, "refresh")

            response_object = {
                "access_token": access_token.decode(),
                "refresh_token": refresh_token.decode(),
            }
            return response_object, 200
        except jwt.ExpiredSignatureError:
            auth_namespace.abort(401, "Signature expired. Please log in again.")
            return "Signature expired. Please log in again."
        except jwt.InvalidTokenError:
            auth_namespace.abort(401, "Invalid token. Please log in again.")


class Status(Resource):
    @auth_namespace.marshal_with(user)
    @auth_namespace.response(200, "Success")
    @auth_namespace.response(401, "Invalid token")
    @auth_namespace.expect(parser)
    def get(self):
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                access_token = auth_header.split(" ")[1]
                resp = User.decode_token(access_token)
                user = get_user_by_id(resp)
                if not user:
                    auth_namespace.abort(401, "Invalid token")
                return user, 200
            except jwt.ExpiredSignatureError:
                auth_namespace.abort(401, "Signature expired. Please log in again.")
                return "Signature expired. Please log in again."
            except jwt.InvalidTokenError:
                auth_namespace.abort(401, "Invalid token. Please log in again.")
        else:
            auth_namespace.abort(403, "Token required")


auth_namespace.add_resource(Register, "/register")
auth_namespace.add_resource(Login, "/login")
auth_namespace.add_resource(Refresh, "/refresh")
auth_namespace.add_resource(Status, "/status")


#bp = Blueprint('auth', __name__, url_prefix='/auth')

# @bp.errorhandler(BadRequest)
# def email_already_exists(e):
#     message = "Sorry. That email already exists."
#     logging.error(message)
#     return jsonify(message=message), e.status_code
# @bp.errorhandler(NotFound)
# def user_not_found(e):
#     message = "User not found."
#     logging.error(message)
#     return jsonify(message=message), e.status_code
# @bp.errorhandler(Unauthorized)
# def invalid_token(e, message):
#     message = message if message else "Invalid token."
#     logging.error(message)
#     return jsonify(message=message), e.status_code
# @bp.errorhandler(Forbidden)
# def unauthorized(e, message):
#     message = "Token required."
#     logging.error(message)
#     return jsonify(message=message), e.status_code

# class Register(MethodView):
#     def post(self):
#         post_data = request.get_json()
#         username = post_data.get("username")
#         email = post_data.get("email")
#         password = post_data.get("password")

#         user = get_user_by_email(email)
#         if user:
#             return email_already_exists()

#         user = add_user(username, email, password)
#         response = jsonify(user)

#         return response, 201


# class Login(MethodView):
#     def post(self):
#         post_data = request.get_json()
#         email = post_data.get("email")
#         password = post_data.get("password")
#         response_object = {}

#         user = get_user_by_email(email)
#         if not user or not bcrypt.check_password_hash(user.password, password):
#             return user_not_found()

#         access_token = user.encode_token(user.id, "access")
#         refresh_token = user.encode_token(user.id, "refresh")

#         response_object = {
#             "access_token": access_token.decode(),
#             "refresh_token": refresh_token.decode(),
#         }
#         response = jsonify(response_object)
#         return response, 200


# class Refresh(MethodView):
#     def post(self):
#         post_data = request.get_json()
#         refresh_token = post_data.get("refresh_token")
#         response_object = {}

#         try:
#             resp = User.decode_token(refresh_token)
#             user = get_user_by_id(resp)

#             if not user:
#                 return invalid_token()

#             access_token = user.encode_token(user.id, "access")
#             refresh_token = user.encode_token(user.id, "refresh")

#             response_object = {
#                 "access_token": access_token.decode(),
#                 "refresh_token": refresh_token.decode(),
#             }
#             return response_object, 200
#         except jwt.ExpiredSignatureError:
#             return invalid_token(message="Signature expired. Please log in again.")
#         except jwt.InvalidTokenError:
#             return invalid_token(message="Invalid token. Please log in again.")


# class Status(MethodView):
#     def get(self):
#         auth_header = request.headers.get("Authorization")
#         if auth_header:
#             try:
#                 access_token = auth_header.split(" ")[1]
#                 resp = User.decode_token(access_token)
#                 user = get_user_by_id(resp)
#                 if not user:
#                     return invalid_token()
#                 return user, 200
#             except jwt.ExpiredSignatureError:
#                 return invalid_token(message="Signature expired. Please log in again.")
#             except jwt.InvalidTokenError:
#                 return invalid_token(message="Invalid token. Please log in again.")
#         else:
#             return unauthorized()


# register = Register.as_view('register')
# bp.add_url_rule(
#     '/register/', view_func=register, methods=['POST', ])

# login = Register.as_view('login')
# bp.add_url_rule(
#     '/login/', view_func=login, methods=['POST', ])

# refresh = Refresh.as_view('refresh')
# bp.add_url_rule(
#     '/refresh/', view_func=refresh, methods=['POST', ])

# status = Refresh.as_view('status')
# bp.add_url_rule(
#     '/status/', view_func=status, methods=['GET', ])
