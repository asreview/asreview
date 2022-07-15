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


import datetime
from pathlib import Path

from flask import Blueprint
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_login import current_user, login_user, logout_user
from sqlalchemy.exc import SQLAlchemyError

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.login_required import asreview_login_required
from asreview.webapp.authentication.models import User

bp = Blueprint('auth', __name__, url_prefix='/auth')
CORS(
    bp,
    resources={r"*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)


@bp.route('/signin', methods=["POST"])
def signin():
    username = request.form.get('username').strip()
    password = request.form.get('password')

    # check if username already exists
    user = User.query.filter(User.username == username).one_or_none()
    # if the user exist proceed and verify
    if not user:
        result = (404, {'message': f'User account {username} does not exist.'})
    else:
        # verify password
        if user.verify_password(password):
            logged_in = login_user(
                user,
                remember=True,
                duration=datetime.timedelta(days=31)
            )
            result = (200, {
                'logged_in': logged_in,
                'username': username,
                'id': user.id
            })
        else:
            # password is wrong
            result = (
                404,
                {'message': f'Incorrect password for user {username}'}
            )

    status, message = result
    # check in database if username exists and if password is correct
    response = jsonify(message)
    return response, status


@bp.route('/signup', methods=["POST"])
def signup():
    username = request.form.get('username').strip()
    password = request.form.get('password')

    # check if username already exists
    user = User.query.filter(User.username == username).one_or_none()
    # return error if user doesn't exist
    if isinstance(user, User):
        result = (404, f'Username "{username}" already exists.')
    else:
        # password confirmation is done by front end, so the only
        # thing that remains is to add the user (password will be
        # hashed in the User model)
        try:
            user = User(username, password)
            DB.session.add(user)
            DB.session.commit()
            # at this stage we know the user account is stored,
            # let's add a working directory for this user
            Path(asreview_path(), str(user.id)).mkdir(exist_ok=True)
            # result is a 201 with message
            result = (201, f'User "#{username}" created.')
        except SQLAlchemyError:
            DB.session.rollback()
            result = (500, 'Creating account unsuccessful!')

    (status, message) = result
    response = jsonify({'message': message, 'user_id': user.id})
    return response, status


@bp.route('/refresh', methods=["GET"])
@asreview_login_required
def refresh():
    if current_user:
        result = (200, {
            'logged_in': current_user.is_authenticated,
            'username': current_user.username,
            'id': current_user.id
        })
    else:
        result = (404, 'No user found')

    status, message = result
    response = jsonify(message)
    return response, status


@bp.route('/signout', methods=["DELETE"])
@asreview_login_required
def signout():
    if current_user:
        username = current_user.username
        logout_user()
        result = (200, f'User {username} has been signed out')
    else:
        result = (404, 'No user found, no one can be signed out')

    status, message = result
    response = jsonify({'message': message})
    return response, status
