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
from pathlib import Path

from flask import Blueprint
from flask import current_app
from flask import jsonify
from flask import render_template_string
from flask import request
from flask_login import current_user
from flask_login import login_required
from flask_login import login_user
from flask_login import logout_user
from flask_mail import Mail
from flask_mail import Message
from sqlalchemy import and_
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.exc import SQLAlchemyError

from asreview.webapp import DB
from asreview.webapp.authentication.models import User
from asreview.webapp.authentication.oauth_handler import OAuthHandler

bp = Blueprint("auth", __name__, url_prefix="/auth")


def _has_email_configuration(app):
    return all([
        app.config.get("MAIL_SERVER", False),
        app.config.get("MAIL_USERNAME", False),
        app.config.get("MAIL_PASSWORD", False)
    ])


def perform_login_user(user):
    """Helper function to login a user"""
    return login_user(user, remember=True, duration=dt.timedelta(days=31))


# TODO: not sure if this file is the right place for this function
def send_forgot_password_email(user, request, cur_app):
    # do not send email in test environment
    if not cur_app.testing:
        # get necessary information out of user object
        name = user.name or "ASReview user"
        # get url of front-end
        root_url = request.headers.get("Origin")
        # create url that will be used in the email
        url = f"{root_url}/reset_password?user_id={user.id}&token={user.token}"
        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(
            root_path / "templates" / "emails" / "forgot_password.html", "r"
        ) as f:
            html_text = render_template_string(f.read(), name=name, url=url)
        with open(root_path / "templates" / "emails" / "forgot_password.txt", "r") as f:
            txt_text = render_template_string(f.read(), name=name, url=url)
        # create message
        msg = Message(
            "ASReview: forgot password",
            recipients=[user.email]
        )
        msg.body = txt_text
        msg.html = html_text
        return mailer.send(msg)


# TODO: not sure if this file is the right place for this function
def send_confirm_account_email(user, request, cur_app):
    # do not send email in test environment
    if not cur_app.testing:
        # get necessary information out of user object
        name = user.name or "ASReview user"
        # get url of front-end
        root_url = request.headers.get("Origin")
        # create url that will be used in the email
        url = f"{root_url}/confirm_account?user_id={user.id}&token={user.token}"
        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(
            root_path / "templates" / "emails" / "confirm_account.html", "r"
        ) as f:
            html_text = render_template_string(f.read(), name=name, url=url)
        with open(root_path / "templates" / "emails" / "confirm_account.txt", "r") as f:
            txt_text = render_template_string(f.read(), name=name, url=url)
        # create message
        msg = Message(
            "ASReview: please confirm your account",
            recipients=[user.email]
        )
        msg.body = txt_text
        msg.html = html_text
        return mailer.send(msg)


# ------------------
#      ROUTES
# ------------------


@bp.route("/signin", methods=["POST"])
def signin():
    email = request.form.get("email").strip()
    password = request.form.get("password", "")

    # get the user
    user = User.query.filter(
        or_(User.identifier == email, User.email == email)
    ).one_or_none()

    if not user:
        # user does not exsist
        result = (404, {"message": f"User account {email} does not exist."})
    elif not user.confirmed:
        # account is not confirmed
        result = (404, {"message": f"User account {email} is not confirmed."})
    else:
        # user exists and is confirmed: verify password
        if user.verify_password(password):
            if perform_login_user(user):
                result = (
                    200,
                    {
                        "logged_in": True,
                        "name": user.get_name(),
                        "id": user.id,
                        "message": f"User {user.identifier} is logged in."
                    },
                )
            else:
                result = (
                    404,
                    {"message": "Unable to login user with verified password."}
                )
        else:
            # password is wrong
            if user.origin == "asreview":
                # if this is an asreview user
                result = (404, {"message": f"Incorrect password for user {email}."})
            else:
                # this must be an OAuth user trying to get in with
                # a password
                service = user.origin.capitalize()
                result = (404, {"message": f"Please login with the {service} service."})

    status, message = result
    response = jsonify(message)
    return response, status


@bp.route("/signup", methods=["POST"])
def signup():
    # Can we create accounts?
    if current_app.config.get("ALLOW_ACCOUNT_CREATION", False):
        email = request.form.get("email", "").strip()
        name = request.form.get("name", "").strip()
        affiliation = request.form.get("affiliation", "").strip()
        password = request.form.get("password")
        public = bool(int(request.form.get("public", "1")))

        # check if email already exists
        user = User.query.filter(
            or_(User.identifier == email, User.email == email)
        ).one_or_none()
        # return error if user doesn't exist
        if isinstance(user, User):
            result = (403, f'User with email "{email}" already exists.')
        else:
            try:
                identifier = email
                origin = "asreview"
                # are we going to verify the email?
                email_verification = bool(
                    current_app.config.get("EMAIL_VERIFICATION", False)
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
                    public=public,
                )
                # if this is an un-confirmed account, set token
                if not confirmed:
                    # set token data
                    user = user.set_token_data(
                        current_app.config["SECRET_KEY"],
                        current_app.config["SECURITY_PASSWORD_SALT"],
                    )
                # store user
                DB.session.add(user)
                DB.session.commit()
                # at this stage, if all went well, the User account is
                # stored in the database, send the verification email
                # if applicable
                if email_verification:
                    # send email
                    send_confirm_account_email(user, request, current_app)
                    # result
                    result = (
                        201,
                        f"An email has been sent to {user.email} to verify "
                        + "your account. Please follow instructions.",
                    )
                else:
                    # result is a 201 with message
                    result = (201, f'User "{identifier}" created.')
            except ValueError as e:
                result = (400, f"Unable to create your account! Reason: {str(e)}")
            except IntegrityError as e:
                DB.session.rollback()
                result = (403, f"Unable to create your account! Reason: {str(e)}")
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (403, f"Unable to create your account! Reason: {str(e)}")
    else:
        result = (400, "The app is not configured to create accounts")

    (status, message) = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/confirm_account", methods=["POST"])
def confirm_account():
    """Confirms account with email verification"""

    if current_app.config.get("EMAIL_VERIFICATION", False):
        # find user by token and user id
        user_id = request.form.get("user_id", 0)
        token = request.form.get("token", "")

        user = User.query.filter(
            and_(User.id == user_id, User.token == token)
        ).one_or_none()

        if not user:
            result = (404, "No user account / correct token found.")
        elif not user.token_valid(token, max_hours=24):
            message = (
                "Can not confirm account, token has expired. "
                + 'Use "forgot password" to obtain a new one.'
            )
            result = (403, message)
        else:
            user = user.confirm_user()
            try:
                DB.session.commit()
                result = (200, f"User {user.identifier} confirmed.")
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (
                    403,
                    f"Unable to to confirm user {user.identifier}! Reason: {str(e)}"
                )
    else:
        result = (400, "The app is not configured to verify accounts.")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/get_profile", methods=["GET"])
@login_required
def get_profile():
    user = User.query.filter(User.id == current_user.id).one_or_none()
    if user:
        result = (
            200,
            {
                "identifier": user.identifier,
                "email": user.email,
                "origin": user.origin,
                "name": user.name,
                "affiliation": user.affiliation,
                "public": user.public,
            },
        )
    else:
        result = (404, "No user found.")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    if _has_email_configuration(current_app):
        # get email address from request
        email_address = request.form.get("email", "").strip()

        # check if email already exists
        user = User.query.filter(
            or_(User.identifier == email_address, User.email == email_address)
        ).one_or_none()

        if not user:
            result = (404, f'User with email "{email_address}" not found.')
        elif user.origin != "asreview":
            result = (404, f"Your account has been created with {user.origin}.")
        else:
            # set a token
            user = user.set_token_data(
                current_app.config["SECRET_KEY"],
                current_app.config["SECURITY_PASSWORD_SALT"],
            )
            try:
                # store data
                DB.session.commit()
                # send email
                send_forgot_password_email(user, request, current_app)
                # result
                result = (200, f"An email has been sent to {email_address}")

            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (403, f"Unable to to confirm user! Reason: {str(e)}")
    else:
        result = (404, "Forgot-password feature is not used in this app.")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/reset_password", methods=["POST"])
def reset_password():
    """Resests password of user"""
    if _has_email_configuration(current_app):

        new_password = request.form.get("password", "").strip()
        token = request.form.get("token", "").strip()
        user_id = request.form.get("user_id", "0").strip()
        user = User.query.filter(User.id == user_id).one_or_none()

        if not user:
            result = (
                404,
                "User not found, try restarting the forgot-password procedure."
            )
        elif not user.token_valid(token, max_hours=24):
            result = (
                404,
                "Token is invalid or too old, restart the forgot-password procedure."
            )
        else:
            try:
                user = user.reset_password(new_password)
                DB.session.commit()
                result = (200, "Password updated.")
            except ValueError as e:
                DB.session.rollback()
                result = (500, f"Unable to reset your password! Reason: {str(e)}")
            except SQLAlchemyError as e:
                DB.session.rollback()
                result = (500, f"Unable to reset your password! Reason: {str(e)}")
    else:
        result = (404, "Reset-password feature is not used in this app.")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/update_profile", methods=["POST"])
@login_required
def update_profile():
    """Update user profile"""
    user = User.query.filter(User.id == current_user.id).one_or_none()
    if user:
        email = request.form.get("email", "").strip()
        name = request.form.get("name", "").strip()
        affiliation = request.form.get("affiliation", "").strip()
        old_password = request.form.get("old_password", None)
        new_password = request.form.get("new_password", None)
        public = bool(int(request.form.get("public", "1")))

        try:
            user = user.update_profile(email, name, affiliation,
                                       old_password, new_password, public)
            DB.session.commit()
            result = (200, "User profile updated.")
        except ValueError as e:
            result = (400, f"Unable to update your profile! Reason: {str(e)}")
        except IntegrityError as e:
            DB.session.rollback()
            result = (500, f"Unable to update your profile! Reason: {str(e)}")
        except SQLAlchemyError as e:
            DB.session.rollback()
            result = (500, f"Unable to update your profile! Reason: {str(e)}")

    else:
        result = (404, "No user found")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/refresh", methods=["GET"])
def refresh():
    if current_user and isinstance(current_user, User):
        logged_in = current_user.is_authenticated
        name = current_user.get_name()
        id = current_user.id
    else:
        logged_in = False
        name = ""
        id = None

    result = {"logged_in": logged_in, "name": name, "id": id}

    response = jsonify(result)
    return response, 200


@bp.route("/signout", methods=["DELETE"])
@login_required
def signout():
    if current_user:
        identifier = current_user.identifier
        logout_user()
        result = (200, f"User with identifier {identifier} has been signed out.")
    else:
        result = (404, "No user found, no one can be signed out.")

    status, message = result
    response = jsonify({"message": message})
    return response, status


@bp.route("/oauth_callback", methods=["POST"])
def oauth_callback():
    # get parameters
    code = request.form.get("code", "").strip()
    provider = request.form.get("provider", "").strip()
    redirect_uri = request.form.get("redirect_uri", "").strip()

    # assuming we have this provider
    oauth_handler = current_app.config.get("OAUTH", False)
    if (
        isinstance(oauth_handler, OAuthHandler)
        and provider in oauth_handler.providers()
    ):
        # get user credentials for this user
        (identifier, email, name) = oauth_handler.get_user_credentials(
            provider, code, redirect_uri
        )
        # make sure identifier is a string
        identifier = str(identifier)
        # try to find this user
        user = User.query.filter(User.identifier == identifier).one_or_none()
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
                    public=public,
                )
                DB.session.add(user)
                DB.session.commit()
                created_account = True
            except IntegrityError:
                DB.session.rollback()
                message = "OAuth: integrity error, verify if you " + \
                    "already have created an account!"
                # return this immediately
                return jsonify({"message": message}), 409
            except SQLAlchemyError:
                DB.session.rollback()
                message = "OAuth: unable to create your account!"
                # return this immediately
                return jsonify({"message": message}), 409

        # log in the existing/created user immediately
        logged_in = perform_login_user(user)
        result = (
            200,
            {
                "account_created": created_account,
                "logged_in": logged_in,
                "name": user.get_name(),
                "id": user.id,
            },
        )
    else:
        result = (400, {"message": f"OAuth provider {provider} could not be found"})

    status, message = result
    response = jsonify(message)
    return response, status
