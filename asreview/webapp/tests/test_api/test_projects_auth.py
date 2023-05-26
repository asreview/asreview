import random
import time
from inspect import getfullargspec
from pathlib import Path

import pytest

import asreview.webapp.tests.utils.api_utils as au
import asreview.webapp.tests.utils.crud as crud
import asreview.webapp.tests.utils.misc as misc
from asreview.data.base import _get_filename_from_url
from asreview.utils import asreview_path
from asreview.webapp import DB
from asreview.webapp.tests.utils.config_parser import get_user

# NOTE: I don't see a plugin that can be used for testing
# purposes
UPLOAD_DATA = [
    {"benchmark": "benchmark:Hall_2012"},
    {"url": "https://raw.githubusercontent.com/asreview/asreview/master/tests/demo_data/generic_labels.csv"}
]

# NOTE: the setup fixture entails: 3 users, user1 is signed in,
# user1 has one project made

# QUESTIONS: maybe we should consider 404's when the code hits
# an Exception, I think an API should do that. For instance: the webapp
# ensures that we choose the correct feature extraction based on the
# model or vice versa, but if you go in without our web-app with the
# wrong combination you just get an Exception. Or setting the project
# status from review to review (also throws an exception, but the front-end
# will never be notified of that ??)

# Test getting all projects
def test_get_projects(setup):
    client, user1, _, _, project = setup
    status_code, data = au.get_all_projects(client)
    assert status_code == 200
    assert len(data["result"]) == 1
    found_project = data["result"][0]
    assert found_project["id"] == project.project_id
    assert found_project["owner_id"] == user1.id


# Test create a project
def test_create_projects(setup):
    client, user1, _, _, _ = setup
    project_name = "new_project"

    status_code, data = au.create_project(client, project_name)
    assert status_code == 201
    assert data["name"] == project_name


# Test upgrading a post v0.x project
def test_try_upgrade_a_modern_project(setup):
    client, _, _, _, project = setup
    # verify version
    data = misc.read_project_file(project)
    assert not data["version"].startswith("0.")

    status_code, data = au.upgrade_project(client, project)
    assert status_code == 400
    assert data["message"] == "Can only convert v0.x projects."


# Test upgrading a v0.x project
def test_upgrade_an_old_project(setup):
    client, _, _, _, project = setup
    # substitute the current project folder for an old type of folder
    misc.subs_for_legacy_project_folder(project)
    # try to convert
    status_code, data = au.upgrade_project(client, project)
    assert status_code == 200
    assert data["success"]


# Test get stats in setup state
def test_get_projects_stats_setup_stage(setup):
    client, _, _, _, _ = setup
    status_code, data = au.get_project_stats(client)
    assert status_code == 200
    assert isinstance(data["result"], dict)
    assert data["result"]["n_in_review"] == 0
    assert data["result"]["n_finished"] == 0
    assert data["result"]["n_setup"] == 1


# Test get stats in review state
def test_get_projects_stats_review_stage(setup):
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    client, _, _, _, _ = setup
    status_code, data = au.get_demo_data(client, subset)
    assert status_code == 200
    assert isinstance(data["result"], list)


# Test unknown demo data
def test_unknown_demo_data_project(setup):
    client, _, _, _, _ = setup
    status_code, data = au.get_demo_data(client, "abcdefg")
    assert status_code == 400
    assert data["message"] == "demo-data-loading-failed"


# Test uploading benchmark data to a project
@pytest.mark.parametrize(
    "upload_data",
    UPLOAD_DATA
)
def test_upload_benchmark_data_to_project(setup, upload_data):
    client, _, _, _, project = setup
    status_code, data = au.upload_data_to_project(
        client,
        project,
        data=upload_data
    )
    assert status_code == 200
    assert data["success"]


# Test getting the data after an upload
@pytest.mark.parametrize(
    "upload_data",
    UPLOAD_DATA
)
def test_get_project_data(setup, upload_data):
    client, _, _, _, project = setup
    au.upload_data_to_project(
        client,
        project,
        data=upload_data
    )    
    status_code, data = au.get_project_data(client, project)
    assert status_code == 200
    assert data["filename"] == misc.extract_filename_stem(upload_data)


# Test get dataset writer
def test_get_dataset_writer(setup):
    client, _, _, _, project = setup
    # upload data
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get dataset writer
    status_code, data = au.get_project_dataset_writer(client, project)
    assert status_code == 200
    assert isinstance(data["result"], list)


# Test updating a project
def test_update_project_info(setup):
    client, _, _, _, project = setup
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
        description=new_description
    )
    assert status_code == 200
    assert data["authors"] == new_authors
    assert data["description"] == new_description
    assert data["mode"] == new_mode
    assert data["name"] == new_name


# Test search data
def test_search_data(setup):
    client, _, _, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # search
    status_code, data = au.search_project_data(
        client,
        project,
        query="Software&n_max=10"
    )
    assert status_code == 200
    assert "result" in data
    assert isinstance(data["result"], list)
    assert len(data["result"]) <= 10


# Test get a selection of random papers to find exclusions
def test_random_prior_papers(setup):
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # label
    status_code, data = au.label_random_project_data_record(
        client,
        project,
        label
    )
    assert status_code == 200
    assert data["success"]


# Test getting labeled records
def test_get_labeled_project_data(setup):
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    client, _, _, _, _ = setup
    status_code, data = au.get_project_algorithms_options(client)
    assert status_code == 200
    expected_keys = [
        "balance_strategy",
        "classifier",
        "feature_extraction",
        "query_strategy"
    ]
    for key in expected_keys:
        assert key in data.keys()
        assert isinstance(data[key], list)
        for item in data[key]:
            assert "name" in item.keys()
            assert "label" in item.keys()


# Test setting the algorithms
def test_set_project_algorithms(setup):
    client, _, _, _, project = setup
    data = misc.choose_project_algorithms()
    status_code, data = au.set_project_algorithms(client, project, data=data)
    assert status_code == 200
    assert data["success"]


# Test getting the project algorithms
def test_get_project_algorithms(setup):
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    "state_data",
    [
        ("creation", None),
        ("setup", "setup"),
        ("review", "review"),
        ("finish", "finished")

    ]
)
def test_status_project(setup, state_data):
    client, _, _, _, project = setup
    # unpack the state_data
    state_name, expected_state = state_data
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
        time.sleep(10)
    if state_name == "finish":
        # mark project as finished
        au.set_project_status(client, project, "finished")

    status_code, data = au.get_project_status(client, project)
    assert status_code == 200
    assert data["status"] == expected_state


# Test exporting the results
@pytest.mark.parametrize("format", ["csv", "tsv", "xlsx"])
def test_export_result(setup, format):
    client, _, _, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    au.label_random_project_data_record(client, project, 1)
    au.label_random_project_data_record(client, project, 0)
    # request
    status_code, _ = au.export_project_dataset(client, project, format)
    assert status_code == 200


# Test exporting the entire project
def test_export_project(setup):
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
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
    client, _, _, _, project = setup
    # upload dataset
    au.upload_data_to_project(client, project, data=UPLOAD_DATA[0])
    # get recall
    status_code, data = au.get_project_progress_recall(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert isinstance(data["asreview"], list)
    assert isinstance(data["random"], list)


# Test retrieve documents in order to review
def test_get_current_document(setup):
    client, _, _, _, project = setup
    # start the show
    au.upload_label_set_and_start_model(client, project, UPLOAD_DATA[0])
    # get a document
    status_code, data = au.get_project_current_document(client, project)
    assert status_code == 200
    assert isinstance(data, dict)
    assert not data["pool_empty"]
    assert isinstance(data["result"], dict)
    assert isinstance(data["result"]["doc_id"], int)

    # assert "result" in json_data
    # assert isinstance(json_data, dict)

    # doc_id = json_data["result"]["doc_id"]

    # # Test retrieve classification result
    # response = client.post(
    #     f"/api/projects/{project.project_id}/record/{doc_id}",
    #     data={
    #         "doc_id": doc_id,
    #         "label": 1,
    #     },
    # )
    # assert response.status_code == 200

    # # Test update classification result
    # response = client.put(
    #     f"/api/projects/{project.project_id}/record/{doc_id}",
    #     data={
    #         "doc_id": doc_id,
    #         "label": 0,
    #     },
    # )
    # assert response.status_code == 200

    # time.sleep(10)

    













