import random
import time
from typing import Union

from flask.testing import FlaskClient

import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.project import ASReviewProject
from asreview.webapp.authentication.models import Project
from asreview.webapp.tests.utils.config_parser import all_users
from asreview.webapp.tests.utils.config_parser import get_user
from asreview.webapp.tests.utils.misc import get_project_id


def process_response(response):
    """Breaks response in a tuple containing the status code
    and json data."""
    return (response.status_code, response.json)


# ########################
# General API calls
# ########################


def call_root_url(client):
    response = client.get("/")
    status_code, data = process_response(response)
    return (status_code, data, response.text)


def call_boot_url(client):
    response = client.get("/boot")
    return process_response(response)


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
    return process_response(response)


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
    return process_response(response)


def signout_user(client):
    """Sign out user"""
    response = client.delete("/auth/signout")
    return process_response(response)


def confirm_user(client, user):
    response = client.post(
        "/auth/confirm_account", data={"user_id": user.id, "token": user.token}
    )
    return process_response(response)


def forgot_password(client, user):
    response = client.post("/auth/forgot_password", data={"email": user.email})
    return process_response(response)


def reset_password(client, user):
    response = client.post(
        "/auth/reset_password",
        data={"password": user.password, "token": user.token, "user_id": user.id},
    )
    return process_response(response)


def update_user(client, data):
    response = client.post("/auth/update_profile", data=data)
    return process_response(response)


def refresh(client):
    response = client.get("/auth/refresh")
    return process_response(response)


def get_profile(client: FlaskClient):
    response = client.get("/auth/get_profile")
    return process_response(response)


# ########################
# Teams API calls
# ########################


def invite(client, project, user):
    url = f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}"
    response = client.post(url)
    return process_response(response)


def list_invitations(client):
    response = client.get("/api/invitations")
    return process_response(response)


def list_collaborators(client, project):
    response = client.get(f"/api/projects/{get_project_id(project)}/users")
    return process_response(response)


def accept_invitation(client, project):
    response = client.post(
        f"/api/invitations/projects/{get_project_id(project)}/accept", data={}
    )
    return process_response(response)


def reject_invitation(client, project):
    response = client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/reject", data={}
    )
    return process_response(response)


def delete_invitation(client, project, user):
    response = client.delete(
        f"/api/invitations/projects/{get_project_id(project)}/users/{user.id}", data={}
    )
    return process_response(response)


def delete_collaboration(client, project, user):
    response = client.delete(
        f"/api/projects/{get_project_id(project)}/users/{user.id}", data={}
    )
    return process_response(response)


# ########################
# Project API calls
# ########################


def get_all_projects(client: FlaskClient):
    response = client.get("/api/projects")
    return process_response(response)


def create_project(
    client: FlaskClient,
    project_name: str,
    mode: str = "explore",
    authors: str = "authors",
    description: str = "description",
):
    response = client.post(
        "/api/projects/info",
        data={
            "mode": mode,
            "name": project_name,
            "authors": authors,
            "description": description,
        },
    )
    return process_response(response)


def create_project_from_dict(client: FlaskClient, data: dict):
    response = client.post(
        "/api/projects/info",
        data=data,
    )
    return process_response(response)


def update_project(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
    name: str = "name",
    mode: str = "explore",
    authors: str = "authors",
    description: str = "description",
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/info",
        data={
            "mode": mode,
            "name": name,
            "authors": authors,
            "description": description,
        },
    )
    return process_response(response)


def upgrade_project(client: FlaskClient, project: Union[Project, ASReviewProject]):
    response = client.get(f"/api/projects/{get_project_id(project)}/upgrade_if_old")
    return process_response(response)


def import_project(client: FlaskClient, asreview_file):
    response = client.post(
        "/api/projects/import_project",
        data={"file": (open(asreview_file, "rb"), "project.asreview")},
    )
    return process_response(response)


def get_project_stats(client: FlaskClient):
    response = client.get("/api/projects/stats")
    return process_response(response)


def get_demo_data(client: FlaskClient, subset: str):
    response = client.get(f"/api/datasets?subset={subset}")
    return process_response(response)


def upload_data_to_project(
    client: FlaskClient, project: Union[Project, ASReviewProject], data: dict
):
    response = client.post(
        f"/api/projects/{get_project_id(project)}/data",
        data=data,
    )
    return process_response(response)


def get_project_data(client: FlaskClient, project: Union[Project, ASReviewProject]):
    response = client.get(f"/api/projects/{get_project_id(project)}/data")
    return process_response(response)


def get_project_dataset_writer(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/dataset_writer")
    return process_response(response)


def search_project_data(
    client: FlaskClient, project: Union[Project, ASReviewProject], query: str
):
    response = client.get(f"/api/projects/{get_project_id(project)}/search?q={query}")
    return process_response(response)


def get_prior_random_project_data(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/prior_random")
    return process_response(response)


def label_random_project_data_record(
    client: FlaskClient, project: Union[Project, ASReviewProject], label: int
):
    # get random data
    _, data = get_prior_random_project_data(client, project)
    # select a specific record
    record = random.choice(data["result"])
    doc_id = record["id"]
    return label_project_record(client, project, doc_id, label, note="")


def label_project_record(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
    doc_id: int,
    label: str,
    prior: int = 1,
    note: str = "",
):
    response = client.post(
        f"/api/projects/{get_project_id(project)}/record/{doc_id}",
        data={"doc_id": doc_id, "label": label, "is_prior": prior, "note": note},
    )
    return process_response(response)


def update_label_project_record(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
    doc_id: int,
    label: str,
    prior: int = 1,
    note: str = "",
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/record/{doc_id}",
        data={"doc_id": doc_id, "label": label, "is_prior": prior, "note": note},
    )
    return process_response(response)


def get_labeled_project_data(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/labeled")
    return process_response(response)


def get_labeled_project_data_stats(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/labeled_stats")
    return process_response(response)


def get_project_algorithms_options(client: FlaskClient):
    response = client.get("/api/algorithms")
    return process_response(response)


def set_project_algorithms(
    client: FlaskClient, project: Union[Project, ASReviewProject], data: dict
):
    response = client.post(
        f"/api/projects/{get_project_id(project)}/algorithms", data=data
    )
    return process_response(response)


def get_project_algorithms(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.get(f"/api/projects/{get_project_id(project)}/algorithms")
    return process_response(response)


def start_project_algorithms(
    client: FlaskClient, project: Union[Project, ASReviewProject]
):
    response = client.post(f"/api/projects/{get_project_id(project)}/start")
    return process_response(response)


def get_project_status(client: FlaskClient, project: Union[Project, ASReviewProject]):
    response = client.get(f"/api/projects/{get_project_id(project)}/status")
    return process_response(response)


def set_project_status(
    client: FlaskClient, project: Union[Project, ASReviewProject], status: str
):
    response = client.put(
        f"/api/projects/{get_project_id(project)}/status", data={"status": status}
    )
    return process_response(response)


def export_project_dataset(
    client: FlaskClient, project: Union[Project, ASReviewProject], format: str
):
    id = get_project_id(project)
    response = client.get(f"/api/projects/{id}/export_dataset?file_format={format}")
    return process_response(response)


def export_project(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/export_project")
    return process_response(response)


def get_project_progress(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/progress")
    return process_response(response)


def get_project_progress_density(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/progress_density")
    return process_response(response)


def get_project_progress_recall(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/progress_recall")
    return process_response(response)


def get_project_current_document(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.get(f"/api/projects/{get_project_id(project)}/get_document")
    return process_response(response)


def delete_project(
    client: FlaskClient,
    project: Union[Project, ASReviewProject],
):
    response = client.delete(f"/api/projects/{get_project_id(project)}/delete")
    return process_response(response)


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


def upload_label_set_and_start_model(client, project, dataset):
    """Uploads a dataset to a created project and adds and starts
    a random model."""
    # upload dataset
    upload_data_to_project(client, project, data=dataset)
    # label 2 random records
    label_random_project_data_record(client, project, 1)
    label_random_project_data_record(client, project, 0)
    # select a model
    model_data = misc.choose_project_algorithms()
    set_project_algorithms(client, project, data=model_data)
    # start the model
    start_project_algorithms(client, project)
    # make sure model is done
    time.sleep(10)
