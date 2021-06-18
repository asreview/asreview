# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

import datetime
import os

import jwt
from flask import current_app as app
from sqlalchemy.sql import func

from asreview.webapp.extensions import db
from asreview.webapp.extensions import bcrypt


class User(db.Model):
    """User class."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    active = db.Column(db.Boolean(), default=True, nullable=False)
    created_date = db.Column(db.DateTime, default=func.now(), nullable=False)

    def __init__(self, username="", email="", password=""):
        self.username = username
        self.email = email
        self.password = bcrypt.generate_password_hash(
            password, app.config.get("BCRYPT_LOG_ROUNDS")
        ).decode()

    def encode_token(self, user_id, token_type):
        """Encode token with JWT.

        Arguments
        ---------
        user_id: int
            The ID of the user for which the token is encoded.
        token_type: string
            The type of Token generation requested. If "access" the token
            will be created from scratch, otherwise the token is refreshed.

        Returns
        -------
        JWT token
            JWT token: encoded with app's secret key and HS256.
        """
        if token_type == "access":
            seconds = app.config.get("ACCESS_TOKEN_EXPIRATION")
        else:
            seconds = app.config.get("REFRESH_TOKEN_EXPIRATION")

        payload = {
            "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=seconds),
            "iat": datetime.datetime.utcnow(),
            "sub": user_id,
        }
        return jwt.encode(
            payload,
            app.config.get("SECRET_KEY"),
            algorithm="HS256"
        )

    @staticmethod
    def decode_token(token):
        """Decode token with JWT to verify it."""
        payload = jwt.decode(
            token,
            app.config.get("SECRET_KEY"),
            algorithms="HS256"
        )
        return payload["sub"]


if os.getenv("FLASK_ENV") == "development":
    from asreview.webapp.extensions import admin
    from asreview.webapp.api.users.admin import UsersAdminView

    admin.add_view(UsersAdminView(User, db.session))
