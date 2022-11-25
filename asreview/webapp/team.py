import datetime
from pathlib import Path

from flask import Blueprint
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_login import current_user
from sqlalchemy.exc import SQLAlchemyError

from asreview.project import ASReviewProject
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.login_required import asreview_login_required
from asreview.webapp.authentication.models import User, Project


bp = Blueprint('team', __name__, url_prefix='/team')
CORS(
    bp,
    resources={r"*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)

REQUESTER_FRAUD = { 'error': 'request is not made by current user' }


@bp.route('/<project_id>/users', methods=["GET"])
@asreview_login_required
def users(project_id):
    """returns all users involved in a project"""
    response = jsonify(REQUESTER_FRAUD, 404)

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
            for u in User.query.filter(
                User.public == True, User.id != current_user.id) \
                .order_by('last_name').all()
        ]

        # response
        response = (
            jsonify({
                'all_users': all_users,
                'collaborators': collaborators,
                'invitations': invitations
            }),
            200
        )
    return response


@bp.route('/<user_id>/pending_invitations', methods=["GET"])
@asreview_login_required
def pending_invitations(user_id):
    """invites a user to collaborate on a project"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get project
    user = User.query.get(user_id)
    # check if user is current_user
    if current_user == user:
        invitations = []
        for p in user.pending_invitations:
            # get path of project
            path = Path(asreview_path(), p.folder)
            # get object to get name
            asreview_object = ASReviewProject(path)
            # append info
            invitations.append({
                'id': p.id,
                'project_id': p.project_id,
                'owner_id': p.owner_id,
                'name': asreview_object.config['name'],
                'created_at_unix': asreview_object.config['created_at_unix'],
                'mode': asreview_object.config['mode']
            })
        response = (
            jsonify({
                'invited_for_projects': invitations
            }),
            200
        )
    return response


@bp.route('/<project_id>/user/<user_id>/invite', methods=["POST"])
@asreview_login_required
def invite(project_id, user_id):
    """invites a user to collaborate on a project"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if project in current_user.projects:
        user = User.query.get(user_id)
        project.pending_invitations.append(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


@bp.route('/<project_id>/user/<user_id>/delete_invitation', methods=["DELETE"])
@asreview_login_required
def delete_invitation(project_id, user_id):
    """removes an invitation"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if project in current_user.projects:
        user = User.query.get(user_id)
        project.pending_invitations.remove(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


# An owner can remove a collaborator
@bp.route('/<project_id>/user/<user_id>/delete_collaborator', methods=["DELETE"])
@asreview_login_required
def delete_collaborator(project_id, user_id):
    """removes a collaborator"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if project in current_user.projects:
        user = User.query.get(user_id)
        project.collaborators.remove(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


# A collaborator can end his/her collaboration
@bp.route('/<project_id>/user/<user_id>/end_collaboration', methods=["DELETE"])
@asreview_login_required
def end_collaboration(project_id, user_id):
    """removes a collaborator"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get user
    user = User.query.get(user_id)
    # get project
    project = Project.query.filter(Project.project_id == project_id).one_or_none()
    # check if project is from current user
    if current_user == user and project in current_user.involved_in:
        project.collaborators.remove(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


@bp.route('/<project_id>/user/<user_id>/reject_invitation', methods=["DELETE"])
@asreview_login_required
def reject_invitation(project_id, user_id):
    """rejects an invitation"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get user
    user = User.query.get(user_id)
    # if user is current user, try to remove
    if user == current_user:
        # get project
        project = Project.query.filter(Project.project_id == project_id).one_or_none()
        # remove invitation
        project.pending_invitations.remove(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


@bp.route('/<project_id>/user/<user_id>/accept_invitation', methods=["POST"])
@asreview_login_required
def accept_invitation(project_id, user_id):
    """accepts an invitation"""
    response = jsonify(REQUESTER_FRAUD, 404)
    # get user
    user = User.query.get(user_id)
    # if user is current user, try to add this user to project
    if user == current_user:
        # get project
        project = Project.query.filter(Project.project_id == project_id).one_or_none()
        # remove invitation
        project.pending_invitations.remove(user)
        # add as collaborator
        project.collaborators.append(user)
        try:
            DB.session.commit()
            response = jsonify({ 'success': True }), 200
        except SQLAlchemyError:
            response = jsonify({ 'success': False }), 404
    return response


    