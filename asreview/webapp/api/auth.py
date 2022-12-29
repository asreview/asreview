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


import datetime as dt
import json
from pathlib import Path
import requests
import smtplib
import ssl

from flask import Blueprint, current_app, jsonify, render_template, request
from flask_cors import CORS
from flask_login import current_user, login_user, logout_user
from flask_mail import Mail, Message
from sqlalchemy import and_, or_
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
        duration=dt.timedelta(days=31)
    )


def send_email(message, receiver_email, sender_email):
    context = ssl.create_default_context()
    config = current_app.get('EMAIL_CONFIG')
    with smtplib.SMTP_SSL(
        config['SERVER'], 
        config['PORT'], 
        context=context) as server:
        
        server.login(config['LOGIN'], config['PASSWORD'])
        result = server.sendmail(
            sender_email,
            receiver_email,
            message.as_string()
        )
        return result


@bp.route('/signin', methods=["POST"])
def signin():
    email = request.form.get('email').strip()
    password = request.form.get('password', '')

    # get the user
    user = User.query.filter(
        or_(User.identifier == email, User.email == email)
    ).one_or_none()

    if not user:
        # user does not exsist
        result = (404, {'message': f'User account {email} does not exist.'})
    elif not user.confirmed:
        # account is not confirmed
        result = (404, {'message': f'User account {email} is not confirmed.'})
    else:
        # user exists and is confirmed: verify password
        if user.verify_password(password):
            logged_in = perform_login_user(user)
            result = (200, {
                'logged_in': logged_in,
                'name': user.get_name(),
                'id': user.id
            })
        else:
            # password is wrong
            if user.origin == 'asreview':
                # if this is an asreview user
                result = (
                    404,
                    {'message': f'Incorrect password for user {email}'}
                )
            else:
                # this must be an OAuth user trying to get in with
                # a password
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
        user = User.query.filter(
            or_(User.identifier == email, User.email == email)
        ).one_or_none()
        # return error if user doesn't exist
        if isinstance(user, User):
            result = (403, f'User with email "{email}" already exists.')
        else:
            # password confirmation is done by front end, so the only
            # thing that remains is to add the user (password will be
            # hashed in the User model)
            try:
                identifier = email
                origin = 'asreview'
                # are we going to verify the email?
                email_verification = bool(
                    current_app.config.get('EMAIL_VERIFICATION', False)
                )
                # set confirmed to False if we 'do' verification. Note
                # that this route only creates 'asreview' accounts
                confirmed = not email_verification
                # create the User account
                user = User(
                    identifier=identifier,
                    origin=origin,
                    email=email, 
                    name=name,
                    affiliation=affiliation,
                    password=password,
                    confirmed=confirmed,
                    public=public
                )
                # if this is an un-confirmed account, set token
                if not confirmed:
                    # set token data
                    user = user.set_token_data(
                        current_app.config['SECRET_KEY'],
                        current_app.config['SECURITY_PASSWORD_SALT']
                    )
                # store user
                DB.session.add(user)
                DB.session.commit()
                # at this stage, if all went well, the User account is
                # stored in the database, send the verification email
                # if applicable
                if email_verification:
                    # create Flask-Mail object
                    mailer = Mail(current_app)
                    # get reply address
                    sender_email = current_app.config.get(
                        'MAIL_REPLY_ADDRESS'
                    )
                    # create url
                    url = f'http://127.0.0.1:3000/confirm_account?' \
                        + f'user_id={user.id}&token={user.token}'
                    # create message
                    msg = Message(
                        subject='This is a test',
                        sender=sender_email,
                        recipients=[user.email]
                    )
                    msg.body = '' # render_template('emails/confirm.txt')
                    msg.html = '' # render_template('emails/confirm.html')
                    # send email
                    # mailer.send(msg)
                # set user_id
                user_id = user.id
                # result is a 201 with message
                result = (201, f'User "#{identifier}" created.')
            except IntegrityError as e:            
                DB.session.rollback()
                result = (
                    403,
                    f'Unable to create your account! Reason: {str(e)}'
                )
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (
                    403,
                    f'Unable to create your account! Reason: {str(e)}'
                )
    else:
        result = (400, 'The app is not configured to create accounts')

    (status, message) = result
    response = jsonify({'message': message, 'user_id': user_id})
    return response, status


@bp.route('/confirm', methods=["GET"])
def confirm():
    """Confirms account with email verification"""
    if current_app.config.get('EMAIL_VERIFICATION', False):
        # find user by token and user id
        user_id = request.args.get('user_id', 0)
        token = request.args.get('token', '')
        
        user = User.query.filter(
            and_(User.id == user_id, User.token == token)
        ).one_or_none()

        if user:
            # get timestamp
            now = dt.datetime.utcnow()
            # get time-difference in hours
            diff = now - user.token_created_at
            [hours, plus_change] = divmod(diff.total_seconds(), 3600)
            # we expect a reaction within 24 hours
            if hours >= 24.0 and plus_change > 0:
                message = 'Can not confirm account, token has expired. ' \
                    + 'Use "forgot password" to obtain a new one.'
                result = (403, message)
            else:
                user = user.confirm_user()
                try:
                    DB.session.commit()
                    result = (200, 'Updated user')
                except SQLAlchemyError as e:
                    DB.session.rollback()
                    result = (
                        403,
                        f'Unable to to confirm user! Reason: {str(e)}'
                    )
        else:
            result = (404, 'No user/token found')
    else:
        result = (400, 'The app is not configured to verify accounts')

    status, message = result
    response = jsonify({'message': message})
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
    response = jsonify({'message': message})
    return response, status


@bp.route('/forgot_password', methods=["POST"])
def forgot_password():

    if current_app.config.get('EMAIL_VERIFICATION', False):
        email = request.form.get('email', '').strip()

        # check if email already exists
        user = User.query.filter(
            or_(User.identifier == email, User.email == email)
        ).one_or_none()

        if not user:
            result = (404, f'User with email "{email}" not found.')
        elif user.origin != 'asreview':
            result = (404, f'Your account has been created with {user.origin}')
        else:
            # set a token
            user = user.set_token_data(
                current_app.config['SECRET_KEY'],
                current_app.config['SECURITY_PASSWORD_SALT']
            )
            try:
                # store data
                DB.session.commit()
                # send an email
                # =============
                result = (200, f'An email has been sent to {email}')
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (403, f'Unable to to confirm user! Reason: {str(e)}')
            
    status, message = result
    response = jsonify({'message': message})
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
def refresh():
    if current_user and isinstance(current_user, User):
        logged_in = current_user.is_authenticated
        name = current_user.get_name()
        id = current_user.id
    else:
        logged_in = False
        name = ''
        id = None

    result = {
        'logged_in': logged_in,
        'name': name,
        'id': id
    }

    response = jsonify(result)
    return response, 200


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
        user = User.query.filter(
            User.identifier == identifier
        ).one_or_none()
        # flag for response (I'd like to communicate if this user was created)
        created_account = False
        # if not create user
        if user is None:
            try:
                origin = provider
                confirmed = True
                public = True
                user = User(
                    identifier=identifier,
                    origin=origin,
                    email=email, 
                    name=name,
                    confirmed=confirmed,
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
