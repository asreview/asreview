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


def get_email_footer_config(app):
    """
    Extract email footer configuration from app config.
    Returns a list of footer paragraphs and processed footer data for templates.
    """

    default_footer = {"paragraph_1": "Regards,", "paragraph_2": "The ASReview Team"}

    # Get email_footer section from config
    email_footer_config = app.config.get("EMAIL_FOOTER", default_footer)

    # if no paragraphs are found
    if len(email_footer_config.keys()) == 0:
        email_footer_config = default_footer

    # Extract paragraphs from config (paragraph_1, paragraph_2, etc.)
    paragraphs = []
    for key in sorted(email_footer_config.keys()):
        if key.startswith("paragraph_"):
            paragraphs.append(email_footer_config[key])

    # Create HTML footer
    html_footer = "\n\n".join([f"<p>{paragraph}</p>" for paragraph in paragraphs])

    # Create text footer
    txt_footer = "\n\n".join(paragraphs)

    return {"html_footer": html_footer, "txt_footer": txt_footer}


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

        # get footer configuration
        footer_config = get_email_footer_config(cur_app)

        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(root_path / "templates" / "emails" / "forgot_password.html") as f:
            html_text = render_template_string(
                f.read(),
                name=name,
                token=user.token,
                footer_html=footer_config["html_footer"],
            )
        with open(root_path / "templates" / "emails" / "forgot_password.txt") as f:
            txt_text = render_template_string(
                f.read(),
                name=name,
                token=user.token,
                footer_txt=footer_config["txt_footer"],
            )
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

        # get footer configuration
        footer_config = get_email_footer_config(cur_app)

        # create a mailer
        mailer = Mail(cur_app)
        # open templates as string and render
        root_path = Path(cur_app.root_path)
        with open(root_path / "templates" / "emails" / "confirm_account.html") as f:
            html_text = render_template_string(
                f.read(),
                name=name,
                token=user.token,
                email_type=email_type,
                footer_html=footer_config["html_footer"],
            )
        with open(root_path / "templates" / "emails" / "confirm_account.txt") as f:
            txt_text = render_template_string(
                f.read(),
                name=name,
                token=user.token,
                email_type=email_type,
                footer_txt=footer_config["txt_footer"],
            )
        # create message
        msg = Message("ASReview: please confirm your account", recipients=[user.email])
        msg.body = txt_text
        msg.html = html_text
        return mailer.send(msg)
