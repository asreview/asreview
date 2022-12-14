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
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from asreview.webapp import DB
from asreview.webapp.authentication.login_required import \
    asreview_login_required
from asreview.webapp.authentication.models import User
from asreview.webapp.authentication.oauth_handler import OAuthHandler

bp = Blueprint('auth', __name__, url_prefix='/auth')
CORS(
    bp,
    resources={r"*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]}},
    supports_credentials=True,
)


def perform_login_user(user):
    """Helper function to login a user"""            
    return login_user(
        user,
        remember=True,
        duration=datetime.timedelta(days=31)
    )


@bp.route('/signin', methods=["POST"])
def signin():
    email = request.form.get('email').strip()
    password = request.form.get('password', '')

    # get the user
    user = User.query.filter(
        User.identifier == email or User.email == email
    ).one_or_none()

    # if the user exist proceed and verify
    if not user:
        result = (404, {'message': f'User account {email} does not exist.'})
    else:
        # verify password
        if user.verify_password(password):
            logged_in = perform_login_user(user)
            result = (200, {
                'logged_in': logged_in,
                'name': user.get_name(),
                'id': user.id
            })
        else:
            # password is wrong
            if user.origin == 'system':
                result = (
                    404,
                    {'message': f'Incorrect password for user {email}'}
                )
            else:
                service = user.origin.capitalize()
                result = (
                    404,
                    {'message': 
                        f'Please login with the {service} service'}
                )

    status, message = result
    response = jsonify(message)
    return response, status


@bp.route('/signup', methods=["POST"])
def signup():
    # this is for the response
    user_id = False

    # Can we create accounts?
    if current_app.config.get('ALLOW_ACCOUNT_CREATION', False):
        email = request.form.get('email', '').strip()
        name = request.form.get('name', '').strip()
        affiliation = request.form.get('affiliation', '').strip()
        password = request.form.get('password')
        public = bool(int(request.form.get('public', '1')))

        # check if email already exists
        user = User.query.filter(User.identifier == email).one_or_none()
        # return error if user doesn't exist
        if isinstance(user, User):
            result = (404, f'User with email "{email}" already exists.')
        else:
            # password confirmation is done by front end, so the only
            # thing that remains is to add the user (password will be
            # hashed in the User model)
            try:
                identifier = email
                origin = 'system'
                # set verified to False if EMAIL_VERIFICATION has
                # paramaters (expect SMPT config)
                verified = not bool(current_app.config.get(
                    'EMAIL_VERIFICATION', False))
                user = User(
                    identifier=identifier,
                    origin=origin,
                    email=email, 
                    name=name,
                    affiliation=affiliation,
                    password=password,
                    verified=verified,
                    public=public
                )
                DB.session.add(user)
                DB.session.commit()
                # set user_id
                user_id = user.id
                # result is a 201 with message
                result = (201, f'User "#{identifier}" created.')
            except IntegrityError as e:            
                DB.session.rollback()
                result = (
                    500,
                    f'Unable to create your account! Reason: {str(e)}'
                )
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (
                    500,
                    f'Unable to create your account! Reason: {str(e)}'
                )
    else:
        result = (400, 'The app is not configured to create accounts')

    (status, message) = result
    response = jsonify({'message': message, 'user_id': user_id})
    return response, status


@bp.route('/get_profile', methods=["GET"])
@asreview_login_required
def get_profile():

    user = User.query.get(current_user.id)
    if user:
        result = (200, {
            'email': user.email,
            'origin': user.origin,
            'name': user.name,
            'affiliation': user.affiliation,
            'public': user.public
        })
    else:
        result = (404, 'No user found')

    status, message = result
    response = jsonify(message)
    return response, status


@bp.route('/update_profile', methods=["POST"])
@asreview_login_required
def update_profile():

    user = User.query.get(current_user.id)
    if user:
        email = request.form.get('email', '').strip()
        name = request.form.get('name', '').strip()
        affiliation = request.form.get('affiliation', '').strip()
        password = request.form.get('password', None)
        public = bool(int(request.form.get('public', '1')))

        try:
            user = user.update_profile(
                email,
                name,
                affiliation,
                password,
                public
            )
            DB.session.commit()
            result = (200, 'User profile updated')
        except IntegrityError as e:          
            DB.session.rollback()
            result = (
                500,
                f'Unable to update your profile! Reason: {str(e)}'
            )
        except SQLAlchemyError as e:
            DB.session.rollback()
            result = (
                500, 
                f'Unable to update your profile! Reason: {str(e)}'
            )

    else:
        result = (404, 'No user found')

    status, message = result
    response = jsonify({'message': message})
    return response, status


@bp.route('/refresh', methods=["GET"])
@asreview_login_required
def refresh():
    if current_user:
        result = (200, {
            'logged_in': current_user.is_authenticated,
            'name': current_user.get_name(),
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
        identifier = current_user.identifier
        logout_user()
        result = (200, f'User with identifier {identifier} has been signed out')
    else:
        result = (404, 'No user found, no one can be signed out')

    status, message = result
    response = jsonify({'message': message})
    return response, status


@bp.route('/oauth_callback', methods=["POST"])
def oauth_callback():
    # get parameters
    code = request.form.get('code', '').strip()
    provider = request.form.get('provider', '').strip()
    redirect_uri = request.form.get('redirect_uri', '').strip()

    # assuming we have this provider
    oauth_handler = current_app.config.get('OAUTH', False)
    if isinstance(oauth_handler, OAuthHandler) and \
        provider in oauth_handler.providers():
        # get user credentials for this user
        response = oauth_handler.get_user_credentials(
            provider, 
            code, 
            redirect_uri
        )
        (identifier, email, name) = response
        # try to find this user
        user = User.query.filter(User.identifier == identifier).one_or_none()
        # flag for response (I'd like to communicate if this user was created)
        created_account = False
        # if not create user
        if user is None:
            try:
                origin = provider
                verified = True
                public = True
                user = User(
                    identifier=identifier,
                    origin=origin,
                    email=email, 
                    name=name,
                    verified=verified,
                    public=public
                )
                DB.session.add(user)
                DB.session.commit()
                created_account = True
            except SQLAlchemyError:
                DB.session.rollback()
                message = 'OAuth: unable to create your account!'
                # return this immediately
                return jsonify({'data': message}), 500
        
        # log in this user
        if bool(user):
            logged_in = perform_login_user(user)
            result = (200, {
                'account_created': created_account,
                'logged_in': logged_in,
                'name': user.get_name(),
                'id': user.id
            })
    else:
        result = (400, 
            { 'data': f'OAuth provider {provider} could not be found' })

    status, message = result
    response = jsonify(message)
    return response, status
