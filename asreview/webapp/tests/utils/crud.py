from asreview.webapp.authentication.models import User
import asreview.webapp.tests.utils.config_parser as cp

def create_user(DB, id=1):
    user = cp.get_user(id)
    DB.session.add(user)
    DB.session.commit()
    return user

def delete_users(DB):
    DB.session.query(User).delete()
    DB.session.commit()
