import datetime
from pathlib import Path

from flask import Blueprint
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_login import current_user, login_user, logout_user
from sqlalchemy.exc import SQLAlchemyError

from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.login_required import asreview_login_required
from asreview.webapp.authentication.models import User

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

@bp.route('/potential_collaborators', methods=["GET"])
@asreview_login_required
def users():
    """returns all user, expect current user"""
    all_users = [
        {
            'id': u.id,
            'name': u.username,
            'email': u.email,
            'full_name': get_full_name(u)
        }
        for u in User.query.all() if u.id != current_user.id
    ]
    print(all_users)
    print(current_user)
    response = jsonify({'result': all_users})
    return response, 200