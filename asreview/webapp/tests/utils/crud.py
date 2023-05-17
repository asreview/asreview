from asreview.webapp.authentication.models import Project
from asreview.webapp.authentication.models import User
import asreview.webapp.tests.utils.config_parser as cp

def create_user(DB, user=1):
    if type(user) == int:
        user = cp.get_user(user)
    try:
        DB.session.add(user)
        DB.session.commit()
        user = User.query.order_by(User.id.desc()).first()
    except Exception as exception:
        user = False
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
        id = project.project_id
        project = Project.query.filter_by(project_id=id).one()
    except Exception as exception:
        project = False
        DB.session.rollback()
        DB.session.flush()
        raise exception
    return project


def create_user1_with_2_projects(DB):
    user = create_user(DB)
    project_ids = ["project-1", "project-2"]
    projects = [Project(project_id=p) for p in project_ids]
    user.projects = projects
    DB.session.commit()
    return user, projects
