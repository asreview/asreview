import json
import time
import csv
from io import BytesIO, StringIO
from pathlib import Path

import pytest
from jsonschema.exceptions import ValidationError

import asreview as asr
import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.webapp import DB
from asreview.webapp._authentication.models import Project
from asreview.webapp.utils import asreview_path
from asreview.webapp.utils import get_projects

# NOTE: I don't see a plugin that can be used for testing
# purposes
UPLOAD_DATA = [
    {"benchmark": "synergy:van_der_Valk_2021"},
    {
        "url": "https://raw.githubusercontent.com/asreview/"
        + "asreview/master/tests/demo_data/generic_labels.csv"
    },
]


def _asreview_file_archive():
    return list(
        Path("asreview", "webapp", "tests", "asreview-project-file-archive").glob(
            "v[12]*/asreview-project-v[12]*-startreview.asreview"
        )
    )


def test_get_projects(client, user, project):
    r = au.get_all_projects(client)
    assert r.status_code == 200
    assert len(r.json["result"]) == 1
    found_project = r.json["result"][0]
    if client.application.config.get("AUTHENTICATION"):
        assert found_project["id"] == project.project_id
        assert found_project["roles"]["owner"]
    else:
        assert found_project["id"] == project.config["id"]


# Test create a project
def test_create_projects(client, user):
    if client.application.config["AUTHENTICATION"]:
        au.create_and_signin_user(client, 1)

    r = au.create_project(client, "oracle", benchmark="synergy:van_der_Valk_2021")
    assert r.status_code == 201
    assert r.json["name"].startswith("van_der_Valk_2021")


# Test create a project with incorrect tags
@pytest.mark.skip(reason="tags are not used in the project creation anymore")
def test_create_projects_with_incorrect_tags(client, project):
    tags = json.dumps([{"foo": "bar"}, {"foo1": "bar1"}])

    with pytest.raises(
        ValidationError, match=r".*Failed validating .*type.* in schema.*"
    ):
        # request
        au.update_project(
            client,
            project,
            tags=json.dumps(tags),
        )


# Test create a project with correct tags
@pytest.mark.skip(reason="tags are not used in the project creation anymore")
def test_create_projects_with_correct_tags(client, project):
    tags = [
        {
            "name": "Biomes",
            "id": "biomes",
            "values": [
                {"id": "boreal_forest", "name": "Boreal Forest"},
                {"id": "savanna", "name": "Savanna"},
                {"id": "mangrove", "name": "Mangrove"},
                {"id": "tropical_forest", "name": "Tropical Forest"},
            ],
        },
        {
            "name": "Restoration Approaches",
            "id": "restoration_approaches",
            "values": [
                {
                    "id": "direct_seeding",
                    "name": "Direct seeding (i.e. spreading/planting seeds)",
                },
                {
                    "id": "tree_planting",
                    "name": "Planting trees (i.e. planting trees as seedlings)",
                },
                {
                    "id": "assisted_natural_regeneration",
                    "name": "Assisted natural regeneration",
                },
                {
                    "id": "farmer_managed_natural_regeneration",
                    "name": "Farmer managed natural regeneration",
                },
            ],
        },
    ]

    # request
    r = au.update_project(
        client,
        project,
        tags=json.dumps(tags),
    )
    assert r.status_code == 200
    assert r.json["mode"] == "oracle"
    assert r.json["tags"] == tags


# Test upgrading a post v0.x project
def test_try_upgrade_a_modern_project(client, project):
    data = misc.read_project_file(project)
    assert not data["version"].startswith("0")

    r = au.upgrade_projects(client, project)
    assert r.status_code == 200


# Test upgrading a v0.x project
@pytest.mark.skip(reason="projects in 0 series should no longer be supported")
def test_upgrade_an_old_project(client, user):
    tests_folder = Path(__file__).parent.parent
    asreview_v0_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v0.19",
        "asreview-project-v0-19-startreview.asreview",
    )

    project = asr.Project.load(
        open(asreview_v0_file, "rb"), asreview_path(), safe_import=True
    )

    # we need to make sure this new, old-style project can be found
    # under current user if the app is authenticated
    if client.application.config.get("AUTHENTICATION"):
        new_project = Project(project_id=project.config.get("id"))
        project = crud.create_project(DB, user, new_project)
    # try to convert
    r = au.upgrade_projects(client)
    assert r.status_code == 400
    assert r.json["message"].startswith("Not possible to upgrade")


# Test importing old projects (min_version = 1), verify ids
@pytest.mark.parametrize("fp", _asreview_file_archive())
def test_import_project_files(client, user, project, fp):
    r = au.import_project(client, fp)
    # get contents asreview folder
    folders = set(misc.get_folders_in_asreview_path())
    assert len(folders) == 2
    assert r.status_code == 200
    assert isinstance(r.json["data"], dict)

    if client.application.config.get("AUTHENTICATION"):
        # assert it exists in the database
        assert crud.count_projects() == 2
        project = crud.last_project()
        assert r.json["data"]["id"] == project.project_id
        # assert the owner is current user
        assert r.json["data"]["roles"]["owner"]
    else:
        assert r.json["data"]["id"] != project.config.get("id")
    # in auth/non-auth the project folder must exist in the asreview folder
    assert r.json["data"]["id"] in set([f.stem for f in folders])


# Test known demo data
@pytest.mark.parametrize("subset", ["plugin", "benchmark"])
def test_demo_data_project(client, user, subset):
    r = au.get_demo_data(client, subset)
    assert r.status_code == 200
    assert isinstance(r.json["result"], list)


# Test unknown demo data
def test_unknown_demo_data_project(client, user):
    r = au.get_demo_data(client, "abcdefg")
    assert r.status_code == 400
    assert r.json["message"] == "demo-data-loading-failed"


# Test uploading benchmark data to a project
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_upload_benchmark_data_to_project(client, user, upload_data):
    r = au.create_project(client, **upload_data)
    project = user.projects[0] if user is not None else get_projects()[0]
    assert r.status_code == 201
    if client.application.config.get("AUTHENTICATION"):
        assert r.json["id"] == project.project_id
    else:
        assert r.json["id"] == project.config.get("id")
    asr.Project(project.project_path).data_store.get_df()


# Test getting the data after an upload
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_get_project_data(client, user, upload_data):
    r = au.create_project(client, **upload_data)
    project = user.projects[0] if user is not None else get_projects()[0]

    r = au.get_project_data(client, project)
    assert r.status_code == 200
    assert r.json["filename"] == misc.extract_filename_stem(upload_data)


# Test get dataset writer
def test_get_dataset_writer(client, project):
    r = au.get_project_dataset_writer(client, project)
    assert r.status_code == 200
    assert isinstance(r.json["result"], list)


# Test updating a project
def test_update_project_info(client, project):
    new_name = "new name"
    new_authors = "new authors"
    new_description = "new description"

    # request
    r = au.update_project(
        client,
        project,
        name=new_name,
        authors=new_authors,
        description=new_description,
    )
    assert r.status_code == 200
    assert r.json["authors"] == new_authors
    assert r.json["description"] == new_description
    assert r.json["mode"] == "oracle"
    assert r.json["name"] == new_name


def test_search_data(client, project):
    r = au.search_project_data(client, project, query="Software&n_max=10")
    assert r.status_code == 200
    assert "result" in r.json
    assert isinstance(r.json["result"], list)
    assert len(r.json["result"]) <= 10


# Test labeling of prior data
@pytest.mark.parametrize("label", [0, 1])
def test_label_item(client, project, label):
    r = au.label_random_project_data_record(client, project, label)
    assert r.status_code == 200
    assert r.json["success"]


# Test getting labeled records
def test_get_labeled_project_data(client, project):
    # label a random record
    au.label_random_project_data_record(client, project, 1)
    # collect labeled records
    r = au.get_labeled_project_data(client, project)
    assert r.status_code == 200
    assert "result" in r.json
    assert isinstance(r.json["result"], list)
    assert len(r.json["result"]) == 1


# Test getting labeled records stats
def test_get_labeled_stats(client, project):
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # collect stats
    r = au.get_labeled_project_data_stats(client, project)

    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["n"] == 2
    assert r.json["n_exclusions"] == 1
    assert r.json["n_inclusions"] == 1
    assert r.json["n_prior"] == 2


# Test listing the available algorithms
def test_list_learners(client, user):
    r = au.get_project_algorithms_options(client)
    assert r.status_code == 200
    expected_keys = [
        "balancers",
        "classifiers",
        "feature_extractors",
        "queriers",
    ]
    for key in expected_keys:
        assert key in r.json["models"].keys()
        assert isinstance(r.json["models"][key], list)
        for item in r.json["models"][key]:
            assert "name" in item.keys()
            assert "label" in item.keys()


# Test setting the algorithms
def test_set_project_algorithms(client, project):
    data = misc.choose_project_algorithms()
    data["current_value"] = json.dumps(data["current_value"])

    r = au.set_project_algorithms(client, project, data=data)
    assert r.status_code == 200


def test_get_project_algorithms(client, project):
    data_algorithms = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data_algorithms)
    # get the project algorithms
    r = au.get_project_algorithms(client, project)
    assert r.status_code == 200
    assert r.json["current_value"]["balancer"] == r.json["current_value"]["balancer"]
    assert (
        r.json["current_value"]["feature_extractor"]
        == r.json["current_value"]["feature_extractor"]
    )
    assert (
        r.json["current_value"]["classifier"] == r.json["current_value"]["classifier"]
    )
    assert r.json["current_value"]["querier"] == r.json["current_value"]["querier"]


# Test starting the model
def test_start_and_model_ready(client, project):
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # select a model
    data = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data)
    r = au.set_project_status(client, project, status="review", trigger_model=True)
    assert r.status_code == 201
    assert r.json["status"] == "review"
    # make sure model is done
    time.sleep(10)


# Test status of project
@pytest.mark.parametrize(
    ("state_name", "expected_state"),
    [
        ("setup", "setup"),
        ("review", "review"),
        ("finish", "finished"),
    ],
)
def test_status_project(client, project, state_name, expected_state):
    # call these progression steps
    if state_name in ["setup", "review", "finish"]:
        # select a model
        data = misc.choose_project_algorithms()
        au.set_project_algorithms(client, project, data=data)
    if state_name in ["review", "finish"]:
        # start the model
        au.set_project_status(client, project, status="review", trigger_model=True)
        time.sleep(15)
    if state_name == "finish":
        # mark project as finished
        au.set_project_status(client, project, "finished")

    r = au.get_project_status(client, project)
    assert r.status_code == 200
    assert r.json["status"] == expected_state


# Test exporting the results
@pytest.mark.parametrize("format", ["csv", "tsv", "xlsx"])
def test_export_result(client, project, format):
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)

    r = au.export_project_dataset(client, project, format)
    assert r.status_code == 200


# Test that checks that no records are left out when exporting full dataset.
# This checks https://github.com/asreview/asreview/issues/2347 is fixed.
def test_export_all_records(client, project):
    # Add a relevant, irrelevant and pending record.
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    au.get_project_current_document(client, project)

    # Cast `project` to type `asreview.Project`. (In auth-mode it's the webapp database
    # model instead.)
    asr_project = asr.Project(project.project_path)
    # Add a last ranking to the state, as if a model has been trained.
    record_ids = asr_project.data_store["record_id"].to_list()
    with asr.open_state(asr_project) as state:
        state.add_last_ranking(record_ids, "nb", "max", "double", "tfidf", 2)

    for collection, size in [
        ("relevant", 1),
        ("irrelevant", 1),
        ("not_seen", len(record_ids) - 2),
    ]:
        r = au.export_project_dataset(client, project, "csv", collections=[collection])
        assert r.status_code == 200
        file_data = StringIO(r.data.decode("utf-8"))
        csv_rows = list(csv.reader(file_data))
        assert len(csv_rows) == size + 1


# Test uploading a RIS file with many authors, exporting it and importing it again.
# This checks https://github.com/asreview/asreview/issues/2252 is fixed.
def test_export_project_many_authors(client, user):
    tests_folder = Path(__file__).parent.parent
    with open(tests_folder / "data" / "ris_many_authors.ris", "rb") as f:
        ris_create_response = au.create_project(
            client, file=(f, "ris_many_authors.ris")
        )
    assert ris_create_response.status_code == 201
    project = user.projects[0] if user is not None else get_projects()[0]
    au.label_random_project_data_record(client, project, 1)
    for file_format in ("csv", "tsv", "xlsx"):
        export_response = au.export_project_dataset(
            client,
            project,
            file_format,
            collections=("relevant", "irrelevant", "not_seen"),
        )
        assert export_response.status_code == 200
        export_data = export_response.data
        create_response = au.create_project(
            client, file=(BytesIO(export_data), f"export.{file_format}")
        )
        assert create_response.status_code == 201


# Test exporting the entire project
def test_export_project(client, project):
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    response = au.export_project(client, project)

    # get the file names in the project
    tree = misc.get_zip_file_names(response.data)

    # get the file names
    assert response.status_code == 200
    assert "project.json" in tree
    assert "tmp/data.pickle" not in tree


# Test setting the project status
@pytest.mark.parametrize("status", ["review", "finished"])
def test_set_project_status(client, project, status):
    au.upload_label_set_and_start_model(client, project)
    if status == "review":
        r = au.set_project_status(client, project, "finished")
        assert r.status_code == 201

    r = au.set_project_status(client, project, status)
    assert r.status_code == 201


# Test get progress info
def test_get_progress_info(client, project):
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # get progress
    r = au.get_project_progress(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["n_excluded"] == 1
    assert r.json["n_included"] == 1
    assert r.json["n_pool"] == r.json["n_records"] - 2


# Test get progress data on the article
def test_get_progress_data(client, project):
    r = au.get_project_progress_data(client, project)
    assert r.status_code == 200
    assert isinstance(r.json, list)


# Test retrieve documents in order to review
def test_retrieve_document_for_review(client, project):
    au.upload_label_set_and_start_model(client, project)
    r = au.get_project_current_document(client, project)

    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert r.json["status"] == "review"
    assert isinstance(r.json["result"], dict)
    assert isinstance(r.json["result"]["record_id"], int)


# Test label a document after the model has been started
def test_label_a_document_with_running_model(client, user, project):
    au.upload_label_set_and_start_model(client, project)
    # get a document
    r = au.get_project_current_document(client, project)
    # label it
    r = au.label_project_record(
        client, project, r.json["result"]["record_id"], label=1, prior=0, note="note"
    )
    assert r.status_code == 200
    time.sleep(10)


# Test update label of a document after the model has been started
def test_update_label_of_document_with_running_model(client, project):
    au.upload_label_set_and_start_model(client, project)
    r = au.get_project_current_document(client, project)
    # get id
    record_id = r.json["result"]["record_id"]
    # label it
    au.label_project_record(client, project, record_id, label=1, prior=0, note="note")
    # change label
    r = au.update_label_project_record(
        client, project, record_id, label=0, prior=0, note="changed note"
    )
    assert r.status_code == 200
    time.sleep(10)


# Test deleting a project
def test_delete_project(client, project):
    r = au.delete_project(client, project)
    assert r.status_code == 200
    assert r.json["success"]


# Test admin deleting another user's project
def test_admin_can_delete_other_users_project(client_auth):
    """Test that an admin can delete a project owned by another user"""
    # Create first user (project owner)
    au.create_and_signin_user(client_auth, 1)
    assert len(crud.list_projects()) == 0

    # Create a project for the first user
    r = au.create_project(client_auth, "oracle", benchmark="synergy:van_der_Valk_2021")
    assert r.status_code == 201
    assert len(crud.list_projects()) == 1

    # Sign out first user
    au.signout_user(client_auth)

    # Create second user (admin)
    admin_user = au.create_and_signin_user(client_auth, 2)

    # Set the second user as admin
    admin_user.role = "admin"
    DB.session.commit()

    # delete project
    project = crud.list_projects()[0]
    r = au.delete_project(client_auth, project)

    assert r.status_code == 200
    assert r.json["success"]
    assert len(crud.list_projects()) == 0


# Test regular user cannot delete another user's project
def test_regular_user_cannot_delete_other_users_project(client_auth):
    """Test that a regular user cannot delete a project owned by another user"""
    # Create first user (project owner)
    au.create_and_signin_user(client_auth, 1)
    assert len(crud.list_projects()) == 0

    # Create a project for the first user
    r = au.create_project(client_auth, "oracle", benchmark="synergy:van_der_Valk_2021")
    assert r.status_code == 201
    assert len(crud.list_projects()) == 1

    # Sign out first user
    au.signout_user(client_auth)

    # Create second user (regular member)
    regular_user = au.create_and_signin_user(client_auth, 2)

    # Verify regular user is not admin
    assert regular_user.role == "member"
    assert not regular_user.is_admin

    # Verify regular user cannot delete the project owned by first user
    project = crud.list_projects()[0]
    r = au.delete_project(client_auth, project)

    # Should return 403 Forbidden
    assert r.status_code == 403
    assert len(crud.list_projects()) == 1


@pytest.mark.parametrize(
    "api_call,project_required,params",
    [
        (au.get_all_projects, False, {}),
        (au.get_demo_data, False, {"subset": "benchmark"}),
        (au.get_project_algorithms_options, False, {}),
        (au.get_project_algorithms, True, {}),
        (au.create_project, True, {}),
        (au.update_project, True, {}),
        (au.upgrade_projects, True, {}),
        (au.get_project_data, True, {}),
        (au.get_project_dataset_writer, True, {}),
        (au.search_project_data, True, {"query": "Software"}),
        (au.label_project_record, True, {"record_id": 1, "label": 1}),
        (au.update_label_project_record, True, {"record_id": 1, "label": 1}),
        (au.get_labeled_project_data, True, {}),
        (au.get_labeled_project_data_stats, True, {}),
        (au.set_project_algorithms, True, {"data": {}}),
        (au.set_project_status, True, {"status": "review"}),
        (au.get_project_status, True, {}),
        (au.export_project_dataset, True, {"format": "csv"}),
        (au.export_project, True, {}),
        (au.get_project_progress, True, {}),
        (au.get_project_progress_data, True, {}),
        (au.get_project_current_document, True, {}),
        (au.delete_project, True, {}),
    ],
)
def test_unauthorized_use_of_api_calls(
    client_auth, project, api_call, project_required, params
):
    au.signout_user(client_auth)

    if project_required:
        params["project"] = project

    r = api_call(client_auth, **params)
    assert r.status_code == 401


def test_generate_invitation_link(client_auth, project):
    """Test that invitation token contains valid project_id and token"""
    import base64
    import hmac
    import hashlib
    from flask import current_app

    # Generate invitation link
    r = client_auth.post(f"/api/projects/{project.project_id}/invitation-link/generate")
    assert r.status_code == 200

    data = r.json
    assert "encoded_token" in data
    assert "token" in data

    encoded_token = data["encoded_token"]
    returned_token = data["token"]

    # Decode the base64 encoded token
    decoded_bytes = base64.urlsafe_b64decode(encoded_token.encode("utf-8"))

    # Split payload and signature based on position
    # SHA256 signature is always 32 bytes at the end, preceded by a 1-byte separator
    signature = decoded_bytes[-32:]
    separator = decoded_bytes[-33:-32]
    payload_bytes = decoded_bytes[:-33]

    # Verify separator is a dot
    assert separator == b"."

    # Decode payload to string
    payload = payload_bytes.decode("utf-8")

    # Verify payload format: project_id:token
    assert ":" in payload
    decoded_project_id, decoded_token = payload.split(":", 1)

    # Verify the decoded values match
    assert decoded_project_id == project.project_id
    assert decoded_token == returned_token

    # Verify the HMAC signature
    secret_key = current_app.config.get("SECRET_KEY", "").encode("utf-8")
    expected_signature = hmac.new(secret_key, payload_bytes, hashlib.sha256).digest()
    assert signature == expected_signature


def test_generate_invitation_link_regenerates_token(client_auth, project):
    """Test that regenerating creates a new token and invalidates old link"""

    # Generate first link
    r1 = client_auth.post(
        f"/api/projects/{project.project_id}/invitation-link/generate"
    )
    assert r1.status_code == 200
    token1 = r1.json["token"]
    encoded_token1 = r1.json["encoded_token"]

    # Regenerate link
    r2 = client_auth.post(
        f"/api/projects/{project.project_id}/invitation-link/generate"
    )
    assert r2.status_code == 200
    token2 = r2.json["token"]
    encoded_token2 = r2.json["encoded_token"]

    # Tokens should be different (regenerated each time)
    assert token1 != token2
    assert encoded_token1 != encoded_token2


def test_fetch_invitation_link(client_auth, project):
    """Test fetching existing invitation link"""

    # Initially, no invitation link should exist
    r = client_auth.get(f"/api/projects/{project.project_id}/invitation-link")
    assert r.status_code == 200
    assert r.json["encoded_token"] is None

    # Generate invitation link
    r_gen = client_auth.post(
        f"/api/projects/{project.project_id}/invitation-link/generate"
    )
    assert r_gen.status_code == 200
    generated_token = r_gen.json["encoded_token"]

    # Fetch the invitation link
    r_fetch = client_auth.get(f"/api/projects/{project.project_id}/invitation-link")
    assert r_fetch.status_code == 200
    assert r_fetch.json["encoded_token"] == generated_token
    assert r_fetch.json["token"] is not None


def test_revoke_invitation_link(client_auth, project):
    """Test revoking invitation link"""

    # Generate invitation link first
    r_gen = client_auth.post(
        f"/api/projects/{project.project_id}/invitation-link/generate"
    )
    assert r_gen.status_code == 200
    assert r_gen.json["encoded_token"] is not None

    # Verify link exists
    r_check = client_auth.get(f"/api/projects/{project.project_id}/invitation-link")
    assert r_check.status_code == 200
    assert r_check.json["encoded_token"] is not None

    # Revoke the invitation link
    r_revoke = client_auth.delete(f"/api/projects/{project.project_id}/invitation-link")
    assert r_revoke.status_code == 200
    assert r_revoke.json["message"] == "Invitation link revoked successfully"

    # Verify link no longer exists
    r_verify = client_auth.get(f"/api/projects/{project.project_id}/invitation-link")
    assert r_verify.status_code == 200
    assert r_verify.json["encoded_token"] is None
