from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
import asreview.webapp.tests.utils.config_parser as cp

def create_user(DB, user=1):
    if type(user) == int:
        user = cp.get_user(user)
    try:
        DB.session.add(user)
        DB.session.commit()
    except Exception as exception:
        DB.session.rollback()
        DB.session.flush()
        raise exception
    return user


def delete_users(DB):
    DB.session.query(User).delete()
    DB.session.commit()


def delete_projects(DB):
    DB.session.query(Project).delete()
    DB.session.commit()


def create_project(DB, user, project):
    try:
        user.projects.append(project)
        DB.session.commit()
    except Exception as exception:
        DB.session.rollback()
        DB.session.flush()
        raise exception
    return project

