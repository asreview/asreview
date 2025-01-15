import asreview.webapp.tests.utils.config_parser as cp
from asreview.webapp._authentication.models import Collaboration
from asreview.webapp._authentication.models import CollaborationInvitation
from asreview.webapp._authentication.models import Project
from asreview.webapp._authentication.models import User


def create_user(DB, user=1):
    if isinstance(user, int):
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


def get_user_by_id(id):
    return User.query.filter_by(id=id).one()


def get_user_by_identifier(id):
    return User.query.filter_by(identifier=id).one()


def list_users():
    return User.query.all()


def count_users():
    return len(User.query.with_entities(User.id).all())


def update_user(DB, user, attribute, value):
    user = get_user_by_identifier(user.identifier)
    setattr(user, attribute, value)
    DB.session.commit()
    return user


def last_user():
    return User.query.order_by(User.id.desc()).first()


def delete_users(DB):
    DB.session.query(User).delete()
    DB.session.commit()


def delete_collaborations(DB):
    DB.session.query(Collaboration).delete()
    DB.session.commit()


def delete_invitations(DB):
    DB.session.query(CollaborationInvitation).delete()
    DB.session.commit()


def delete_projects(DB):
    DB.session.query(Project).delete()
    DB.session.commit()


def delete_everything(DB):
    DB.drop_all()


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


def get_project_by_project_id(id):
    return Project.query.filter_by(project_id=id).one()


def list_projects():
    return Project.query.all()


def count_projects():
    return len(Project.query.with_entities(Project.id).all())


def last_project():
    return Project.query.order_by(Project.id.desc()).first()


def create_invitation(DB, project, user):
    try:
        inv = CollaborationInvitation(project_id=project.id, user_id=user.id)
        DB.session.add(inv)
        DB.session.commit()
    except Exception as exception:
        DB.session.rollback()
        DB.session.flush()
        raise exception


def list_invitations():
    return CollaborationInvitation.query.all()


def last_invitation():
    return CollaborationInvitation.query.order_by(
        CollaborationInvitation.id.desc()
    ).first()


def count_invitations():
    return len(
        CollaborationInvitation.query.with_entities(CollaborationInvitation.id).all()
    )


def create_collaboration(DB, project, user):
    try:
        coll = Collaboration(project_id=project.id, user_id=user.id)
        DB.session.add(coll)
        DB.session.commit()
    except Exception as exception:
        DB.session.rollback()
        DB.session.flush()
        raise exception


def list_collaborations():
    return Collaboration.query.all()


def last_collaboration():
    return Collaboration.query.order_by(Collaboration.id.desc()).first()


def count_collaborations():
    return len(Collaboration.query.with_entities(Collaboration.id).all())


def create_user1_with_2_projects(DB):
    user = create_user(DB)
    project_ids = ["project-1", "project-2"]
    projects = [Project(project_id=p) for p in project_ids]
    user.projects = projects
    DB.session.commit()
    return user, projects
