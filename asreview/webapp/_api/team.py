import base64
import hashlib
import hmac

from flask import Blueprint
from flask import current_app
from flask import jsonify
from flask import request
from flask_login import current_user
from sqlalchemy.exc import SQLAlchemyError

import asreview as asr
from asreview.webapp import DB
from asreview.webapp._authentication.decorators import login_required
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User
from asreview.webapp.utils import get_project_path

bp = Blueprint("team", __name__, url_prefix="/api")

REQUESTER_FRAUD = {"message": "Request can not made by current user."}


def validate_invitation_token(encoded_token):
    """
    Validate and decode an invitation token.

    Returns tuple of (project, error_response).
    If validation succeeds, returns (project, None).
    If validation fails, returns (None, (json_response, status_code)).
    """
    if not encoded_token:
        return None, (jsonify({"message": "No invitation token provided."}), 400)

    try:
        # Decode the base64-encoded token
        decoded = base64.urlsafe_b64decode(encoded_token.encode("utf-8"))

        # Split payload and signature based on position
        # SHA256 signature is always 32 bytes at the end, preceded by a 1-byte separator
        if len(decoded) < 34:  # At least 1 byte payload + separator + 32 byte signature
            return None, (
                jsonify({"message": "Token is not valid."}),
                400,
            )

        signature = decoded[-32:]
        separator = decoded[-33:-32]
        payload_bytes = decoded[:-33]

        # Verify separator is a dot
        if separator != b".":
            return None, (
                jsonify({"message": "Token is not valid."}),
                400,
            )

        # Verify HMAC signature
        secret_key = current_app.config.get("SECRET_KEY", "").encode("utf-8")
        expected_signature = hmac.new(
            secret_key, payload_bytes, hashlib.sha256
        ).digest()

        if not hmac.compare_digest(signature, expected_signature):
            return None, (
                jsonify({"message": "Token is not valid."}),
                400,
            )

        # Extract project_id and token from payload
        payload = payload_bytes.decode("utf-8")
        if ":" not in payload:
            return None, (
                jsonify({"message": "Token is not valid."}),
                400,
            )

        project_id, token = payload.split(":", 1)

        # Find the project
        project = Project.query.filter(Project.project_id == project_id).one_or_none()

        if not project:
            return None, (jsonify({"message": "Project not found."}), 404)

        # Verify the token matches the project's token
        if not project.token or project.token != token:
            return None, (
                jsonify({"message": "This invitation link is not valid."}),
                400,
            )

        return project, None

    except (ValueError, base64.binascii.Error):
        return None, (jsonify({"message": "Token is not valid."}), 400)
    except Exception as e:
        return None, (jsonify({"message": f"Error: {str(e)}"}), 500)


def get_user_project_properties(user, project, current_user):
    """Retrieve user properties in relation to a project and current user."""
    result = user.summarize()

    owner = user.id == project.owner_id
    member = user in project.collaborators or owner
    me = user.id == current_user.id

    deletable = (
        (current_user.id == project.owner_id or current_user.is_admin)
        and member
        and not me
    )

    return dict(
        result,
        me=me,
        owner=owner,
        member=member,
        deletable=deletable,
    )


@bp.route("/projects/<project_id>/users", methods=["GET"])
@login_required
def users(project_id):
    """Returns users involved in a project (owner and members)."""
    project = Project.query.filter(Project.project_id == project_id).one_or_none()

    # Deny if user is member and this person is not somehow involved in the project
    if (
        current_user.is_member
        and project not in current_user.projects
        and project not in current_user.involved_in
    ):
        return jsonify(REQUESTER_FRAUD), 404

    # Get only users involved in the project
    involved_users = set()

    # Add project owner
    if project.owner:
        involved_users.add(project.owner)

    # Add collaborators (members)
    involved_users.update(project.collaborators)

    users = sorted(
        [
            get_user_project_properties(user, project, current_user)
            for user in involved_users
        ],
        key=lambda u: (-u["owner"], u["name"].lower()),
    )

    return (
        jsonify(users),
        200,
    )


@bp.route("/projects/<project_id>/users/<user_id>", methods=["DELETE"])
@login_required
def end_collaboration(project_id, user_id):
    """Project owner or admin removes a collaborator, or collaborator
    removes him/herself."""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()

    # check if project is owned by current user, if the user is
    # involved in the project, or if current user is admin
    if project and (
        (project.owner == current_user)
        or (project in current_user.involved_in)
        or current_user.is_admin
    ):
        user = DB.session.get(User, user_id)

        if not user:
            return jsonify({"message": "User not found."}), 404

        # Prevent removing project owner
        if user.id == project.owner_id:
            return jsonify({"message": "Cannot remove project owner."}), 400

        try:
            if user in project.collaborators:
                project.collaborators.remove(user)
                DB.session.commit()
                response = (
                    jsonify(
                        {
                            "message": "Member removed successfully.",
                            "user": get_user_project_properties(
                                user, project, current_user
                            ),
                        }
                    ),
                    200,
                )
            else:
                response = (jsonify({"message": "User is not a collaborator."}), 400)

        except SQLAlchemyError as e:
            response = (
                jsonify({"message": f"Error removing collaborator: {str(e)}"}),
                500,
            )
    return response


@bp.route("/team/join/preview", methods=["POST"])
@login_required
def preview_invitation():
    """Get project details from invitation token without joining."""
    data = request.get_json()
    encoded_token = data.get("encoded_token")

    # Validate the invitation token
    project, error_response = validate_invitation_token(encoded_token)
    if error_response:
        return error_response

    # Get project name
    project_path = get_project_path(project.project_id)
    asr_project = asr.Project(project_path, project_id=project.project_id)
    project_name = asr_project.config.get("name", project.project_id)

    return (
        jsonify(
            {
                "project_id": project.project_id,
                "project_name": project_name,
                "owner_name": project.owner.name if project.owner else "Unknown",
                "is_owner": current_user.id == project.owner_id,
                "is_member": current_user in project.collaborators,
            }
        ),
        200,
    )


@bp.route("/team/join", methods=["POST"])
@login_required
def join_project():
    """Join a project using an invitation token."""
    data = request.get_json()
    encoded_token = data.get("encoded_token")

    # Validate the invitation token
    project, error_response = validate_invitation_token(encoded_token)
    if error_response:
        return error_response

    try:
        # Load ASReview project to get project name
        project_path = get_project_path(project.project_id)
        asr_project = asr.Project(project_path, project_id=project.project_id)
        project_name = asr_project.config.get("name", project.project_id)

        # Check if user is already the owner
        if current_user.id == project.owner_id:
            return (
                jsonify(
                    {
                        "message": "You are already the owner of this project.",
                        "already_member": True,
                        "project_id": project.project_id,
                        "project_name": project_name,
                    }
                ),
                200,
            )

        # Check if user is already a member
        if current_user in project.collaborators:
            return (
                jsonify(
                    {
                        "message": "You are already a member of this project.",
                        "already_member": True,
                        "project_id": project.project_id,
                        "project_name": project_name,
                    }
                ),
                200,
            )

        # Add user to collaborators
        project.collaborators.append(current_user)
        DB.session.commit()

        return (
            jsonify(
                {
                    "message": "Successfully joined the project.",
                    "project_id": project.project_id,
                    "project_name": project_name,
                }
            ),
            200,
        )

    except SQLAlchemyError as e:
        DB.session.rollback()
        return jsonify({"message": f"Error joining project: {str(e)}"}), 500
