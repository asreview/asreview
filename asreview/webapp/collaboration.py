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

def get_full_name(user):
    first_name = user.first_name or ''
    last_name = user.last_name or ''
    return ' '.join([first_name, last_name]).strip()

@bp.route('/collaborators/<project_id>', methods=["GET"])
@asreview_login_required
def users(project_id):
    """returns all users involved in a project"""
    # get project
    project = Project.query.filter(Project.project_id == project_id).one()
    # I need to know who is involved
    owner = set([current_user.id])
    collab_ids = set([user.id for user in project.collaborators])
    invite_ids = set([user.id for user in project.pending_invitations])
    involved = set.union(owner, collab_ids, invite_ids)
    # who is left out
    all_users = [
        {
            'id': u.id,
            'name': u.username,
            'email': u.email,
            'full_name': get_full_name(u)
        }
        for u in User.query.filter(User.public == True).all()
        if u.id not in involved
    ]
    response = jsonify({
        'potential_collaborators': all_users,
        'collaborators': [{ 'id': u.id, 'full_name': get_full_name(u)} for u in project.collaborators],
        'invited_users': [{ 'id': u.id, 'full_name': get_full_name(u)} for u in project.pending_invitations],
    })
    return response, 200