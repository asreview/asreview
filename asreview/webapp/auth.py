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
import json
from pathlib import Path
import requests

from flask import Blueprint, current_app, jsonify, request
from flask_cors import CORS
from flask_login import current_user, login_user, logout_user
from sqlalchemy.exc import SQLAlchemyError

from asreview.webapp import DB
from asreview.webapp.authentication.login_required import \
    asreview_login_required
from asreview.webapp.authentication.models import User

bp = Blueprint('auth', __name__, url_prefix='/auth')
CORS(
    bp,
    resources={r"*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)


@bp.route('/signin', methods=["POST"])
def signin():
    email = request.form.get('email').strip()
    password = request.form.get('password')

    # get the user
    user = User.query.filter(User.email == email).one_or_none()
    # if the user exist proceed and verify
    if not user:
        result = (404, {'message': f'User account {email} does not exist.'})
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
                'name': user.get_full_name(),
                'id': user.id
            })
        else:
            # password is wrong
            result = (
                404,
                {'message': f'Incorrect password for user {email}'}
            )

    status, message = result
    response = jsonify(message)
    return response, status


@bp.route('/signup', methods=["POST"])
def signup():
    email = request.form.get('email', '').strip()
    password = request.form.get('password')
    first_name = request.form.get('first_name', '').strip()
    last_name = request.form.get('last_name', '').strip()
    affiliation = request.form.get('affiliation', '').strip()
    public = bool(int(request.form.get('public', '0')))

    # check if email already exists
    user = User.query.filter(User.email == email).one_or_none()
    # return error if user doesn't exist
    if isinstance(user, User):
        result = (404, f'User with email "{email}" already exists.')
    else:
        # password confirmation is done by front end, so the only
        # thing that remains is to add the user (password will be
        # hashed in the User model)
        try:
            user = User(email, password, first_name, last_name,
                affiliation, public)
            DB.session.add(user)
            DB.session.commit()
            # result is a 201 with message
            result = (201, f'User "#{email}" created.')
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
            'name': current_user.get_full_name(),
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
        email = current_user.email
        logout_user()
        result = (200, f'User with email {email} has been signed out')
    else:
        result = (404, 'No user found, no one can be signed out')

    status, message = result
    response = jsonify({'message': message})
    return response, status

@bp.route('/oauth_callback', methods=["POST"])
def oauth_callback():
    # get parameters
    client_id = request.form.get('client_id', '').strip()
    code = request.form.get('code', '').strip()
    provider_name = request.form.get('provider', '').strip()
    redirect_uri = request.form.get('redirect_uri', '').strip()

    # find this service in env parameters
    providers = current_app.config.get('OAUTH', [])
    provider = [p for p in providers if p['PROVIDER'] == provider_name][0]

    # We have a code, now let's get a token:
    # what is the endpoint to get this token
    token_url = provider['TOKEN_URL']

    # send request to token URL
    if provider_name == 'Orcid':
        # get token
        response = requests.post(
            provider['TOKEN_URL'], 
            data={
                'code': code,
                'client_id': client_id,
                'client_secret': provider['CLIENT_SECRET'],
                'grant_type': 'authorization_code'
            },
            headers={'Accept': 'application/json'}
        )
        print('Orcid response: ', response.json())

    elif provider_name == 'GitHub':
        
        response = requests.post(
            provider['TOKEN_URL'], 
            data={
                'code': code,
                'client_id': client_id,
                'client_secret': provider['CLIENT_SECRET'],
            },
            headers={'Accept': 'application/json'}
        )
        print('GitHub response: ', response.json())

        # get token from service response
        token = response.json()['access_token']
        # get a user profile
        response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {token}',
                'Accept': 'application/json'
            }
        )
        print('-----', response.json())        



    result = (200, { 'data': 'hello' })

    status, message = result
    response = jsonify(message)
    return response, status
