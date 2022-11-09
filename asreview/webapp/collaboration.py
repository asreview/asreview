import datetime
from pathlib import Path

from flask import Blueprint
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_login import current_user, login_user, logout_user
from sqlalchemy.exc import SQLAlchemyError

from asreview.project import project_from_id
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.login_required import asreview_login_required
from asreview.webapp.authentication.models import User, Project


bp = Blueprint('collab', __name__, url_prefix='/collab')
CORS(
    bp,
    resources={r"*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)



@bp.route('/<project_id>/users', methods=["GET"])
@asreview_login_required
def users(project_id):
    """returns all users involved in a project"""
    # get project
    project = Project.query.filter(Project.project_id == project_id).one()

    # get associated users from project
    collaborators = project.collaborators
    invitations = project.pending_invitations

    # union those associate users to remove them from all users
    owner = set([current_user.id])
    collaborators = [user.id for user in collaborators]
    invitations = [user.id for user in invitations]

    # get all users minus the associated ones, and collect the 
    # associated ones separately
    all_users = [ 
        u.summarize()
        for u in User.query.filter(User.public == True) \
            .order_by('last_name').all()
    ]

    # response
    response = jsonify({
        'all_users': all_users,
        'collaborators': collaborators,
        'invitations': invitations
    })

    return response, 200


@bp.route('/<project_id>/user/<user_id>/invite', methods=["POST"])
@asreview_login_required
def invite(project_id, user_id):
    """invites a user to collaborate on a project"""
    # get project
    project = Project.query.filter(Project.project_id == project_id).one()
    user = User.query.get(user_id)
    project.pending_invitations.append(user)
    try:
        DB.session.commit()
        return jsonify({ 'success': True }), 200
    except SQLAlchemyError:
        return jsonify({ 'success': False }), 404


@bp.route('/<project_id>/user/<user_id>/delete_invitation', methods=["DELETE"])
@asreview_login_required
def delete_invitation(project_id, user_id):
    """removes an invitation"""
    # get project
    project = Project.query.filter(Project.project_id == project_id).one()
    user = User.query.get(int(user_id))
    print(user, project.pending_invitations)
    project.pending_invitations.remove(user)
    try:
        DB.session.commit()
        return jsonify({ 'success': True }), 200
    except SQLAlchemyError:
        return jsonify({ 'success': False }), 404


@bp.route('/<project_id>/user/<user_id>/delete_collaborator', methods=["DELETE"])
@asreview_login_required
def delete_collaborator(project_id, user_id):
    """removes a collaborator"""
    # get project
    project = Project.query.filter(Project.project_id == project_id).one()
    user = User.query.get(user_id)
    project.collaborators.remove(user)
    try:
        DB.session.commit()
        return jsonify({ 'success': True }), 200
    except SQLAlchemyError:
        return jsonify({ 'success': False }), 404


    