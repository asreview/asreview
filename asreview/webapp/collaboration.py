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



@bp.route('/collaborators/<project_id>', methods=["GET"])
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
    invititations = [user.id for user in invitations]
    involved = set.union(owner, collaborators, invitations)

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