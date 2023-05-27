# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import time
from pathlib import Path

from asreview.project import PATH_FEATURE_MATRICES
from asreview.project import _create_project_id
from asreview.utils import asreview_path


def test_get_projects(setup_teardown_unauthorized):
    """Test get projects."""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_init_project(setup_teardown_unauthorized):
    """Test create project. Check name of created subfolder"""
    _, client = setup_teardown_unauthorized

    response = client.post(
        "/api/projects/info",
        data={
            "mode": "explore",
            "name": "project_id",
            "authors": "name",
            "description": "hello world",
        },
    )
    json_data = response.get_json()

    # make sure a folder is created
    project_id = json_data["id"]
    assert Path(asreview_path(), project_id).exists()
    assert Path(asreview_path(), project_id, "data").exists()
    assert Path(asreview_path(), project_id, "reviews").exists()
    assert Path(asreview_path(), project_id, PATH_FEATURE_MATRICES).exists()

    # test the response
    assert response.status_code == 201
    assert "name" in json_data
    assert isinstance(json_data, dict)


def test_upgrade_project_if_old(setup_teardown_unauthorized):
    """Test upgrade project if it is v0.x"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/upgrade_if_old")
    assert response.status_code == 400


def test_get_projects_stats(setup_teardown_unauthorized):
    """Test get dashboard statistics of all projects"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/stats")
    json_data = response.get_json()

    assert "n_in_review" in json_data["result"]
    assert "n_finished" in json_data["result"]
    assert isinstance(json_data["result"], dict)


def test_demo_data_project(setup_teardown_unauthorized):
    """Test retrieve plugin and benchmark datasets"""
    _, client = setup_teardown_unauthorized

    response_plugin = client.get("/api/datasets?subset=plugin")
    response_benchmark = client.get("/api/datasets?subset=benchmark")
    json_plugin_data = response_plugin.get_json()
    json_benchmark_data = response_benchmark.get_json()

    assert "result" in json_plugin_data
    assert "result" in json_benchmark_data
    assert isinstance(json_plugin_data["result"], list)
    assert isinstance(json_benchmark_data["result"], list)


def test_upload_data_to_project(setup_teardown_unauthorized):
    """Test add data to project."""
    _, client = setup_teardown_unauthorized

    response = client.post(
        "/api/projects/project-id/data", data={"benchmark": "benchmark:Hall_2012"}
    )
    assert response.status_code == 200


def test_get_project_data(setup_teardown_unauthorized):
    """Test get info on the data"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/data")
    json_data = response.get_json()
    assert json_data["filename"] == "Hall_2012"


def test_get_dataset_writer(setup_teardown_unauthorized):
    """Test get dataset writer"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/dataset_writer")
    json_data = response.get_json()
    assert isinstance(json_data["result"], list)


def test_update_project_info_no_name_change(setup_teardown_unauthorized):
    """Test update project info without changing the project name"""
    _, client = setup_teardown_unauthorized

    response = client.put(
        "/api/projects/project-id/info",
        data={
            "mode": "explore",
            "name": "project_id",
            "authors": "asreview team",
            "description": "hello world",
        },
    )
    assert response.status_code == 200


def test_update_project_info_with_name_change(setup_teardown_unauthorized):
    """Test update project info -with- changing the project name"""
    _, client = setup_teardown_unauthorized

    new_project_name = "another_project"
    old_project_id = "project-id"

    response = client.put(
        f"/api/projects/{old_project_id}/info",
        data={
            "mode": "explore",
            "name": new_project_name,
            "authors": "asreview team",
            "description": "hello world",
        },
    )
    assert response.status_code == 200

    # check if folder has been renamed
    project_id = _create_project_id(new_project_name)
    assert Path(asreview_path(), project_id).exists()
    assert Path(asreview_path(), project_id, "data").exists()
    assert Path(asreview_path(), project_id, "reviews").exists()
    assert Path(asreview_path(), project_id, PATH_FEATURE_MATRICES).exists()

    # check if old folder is removed
    assert Path(asreview_path(), old_project_id).exists() is False


def test_get_project_info(setup_teardown_unauthorized):
    """Test get info on the project, start with a new project"""
    _, client = setup_teardown_unauthorized

    # since we have renamed the previous project we have to
    # add the old project again
    client.post(
        "/api/projects/info",
        data={
            "mode": "explore",
            "name": "project_id",
            "authors": "asreview team",
            "description": "hello world",
        },
    )
    client.post(
        "/api/projects/project-id/data", data={"benchmark": "benchmark:Hall_2012"}
    )

    # call the info method
    response = client.get("/api/projects/project-id/info")
    json_data = response.get_json()
    assert json_data["authors"] == "asreview team"
    assert json_data["dataset_path"] == "Hall_2012.csv"


def test_search_data(setup_teardown_unauthorized):
    """Test search for papers"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/search?q=Software&n_max=10")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_random_prior_papers(setup_teardown_unauthorized):
    """Test get a selection of random papers to find exclusions"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/prior_random")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_label_item(setup_teardown_unauthorized):
    """Test label item"""
    _, client = setup_teardown_unauthorized

    response_irrelevant = client.post(
        "/api/projects/project-id/record/5509",
        data={"doc_id": 5509, "label": 0, "is_prior": 1},
    )
    response_relevant = client.post(
        "/api/projects/project-id/record/58",
        data={"doc_id": 58, "label": 1, "is_prior": 1},
    )

    assert response_irrelevant.status_code == 200
    assert response_relevant.status_code == 200


def test_get_labeled(setup_teardown_unauthorized):
    """Test get all papers classified as labeled documents"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/labeled")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_get_labeled_stats(setup_teardown_unauthorized):
    """Test get all papers classified as prior documents"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/labeled_stats")
    json_data = response.get_json()

    assert isinstance(json_data, dict)
    assert "n_prior" in json_data
    assert json_data["n_prior"] == 2


def test_list_algorithms(setup_teardown_unauthorized):
    """Test get list of active learning models"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/algorithms")
    json_data = response.get_json()

    assert "classifier" in json_data.keys()
    assert "name" in json_data["classifier"][0].keys()
    assert isinstance(json_data, dict)


def test_set_algorithms(setup_teardown_unauthorized):
    """Test set active learning model"""
    _, client = setup_teardown_unauthorized

    response = client.post(
        "/api/projects/project-id/algorithms",
        data={
            "model": "svm",
            "query_strategy": "max_random",
            "balance_strategy": "double",
            "feature_extraction": "tfidf",
        },
    )
    assert response.status_code == 200


def test_get_algorithms(setup_teardown_unauthorized):
    """Test active learning model selection"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/algorithms")
    json_data = response.get_json()

    assert "model" in json_data
    assert "query_strategy" in json_data
    assert "svm" in json_data["model"]
    assert "random" in json_data["query_strategy"]
    assert isinstance(json_data, dict)


def test_start_and_model_ready(setup_teardown_unauthorized):
    """Test start training the model"""
    _, client = setup_teardown_unauthorized

    response = client.post("/api/projects/project-id/start")
    assert response.status_code == 200

    # wait until the model is ready
    time.sleep(10)

    response = client.get("/api/projects/project-id/status")
    json_data = response.get_json()
    assert json_data["status"] == "review"


def test_export_result(setup_teardown_unauthorized):
    """Test export result"""
    _, client = setup_teardown_unauthorized

    response_csv = client.get("/api/projects/project-id/export_dataset?file_format=csv")
    response_tsv = client.get("/api/projects/project-id/export_dataset?file_format=tsv")
    response_excel = client.get(
        "/api/projects/project-id/export_dataset?file_format=xlsx"
    )
    assert response_csv.status_code == 200
    assert response_tsv.status_code == 200
    assert response_excel.status_code == 200


def test_export_project(setup_teardown_unauthorized):
    """Test export the project file"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/export_project")
    assert response.status_code == 200


def test_finish_project(setup_teardown_unauthorized):
    """Test mark a project as finished or not"""
    _, client = setup_teardown_unauthorized

    response = client.put(
        "/api/projects/project-id/status", data={"status": "finished"}
    )
    assert response.status_code == 200

    response = client.put("/api/projects/project-id/status", data={"status": "review"})
    assert response.status_code == 200

    response = client.put(
        "/api/projects/project-id/status", data={"status": "finished"}
    )
    assert response.status_code == 200


def test_get_progress_info(setup_teardown_unauthorized):
    """Test get progress info on the article"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/progress")
    json_data = response.get_json()
    assert isinstance(json_data, dict)


def test_get_progress_density(setup_teardown_unauthorized):
    """Test get progress density on the article"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/progress_density")
    json_data = response.get_json()
    assert "relevant" in json_data
    assert "irrelevant" in json_data
    assert isinstance(json_data, dict)


def test_get_progress_recall(setup_teardown_unauthorized):
    """Test get cumulative number of inclusions by ASReview/at random"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/progress_recall")
    json_data = response.get_json()
    assert "asreview" in json_data
    assert "random" in json_data
    assert isinstance(json_data, dict)


def test_get_document(setup_teardown_unauthorized):
    """Test retrieve documents in order of review"""
    _, client = setup_teardown_unauthorized

    response = client.get("/api/projects/project-id/get_document")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data, dict)

    doc_id = json_data["result"]["doc_id"]

    # Test retrieve classification result
    response = client.post(
        f"/api/projects/project-id/record/{doc_id}",
        data={
            "doc_id": doc_id,
            "label": 1,
        },
    )
    assert response.status_code == 200

    # Test update classification result
    response = client.put(
        f"/api/projects/project-id/record/{doc_id}",
        data={
            "doc_id": doc_id,
            "label": 0,
        },
    )
    assert response.status_code == 200
    time.sleep(10)


def test_delete_project(setup_teardown_unauthorized):
    """Test get info on the article"""
    _, client = setup_teardown_unauthorized

    response = client.delete("/api/projects/project-id/delete")
    assert response.status_code == 200
