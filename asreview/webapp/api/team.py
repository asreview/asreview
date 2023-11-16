from flask import Blueprint
from flask import jsonify
from flask_login import current_user
from flask_login import login_required
from sqlalchemy import and_
from sqlalchemy.exc import SQLAlchemyError

from asreview.project import ASReviewProject
from asreview.webapp import DB
from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User

bp = Blueprint("team", __name__, url_prefix="/api")

REQUESTER_FRAUD = {"message": "Request can not made by current user."}


@bp.route("/projects/<project_id>/users", methods=["GET"])
@login_required
def users(project_id):
    """Returns all users involved in a project."""
    response = jsonify(REQUESTER_FRAUD), 404

    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()

    # check if this project is in fact from current user
    if project in current_user.projects:
        # get associated users from project
        collaborators = project.collaborators
        invitations = project.pending_invitations

        # get all users that are involved (invited or collabo)
        collaborators = [user.id for user in collaborators]
        invitations = [user.id for user in invitations]

        # get all users minus myself
        all_users = [
            u.summarize()
            for u in User.query.filter(and_(User.public, User.id != current_user.id))
            .order_by("name")
            .all()
        ]

        # response
        response = (
            jsonify(
                {
                    "all_users": all_users,
                    "collaborators": collaborators,
                    "invitations": invitations,
                }
            ),
            200,
        )
    return response


@bp.route("/projects/<project_id>/users/<user_id>", methods=["DELETE"])
@login_required
def end_collaboration(project_id, user_id):
    """Project owner removes a collaborator, or collaborator
    removes him/herself."""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()

    # check if project is owned by current user or if the user is
    # involved in the project
    if project and (
        (project.owner == current_user) or (project in current_user.involved_in)
    ):
        user = DB.session.get(User, user_id)

        try:
            project.collaborators.remove(user)
            DB.session.commit()
            response = (
                jsonify({"message": "Collaborator removed from project."}),
                200
            )

        except SQLAlchemyError:
            response = (
                jsonify({"message": "Error removing collaborator."}),
                404
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
        asreview_object = ASReviewProject(path)
        # append info
        invitations.append(
            {
                "id": p.id,
                "project_id": p.project_id,
                "owner_id": p.owner_id,
                "name": asreview_object.config["name"],
                "created_at_unix": asreview_object.config["created_at_unix"],
                "mode": asreview_object.config["mode"],
            }
        )
    response = (jsonify({"invited_for_projects": invitations}), 200)
    return response


@bp.route("/invitations/projects/<project_id>/users/<user_id>", methods=["POST"])
@login_required
def invite(project_id, user_id):
    """Project owner invites a user to collaborate on a project"""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if project and project.owner == current_user:
        user = DB.session.get(User, user_id)
        project.pending_invitations.append(user)
        try:
            DB.session.commit()
            response = (
                jsonify({"message": f'User "{user.identifier}" invited.'}),
                200
            )
        except SQLAlchemyError:
            response = (
                jsonify({"message": f'User "{user.identifier}" not invited.'}),
                404,
            )
    return response


@bp.route("/invitations/projects/<project_id>/accept", methods=["POST"])
@login_required
def accept_invitation(project_id):
    """Invited person accepts an invitation."""
    response = jsonify(REQUESTER_FRAUD), 404
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
            response = (
                jsonify({"message": "User accepted invitation for project."}),
                200
            )
        except SQLAlchemyError:
            response = (
                jsonify({"message": "Error accepting invitation."}),
                404
            )
    return response


@bp.route("/invitations/projects/<project_id>/reject", methods=["DELETE"])
@login_required
def reject_invitation(project_id):
    """Invited person rejects an invitation."""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # if current_user is indeed invited
    if project and current_user in project.pending_invitations:
        # remove invitation
        project.pending_invitations.remove(current_user)
        try:
            DB.session.commit()
            response = (
                jsonify({"message": "User rejected invitation for project."}),
                200
            )
        except SQLAlchemyError:
            response = (
                jsonify({"message": "Error rejecting invitation."}),
                404
            )
    return response


@bp.route("/invitations/projects/<project_id>/users/<user_id>", methods=["DELETE"])
@login_required
def delete_invitation(project_id, user_id):
    """removes an invitation"""
    response = jsonify(REQUESTER_FRAUD), 404
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if project and project.owner == current_user:
        # get user
        user = DB.session.get(User, user_id)
        # remove from project
        project.pending_invitations.remove(user)
        try:
            DB.session.commit()
            response = jsonify({"message": "Owner deleted invitation."}), 200
        except SQLAlchemyError:
            response = jsonify({"message": "Error deleting invitation."}), 404
    return response
