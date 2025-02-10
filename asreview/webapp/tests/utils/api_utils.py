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
    response = client.get("/")
    return response


def call_boot_url(client):
    response = client.get("/boot")
    return response


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
    response = client.post(
        "/auth/signin", data={"email": user.identifier, "password": user.password}
    )
    return response


def signup_user(client, user):
    """Signs up a user through the api"""
    response = client.post(
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
    return response


def signout_user(client):
    """Sign out user"""
    response = client.delete("/auth/signout")
    return response


def confirm_user(client, user):
    response = client.post(
        "/auth/confirm_account", data={"user_id": user.id, "token": user.token}
    )
    return response


def forgot_password(client, user):
    response = client.post("/auth/forgot_password", data={"email": user.email})
    return response


def reset_password(client, user):
    response = client.post(
        "/auth/reset_password",
        data={"password": user.password, "token": user.token, "user_id": user.id},
    )
    return response


def update_user(client, data):
    response = client.post("/auth/update_profile", data=data)
    return response


def user(client):
    response = client.get("/auth/user")
    return response


def get_profile(client: FlaskClient):
    response = client.get("/auth/get_profile")
    return response


# ########################
# Teams API calls
# ########################


def invite(client, project, user):
    url = f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}"
    response = client.post(url)
    return response


def list_invitations(client):
    response = client.get("/api/invitations")
    return response


def list_collaborators(client, project):
    response = client.get(f"/api/projects/{get_project_id(project)}/users")
    return response


def accept_invitation(client, project):
    response = client.post(
        f"/api/invitations/projects/{get_project_id(project)}/accept", data={}
    )
    return response


def reject_invitation(client, project):
    response = client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/reject", data={}
    )
    return response


def delete_invitation(client, project, user):
    response = client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}", data={}
    )
    return response


def delete_collaboration(client, project, user):
    response = client.delete(
        f"/api/projects/{get_project_id(project)}/users/{user.id}", data={}
    )
    return response


# ########################
# Project API calls
# ########################


def get_all_projects(client: FlaskClient):
    response = client.get("/api/projects")
    return response


def create_project(client: FlaskClient, mode: str = "oracle", **kwargs):
    response = client.post(
        "/api/projects/create",
        data={
            "mode": mode,
            **kwargs,
        },
    )
    return response


def update_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    name: str = "name",
    mode: str = "oracle",
    authors: str = "authors",
    description: str = "description",
    tags: str = "[]",
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/info",
        data={
            "mode": mode,
            "name": name,
            "authors": authors,
            "description": description,
            "tags": tags,
        },
    )
    return response


def upgrade_project(client: FlaskClient, project: Union[Project, asr.Project]):
    response = client.get(f"/api/projects/{get_project_id(project)}/upgrade_if_old")
    return response


def import_project(client: FlaskClient, asreview_file):
    response = client.post(
        "/api/projects/import",
        data={"file": (open(asreview_file, "rb"), "project.asreview")},
    )
    return response


def get_demo_data(client: FlaskClient, subset: str):
    response = client.get(f"/api/datasets?subset={subset}")
    return response


def get_project_data(client: FlaskClient, project: Union[Project, asr.Project]):
    response = client.get(f"/api/projects/{get_project_id(project)}/data")
    return response


def get_project_dataset_writer(
    client: FlaskClient, project: Union[Project, asr.Project]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/dataset_writer")
    return response


def search_project_data(
    client: FlaskClient, project: Union[Project, asr.Project], query: str
):
    response = client.get(f"/api/projects/{get_project_id(project)}/search?q={query}")
    return response


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
    response = client.post(
        f"/api/projects/{get_project_id(project)}/record/{record_id}",
        data={"record_id": record_id, "label": label, "is_prior": prior, "note": note},
    )
    return response


def update_label_project_record(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    record_id: int,
    label: str,
    prior: int = 1,
    note: str = "",
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/record/{record_id}",
        data={"record_id": record_id, "label": label, "is_prior": prior, "note": note},
    )
    return response


def get_labeled_project_data(client: FlaskClient, project: Union[Project, asr.Project]):
    response = client.get(f"/api/projects/{get_project_id(project)}/labeled")
    return response


def get_labeled_project_data_stats(
    client: FlaskClient, project: Union[Project, asr.Project]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/labeled_stats")
    return response


def get_project_algorithms_options(client: FlaskClient):
    response = client.get("/api/learners")
    return response


def set_project_algorithms(
    client: FlaskClient, project: Union[Project, asr.Project], data: dict
):
    response = client.post(
        f"/api/projects/{get_project_id(project)}/learner", data=data
    )
    return response


def get_project_algorithms(client: FlaskClient, project: Union[Project, asr.Project]):
    response = client.get(f"/api/projects/{get_project_id(project)}/learner")
    return response


def get_project_status(client: FlaskClient, project: Union[Project, asr.Project]):
    response = client.get(f"/api/projects/{get_project_id(project)}/status")
    return response


def set_project_status(
    client: FlaskClient,
    project: Union[Project, asr.Project],
    status: str,
    trigger_model: bool = False,
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/reviews/0",
        data={"status": status, "trigger_model": trigger_model},
    )
    return response


def export_project_dataset(
    client: FlaskClient, project: Union[Project, asr.Project], format: str
):
    id = get_project_id(project)
    response = client.get(f"/api/projects/{id}/export_dataset?format={format}")
    return response


def export_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/export_project")

    return response


def get_project_progress(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/progress")
    return response


def get_project_progress_data(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/progress_data")
    return response


def get_project_current_document(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/get_record")
    return response


def delete_project(
    client: FlaskClient,
    project: Union[Project, asr.Project],
):
    response = client.delete(f"/api/projects/{get_project_id(project)}/delete")
    return response


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
