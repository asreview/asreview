import datetime as dt
from pathlib import Path

from flask import render_template_string
from flask_login import login_user
from flask_mail import Mail
from flask_mail import Message


def has_email_configuration(app):
    return all(
        [
            app.config.get("MAIL_SERVER", False),
            app.config.get("MAIL_USERNAME", False),
            app.config.get("MAIL_PASSWORD", False),
        ]
    )


def perform_login_user(user, app):
    """Helper function to login a user"""
    return login_user(
        user,
        remember=True,
        duration=dt.timedelta(days=app.config.get("LOGIN_DURATION", 31)),
    )


def send_forgot_password_email(user, cur_app):
    # do not send email in test environment
    if not cur_app.testing:
        # set name
        name = user.name or "ASReview user"
        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(root_path / "templates" / "emails" / "forgot_password.html") as f:
            html_text = render_template_string(f.read(), name=name, token=user.token)
        with open(root_path / "templates" / "emails" / "forgot_password.txt") as f:
            txt_text = render_template_string(f.read(), name=name, token=user.token)
        # create message
        msg = Message("ASReview: forgot password", recipients=[user.email])
        msg.body = txt_text
        msg.html = html_text
        return mailer.send(msg)


def send_confirm_account_email(user, cur_app, email_type="create"):
    # do not send email in test environment
    if not cur_app.testing:
        # get necessary information out of user object
        name = user.name or "ASReview user"
        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(root_path / "templates" / "emails" / "confirm_account.html") as f:
            html_text = render_template_string(
                f.read(), name=name, token=user.token, email_type=email_type
            )
        with open(root_path / "templates" / "emails" / "confirm_account.txt") as f:
            txt_text = render_template_string(
                f.read(), name=name, token=user.token, email_type=email_type
            )
        # create message
        msg = Message("ASReview: please confirm your account", recipients=[user.email])
        msg.body = txt_text
        msg.html = html_text
        return mailer.send(msg)
