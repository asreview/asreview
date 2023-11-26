import inspect
import time
from pathlib import Path
from typing import Union

import pytest
from flask import current_app
from flask.testing import FlaskClient

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.project import ASReviewProject
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.authentication.models import Project

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
            "*/asreview-project-*-startreview.asreview"
        )
    )


# NOTE: the setup fixture entails: a FlaskClient, 1 user (signed in),
# and a project of this user OR a project from an unauthenticated app.
# The fixture is parametrized! It runs the authenticated app and the
# unauthenticated app.


# Test getting all projects
def test_get_projects(setup):
    client, user1, project = setup
    status_code, data = au.get_all_projects(client)
    assert status_code == 200
    assert len(data["result"]) == 1
    found_project = data["result"][0]
    if not current_app.config.get("LOGIN_DISABLED"):
        assert found_project["id"] == project.project_id
        assert found_project["owner_id"] == user1.id
    else:
        assert found_project["id"] == project.config["id"]


# Test create a project
def test_create_projects(setup):
    client, _, _ = setup
    project_name = "new_project"

    status_code, data = au.create_project(client, project_name)
    assert status_code == 201
    assert data["name"] == project_name


# Test upgrading a post v0.x project
def test_try_upgrade_a_modern_project(setup):
    client, _, project = setup
    # verify version
    data = misc.read_project_file(project)
    assert not data["version"].startswith("0")

    status_code, data = au.upgrade_project(client, project)
    assert status_code == 400
    assert data["message"] == "Can only convert v0.x projects."


# Test upgrading a v0.x project
def test_upgrade_an_old_project(setup):
    client, user, _ = setup

    tests_folder = Path(__file__).parent.parent
    asreview_v0_file = Path(
        tests_folder,
        "asreview-project-file-archive",
        "v0.19",
        "asreview-project-v0-19-startreview.asreview"
    )

    project = ASReviewProject.load(
        open(asreview_v0_file, "rb"), asreview_path(), safe_import=True
    )

    # we need to make sure this new, old-style project can be found
    # under current user if the app is authenticated
    if not current_app.config.get("LOGIN_DISABLED"):
        new_project = Project(project_id=project.config.get("id"))
        project = crud.create_project(DB, user, new_project)
    # try to convert
    status_code, data = au.upgrade_project(client, project)
    assert status_code == 200
    assert data["success"]


# Test importing old projects, verify ids
@pytest.mark.parametrize("fp", _asreview_file_archive())
def test_import_project_files(setup, fp):
    client, user, first_project = setup
    # import project
    status_code, data = au.import_project(client, fp)
    # get contents asreview folder
    folders = set(misc.get_folders_in_asreview_path())
    assert len(folders) == 2
    assert status_code == 200
    assert isinstance(data, dict)
    if not current_app.config.get("LOGIN_DISABLED"):
        # assert it exists in the database
        assert crud.count_projects() == 2
        project = crud.last_project()
        assert data["id"] != first_project.project_id
        assert data["id"] == project.project_id
        # assert the owner is current user
        assert data["owner_id"] == user.id
    else:
        assert data["id"] != first_project.config.get("id")
    # in auth/non-auth the project folder must exist in the asreview folder
    assert data["id"] in set([f.stem for f in folders])


# Test get stats in setup state
def test_get_projects_stats_setup_stage(setup):
    client, _, _ = setup
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 0
    assert data["result"]["n_finished"] == 0
    assert data["result"]["n_setup"] == 1


# Test get stats in review state
def test_get_projects_stats_review_stage(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get stats
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 1
    assert data["result"]["n_finished"] == 0
    assert data["result"]["n_setup"] == 0


# Test get stats in finished state
def test_get_projects_stats_finished_stage(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # manually finish the project
    au.set_project_status(client, project, "finished")
    # get stats
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 0
    assert data["result"]["n_finished"] == 1
    assert data["result"]["n_setup"] == 0


# Test known demo data
@pytest.mark.parametrize("subset", ["plugin", "benchmark"])
def test_demo_data_project(setup, subset):
    client, _, _ = setup
    status_code, data = au.get_demo_data(client, subset)
    assert status_code == 200
    assert isinstance(data["result"], list)


# Test unknown demo data
def test_unknown_demo_data_project(setup):
    client, _, _ = setup
    status_code, data = au.get_demo_data(client, "abcdefg")
    assert status_code == 400
    assert data["message"] == "demo-data-loading-failed"


# Test uploading benchmark data to a project
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_upload_benchmark_data_to_project(setup, upload_data):
    client, _, project = setup
    status_code, data = au.upload_data_to_project(client, project, data=upload_data)
    assert status_code == 200
    if not current_app.config.get("LOGIN_DISABLED"):
        assert data["project_id"] == project.project_id
    else:
        assert data["project_id"] == project.config.get("id")


# Test getting the data after an upload
@pytest.mark.parametrize("upload_data", UPLOAD_DATA)
def test_get_project_data(setup, upload_data):
    client, _, project = setup
    au.upload_data_to_project(client, project, data=upload_data)
    status_code, data = au.get_project_data(client, project)
    assert status_code == 200
    assert data["filename"] == misc.extract_filename_stem(upload_data)


# Test get dataset writer
def test_get_dataset_writer(setup):
    client, _, project = setup
    # upload data
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get dataset writer
    status_code, data = au.get_project_dataset_writer(client, project)
    assert status_code == 200
    assert isinstance(data["result"], list)


# Test updating a project
def test_update_project_info(setup):
    client, _, project = setup
    # update data
    new_mode = "oracle"
    new_name = "new name"
    new_authors = "new authors"
    new_description = "new description"
    # request
    status_code, data = au.update_project(
        client,
        project,
        name=new_name,
        mode=new_mode,
        authors=new_authors,
        description=new_description,
    )
    assert status_code == 200
    assert data["authors"] == new_authors
    assert data["description"] == new_description
    assert data["mode"] == new_mode
    assert data["name"] == new_name


# Test search data
def test_search_data(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # search
    status_code, data = au.search_project_data(
        client, project, query="Software&n_max=10"
    )
    assert status_code == 200
    assert "result" in data
    assert isinstance(data["result"], list)
    assert len(data["result"]) <= 10


# Test get a selection of random papers to find exclusions
def test_random_prior_papers(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get random selection
    status_code, data = au.get_prior_random_project_data(client, project)
    assert status_code == 200
    assert "result" in data
    assert isinstance(data["result"], list)
    assert len(data["result"]) > 0


# Test labeling of prior data
@pytest.mark.parametrize("label", [0, 1])
def test_label_item(setup, label):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label
    status_code, data = au.label_random_project_data_record(client, project, label)
    assert status_code == 200
    assert data["success"]


# Test getting labeled records
def test_get_labeled_project_data(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label a random record
    au.label_random_project_data_record(client, project, 1)
    # collect labeled records
    status_code, data = au.get_labeled_project_data(client, project)
    assert status_code == 200
    assert "result" in data
    assert isinstance(data["result"], list)
    assert len(data["result"]) == 1


# Test getting labeled records stats
def test_get_labeled_stats(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # collect stats
    status_code, data = au.get_labeled_project_data_stats(client, project)

    assert status_code == 200
    assert isinstance(data, dict)
    assert data["n"] == 2
    assert data["n_exclusions"] == 1
    assert data["n_inclusions"] == 1
    assert data["n_prior"] == 2


# Test listing the available algorithms
def test_list_algorithms(setup):
    client, _, _ = setup
    status_code, data = au.get_project_algorithms_options(client)
    assert status_code == 200
    expected_keys = [
        "balance_strategy",
        "classifier",
        "feature_extraction",
        "query_strategy",
    ]
    for key in expected_keys:
        assert key in data.keys()
        assert isinstance(data[key], list)
        for item in data[key]:
            assert "name" in item.keys()
            assert "label" in item.keys()


# Test setting the algorithms
def test_set_project_algorithms(setup):
    client, _, project = setup
    data = misc.choose_project_algorithms()
    status_code, data = au.set_project_algorithms(client, project, data=data)
    assert status_code == 200
    assert data["success"]


# Test getting the project algorithms
def test_get_project_algorithms(setup):
    client, _, project = setup
    data = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data)
    # get the project algorithms
    status_code, resp_data = au.get_project_algorithms(client, project)
    assert status_code == 200
    assert resp_data["balance_strategy"] == data["balance_strategy"]
    assert resp_data["feature_extraction"] == data["feature_extraction"]
    assert resp_data["model"] == data["model"]
    assert resp_data["query_strategy"] == data["query_strategy"]


# Test starting the model
def test_start_and_model_ready(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # select a model
    data = misc.choose_project_algorithms()
    au.set_project_algorithms(client, project, data=data)
    # start the model
    status_code, data = au.start_project_algorithms(client, project)
    assert status_code == 200
    assert data["success"]
    # make sure model is done
    time.sleep(10)


# Test status of project
@pytest.mark.parametrize(
    ("state_name", "expected_state"),
    [
        ("creation", None),
        ("setup", "setup"),
        ("review", "review"),
        ("finish", "finished"),
    ],
)
def test_status_project(setup, state_name, expected_state):
    client, _, project = setup
    # call these progression steps
    if state_name in ["setup", "review", "finish"]:
        # upload dataset
        au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
        # label 2 records
        au.label_random_project_data_record(client, project, 1)
        au.label_random_project_data_record(client, project, 0)
        # select a model
        data = misc.choose_project_algorithms()
        au.set_project_algorithms(client, project, data=data)
    if state_name in ["review", "finish"]:
        # start the model
        au.start_project_algorithms(client, project)
        time.sleep(15)
    if state_name == "finish":
        # mark project as finished
        au.set_project_status(client, project, "finished")

    status_code, data = au.get_project_status(client, project)
    assert status_code == 200
    assert data["status"] == expected_state


# Test exporting the results
@pytest.mark.parametrize("format", ["csv", "tsv", "xlsx"])
def test_export_result(setup, format):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    status_code, _ = au.export_project_dataset(client, project, format)
    assert status_code == 200


# Test exporting the entire project
def test_export_project(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    status_code, _ = au.export_project(client, project)
    assert status_code == 200


# Test setting the project status
@pytest.mark.parametrize("status", ["review", "finished"])
def test_set_project_status(setup, status):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # when setting the status to "review", the project must have another
    # status then "review"
    if status == "review":
        au.set_project_status(client, project, "finished")
    # set project status
    status_code, data = au.set_project_status(client, project, status)
    assert status_code == 200
    assert data["success"]


# Test get progress info
def test_get_progress_info(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label 2 random records
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # get progress
    status_code, data = au.get_project_progress(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert data["n_excluded"] == 1
    assert data["n_included"] == 1
    assert data["n_pool"] == data["n_papers"] - 2


# Test get progress density on the article
def test_get_progress_density(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # request progress density
    status_code, data = au.get_project_progress_density(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert isinstance(data["relevant"], list)
    assert isinstance(data["irrelevant"], list)


# Test progress recall
def test_get_progress_recall(setup):
    client, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get recall
    status_code, data = au.get_project_progress_recall(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert isinstance(data["asreview"], list)
    assert isinstance(data["random"], list)


# Test retrieve documents in order to review
def test_retrieve_document_for_review(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    status_code, data = au.get_project_current_document(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert not data["pool_empty"]
    assert isinstance(data["result"], dict)
    assert isinstance(data["result"]["doc_id"], int)


# Test label a document after the model has been started
def test_label_a_document_with_running_model(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    _, data = au.get_project_current_document(client, project)
    # get id
    doc_id = data["result"]["doc_id"]
    # label it
    status_code, data = au.label_project_record(
        client, project, doc_id, label=1, prior=0, note="note"
    )
    assert status_code == 200
    assert data["success"]
    time.sleep(10)


# Test update label of a document after the model has been started
def test_update_label_of_document_with_running_model(setup):
    client, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    _, data = au.get_project_current_document(client, project)
    # get id
    doc_id = data["result"]["doc_id"]
    # label it
    au.label_project_record(client, project, doc_id, label=1, prior=0, note="note")
    # change label
    status_code, data = au.update_label_project_record(
        client, project, doc_id, label=0, prior=0, note="changed note"
    )
    assert status_code == 200
    assert data["success"]
    time.sleep(10)


# Test deleting a project
def test_delete_project(setup):
    client, _, project = setup
    # delete project
    status_code, data = au.delete_project(client, project)
    assert status_code == 200
    assert data["success"]


@pytest.mark.parametrize(
    "api_call",
    [
        au.get_all_projects,
        au.create_project,
        au.create_project_from_dict,
        au.update_project,
        au.upgrade_project,
        au.get_project_stats,
        au.get_demo_data,
        au.upload_data_to_project,
        au.get_project_data,
        au.get_project_dataset_writer,
        au.search_project_data,
        au.get_prior_random_project_data,
        au.label_project_record,
        au.update_label_project_record,
        au.get_labeled_project_data,
        au.get_labeled_project_data_stats,
        au.get_project_algorithms_options,
        au.set_project_algorithms,
        au.get_project_algorithms,
        au.start_project_algorithms,
        au.get_project_status,
        au.set_project_status,
        au.export_project_dataset,
        au.export_project,
        au.get_project_progress,
        au.get_project_progress_density,
        au.get_project_progress_recall,
        au.get_project_current_document,
        au.delete_project,
    ],
)
def test_unauthorized_use_of_api_calls(setup, api_call):
    client, user, project = setup
    if not current_app.config.get("LOGIN_DISABLED"):
        # signout the client
        au.signout_user(client)
        # inspect function
        sig = inspect.signature(api_call)
        # form parameters
        parms = []
        for par in sig.parameters.keys():
            annotation = sig.parameters[par].annotation
            if annotation == FlaskClient:
                parms.append(client)
            elif annotation == Union[Project, ASReviewProject]:
                parms.append(project)
            elif annotation == int:
                parms.append(1)
            elif annotation == str:
                parms.append("abc")
            elif annotation == dict:
                parms.append({})

        # make the api call
        status_code, data = api_call(*parms)
        assert status_code == 401
    else:
        # no asserts in an unauthenticated app
        pass
