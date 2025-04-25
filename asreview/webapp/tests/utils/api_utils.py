import time
from typing import Union

from flask.testing import FlaskClient

import asreview as asr
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.webapp._authentication.models import Project
from asreview.webapp.tests.utils.config_parser import all_users
from asreview.webapp.tests.utils.config_parser import get_user
from asreview.webapp.tests.utils.misc import get_project_id

# ########################
# General API calls
# ########################


def call_root_url(client):
    return client.get("/")


def call_boot_url(client):
    return client.get("/boot")


# ########################
# Authentication API calls
# ########################


def signin_user(client, user):
    """Signs in a user through the api"""
    # If a password is not set, we need to get it
    if not hasattr(user, "password"):
        users = all_users()
        user.password = users[user.identifier].password
    # request
    return client.post(
        "/auth/signin", data={"email": user.identifier, "password": user.password}
    )


def signup_user(client, user):
    """Signs up a user through the api"""
    return client.post(
        "/auth/signup",
        data={
            "identifier": user.email,
            "email": user.email,
            "name": user.name,
            "password": user.password,
            "affiliation": user.affiliation,
            "origin": "asreview",
        },
    )


def signout_user(client):
    """Sign out user"""
    return client.delete("/auth/signout")


def confirm_user(client, user):
    return client.post(
        "/auth/confirm_account", data={"user_id": user.id, "token": user.token}
    )


def forgot_password(client, user):
    return client.post("/auth/forgot_password", data={"email": user.email})


def reset_password(client, user):
    return client.post(
        "/auth/reset_password",
        data={"password": user.password, "token": user.token, "user_id": user.id},
    )


def update_user(client, data):
    return client.post("/auth/update_profile", data=data)


def user(client):
    return client.get("/auth/user")


def get_profile(client: FlaskClient):
    return client.get("/auth/get_profile")


# ########################
# Teams API calls
# ########################


def invite(client, project, user):
    url = f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}"
    return client.post(url)


def list_invitations(client):
    return client.get("/api/invitations")


def list_collaborators(client, project):
    return client.get(f"/api/projects/{get_project_id(project)}/users")


def accept_invitation(client, project):
    return client.post(
        f"/api/invitations/projects/{get_project_id(project)}/accept", data={}
    )


def reject_invitation(client, project):
    return client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/reject", data={}
    )


def delete_invitation(client, project, user):
    return client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}", data={}
    )


def delete_collaboration(client, project, user):
    return client.delete(
        f"/api/projects/{get_project_id(project)}/users/{user.id}", data={}
    )


# ########################
# Project API calls
# ########################


def get_all_projects(client: FlaskClient):
    return client.get("/api/projects")


def create_project(client: FlaskClient, mode: str = "oracle", **kwargs):
    return client.post(
        "/api/projects/create",
        data={
            "mode": mode,
            **kwargs,
        },
    )


def update_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    name: str = "name",
    mode: str = "oracle",
    authors: str = "authors",
    description: str = "description",
):
    return client.put(
        f"/api/projects/{get_project_id(project)}/info",
        data={
            "mode": mode,
            "name": name,
            "authors": authors,
            "description": description,
        },
    )


def upgrade_projects(client: FlaskClient, project: Union[Project, asr.Project]):
    return client.put("/api/upgrade/projects")


def import_project(client: FlaskClient, asreview_file):
    return client.post(
        "/api/projects/import",
        data={"file": (open(asreview_file, "rb"), "project.asreview")},
    )


def get_demo_data(client: FlaskClient, subset: str):
    return client.get(f"/api/datasets?subset={subset}")


def get_project_data(client: FlaskClient, project: Union[Project, asr.Project]):
    return client.get(f"/api/projects/{get_project_id(project)}/data")


def get_project_dataset_writer(
    client: FlaskClient, project: Union[Project, asr.Project]
):
    return client.get(f"/api/projects/{get_project_id(project)}/dataset_writer")


def search_project_data(
    client: FlaskClient, project: Union[Project, asr.Project], query: str
):
    return client.get(f"/api/projects/{get_project_id(project)}/search?q={query}")


def label_random_project_data_record(
    client: FlaskClient, project: Union[Project, asr.Project], label: int
):
    r = search_project_data(client, project, query="The&n_max=10")
    return label_project_record(
        client, project, r.json["result"][0]["record_id"], label
    )


def label_project_record(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    record_id: int,
    label: str,
    prior: int = 1,
    note: str = "",
):
    return client.post(
        f"/api/projects/{get_project_id(project)}/record/{record_id}",
        data={"record_id": record_id, "label": label, "is_prior": prior, "note": note},
    )


def update_label_project_record(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    record_id: int,
    label: str,
    prior: int = 1,
    note: str = "",
):
    return client.put(
        f"/api/projects/{get_project_id(project)}/record/{record_id}",
        data={"record_id": record_id, "label": label, "is_prior": prior, "note": note},
    )


def get_labeled_project_data(client: FlaskClient, project: Union[Project, asr.Project]):
    return client.get(f"/api/projects/{get_project_id(project)}/labeled")


def get_labeled_project_data_stats(
    client: FlaskClient, project: Union[Project, asr.Project]
):
    return client.get(f"/api/projects/{get_project_id(project)}/labeled_stats")


def get_project_algorithms_options(client: FlaskClient):
    return client.get("/api/learners")


def set_project_algorithms(
    client: FlaskClient, project: Union[Project, asr.Project], data: dict
):
    return client.post(f"/api/projects/{get_project_id(project)}/learner", data=data)


def get_project_algorithms(client: FlaskClient, project: Union[Project, asr.Project]):
    return client.get(f"/api/projects/{get_project_id(project)}/learner")


def get_project_status(client: FlaskClient, project: Union[Project, asr.Project]):
    return client.get(f"/api/projects/{get_project_id(project)}/status")


def set_project_status(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    status: str,
    trigger_model: bool = False,
):
    return client.put(
        f"/api/projects/{get_project_id(project)}/reviews/0",
        data={"status": status, "trigger_model": trigger_model},
    )


def export_project_dataset(
    client: FlaskClient, project: Union[Project, asr.Project], format: str
):
    id = get_project_id(project)
    return client.get(f"/api/projects/{id}/export_dataset?format={format}")


def export_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    return client.get(f"/api/projects/{get_project_id(project)}/export_project")


def get_project_progress(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    return client.get(f"/api/projects/{get_project_id(project)}/progress")


def get_project_progress_data(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    return client.get(f"/api/projects/{get_project_id(project)}/progress_data")


def get_project_current_document(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    return client.get(f"/api/projects/{get_project_id(project)}/get_record")


def delete_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    return client.delete(f"/api/projects/{get_project_id(project)}/delete")


# ########################
# General procedures
# ########################


def create_and_signin_user(client, test_user_id=1):
    """Creates a user account and signs in with that account."""
    # signup user
    user = get_user(test_user_id)
    signup_user(client, user)
    # refresh user
    stored_user = crud.get_user_by_identifier(user.identifier)
    # signin user
    signin_user(client, user)
    # return the user
    return stored_user


def upload_label_set_and_start_model(client, project):
    """Uploads a dataset to a created project and adds and starts
    a random model."""
    # label 2 random records
    label_random_project_data_record(client, project, 1)
    label_random_project_data_record(client, project, 0)
    # select a model
    model_data = misc.choose_project_algorithms()
    set_project_algorithms(client, project, data=model_data)
    # start the model
    set_project_status(client, project, status="review", trigger_model=True)
    # make sure model is done
    time.sleep(10)
