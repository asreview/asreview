from flask import Blueprint
from flask import jsonify
from flask_login import current_user
from sqlalchemy.exc import SQLAlchemyError

import asreview as asr
from asreview.webapp import DB
from asreview.webapp._authentication.decorators import login_required
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User

bp = Blueprint("team", __name__, url_prefix="/api")

REQUESTER_FRAUD = {"message": "Request can not made by current user."}


def get_user_project_properties(user, project, current_user):
    """Retrieve user properties in relation to a project and current user."""
    result = user.summarize()

    pending = user in project.pending_invitations
    owner = user.id == project.owner_id
    member = user in project.collaborators or owner
    me = user.id == current_user.id

    selectable = not (pending or member or owner)
    deletable = (
        (current_user.id == project.owner_id or current_user.is_admin)
        and (member or pending)
        and not me
    )

    return dict(
        result,
        me=me,
        pending=pending,
        owner=owner,
        member=member,
        selectable=selectable,
        deletable=deletable,
    )


@bp.route("/projects/<project_id>/users", methods=["GET"])
@login_required
def users(project_id):
    """Returns all users involved in a project."""
    project = Project.query.filter(Project.project_id == project_id).one_or_none()

    # Deny if user is member and this person is not somehow involved in the project
    if (
        current_user.is_member
        and project not in current_user.projects
        and project not in current_user.involved_in
    ):
        return jsonify(REQUESTER_FRAUD), 404

    users = sorted(
        [
            get_user_project_properties(user, project, current_user)
            for user in User.query.filter(User.public).order_by("name").all()
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


@bp.route("/invitations", methods=["GET"])
@login_required
def pending_invitations():
    """Returns pending invitations for current user."""
    invitations = []
    for p in current_user.pending_invitations:
        # get path of project
        path = p.project_path
        # get object to get name
        asreview_object = asr.Project(path)
        # append info
        invitations.append(
            {
                "id": p.id,
                "project_id": p.project_id,
                "owner_id": p.owner_id,
                "owner_name": p.owner.get_name(),
                "owner_affiliation": p.owner.affiliation,
                "name": asreview_object.config["name"],
                "created_at_unix": asreview_object.config["created_at_unix"],
                "mode": asreview_object.config["mode"],
            }
        )
    return jsonify({"invited_for_projects": invitations}), 200


@bp.route("/invitations/projects/<project_id>/users/<user_id>", methods=["POST"])
@login_required
def invite(project_id, user_id):
    """Project owner or admin invites a user to collaborate on a project"""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user or if current user is admin
    if project and (project.owner == current_user or current_user.is_admin):
        user = DB.session.get(User, user_id)

        # Check if user is already invited to avoid unique constraint violation
        if user in project.pending_invitations:
            response = (
                jsonify({"message": f'User "{user.identifier}" not invited.'}),
                404,
            )
        else:
            # Store user identifier before DB operation to avoid session rollback issues
            user_identifier = user.identifier
            project.pending_invitations.append(user)
            try:
                DB.session.commit()
                response = (
                    jsonify(
                        {
                            "message": "Invitation is successfully created.",
                            "user": get_user_project_properties(
                                user, project, current_user
                            ),
                        }
                    ),
                    200,
                )
            except SQLAlchemyError:
                DB.session.rollback()
                response = (
                    jsonify({"message": f'User "{user_identifier}" not invited.'}),
                    404,
                )
    return response


@bp.route("/invitations/projects/<project_id>/accept", methods=["POST"])
@login_required
def accept_invitation(project_id):
    """Invited person accepts an invitation."""

    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # if user is current user, try to add this user to project
    if project and current_user in project.pending_invitations:
        # remove invitation
        project.pending_invitations.remove(current_user)
        # add as collaborator
        project.collaborators.append(current_user)
        try:
            DB.session.commit()
            return jsonify(
                {
                    "id": project.id,
                    "project_id": project.project_id,
                    "owner_id": project.owner_id,
                }
            ), 200
        except SQLAlchemyError:
            return jsonify({"message": "Error accepting invitation."}), 404
    return jsonify(REQUESTER_FRAUD), 404


@bp.route("/invitations/projects/<project_id>/reject", methods=["DELETE"])
@login_required
def reject_invitation(project_id):
    """Invited person rejects an invitation."""

    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # if current_user is indeed invited
    if project and current_user in project.pending_invitations:
        # remove invitation
        project.pending_invitations.remove(current_user)
        try:
            DB.session.commit()
            return jsonify(
                {
                    "id": project.id,
                    "project_id": project.project_id,
                    "owner_id": project.owner_id,
                }
            ), 200
        except SQLAlchemyError:
            return jsonify({"message": "Error rejecting invitation."}), 404

    return jsonify(REQUESTER_FRAUD), 404


@bp.route("/invitations/projects/<project_id>/users/<user_id>", methods=["DELETE"])
@login_required
def delete_invitation(project_id, user_id):
    """Project owner or admin removes an invitation"""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user or if current user is admin
    if project and (project.owner == current_user or current_user.is_admin):
        # get user
        user = DB.session.get(User, user_id)

        if not user:
            return jsonify({"message": "User not found."}), 404

        try:
            if user in project.pending_invitations:
                project.pending_invitations.remove(user)
                DB.session.commit()
                response = (
                    jsonify(
                        {
                            "message": "Invitation cancelled successfully.",
                            "user": get_user_project_properties(
                                user, project, current_user
                            ),
                        }
                    ),
                    200,
                )
            else:
                response = (
                    jsonify({"message": "User does not have a pending invitation."}),
                    400,
                )
        except SQLAlchemyError as e:
            response = jsonify({"message": f"Error deleting invitation: {str(e)}"}), 500
    return response
