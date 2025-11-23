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
