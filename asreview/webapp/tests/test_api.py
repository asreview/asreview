# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

import os
import time
import pytest


def test_get_projects(client):
    """Test get projects."""

    response = client.get("/api/projects")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_init_project(tmp_path, client):
    """Test create project."""

    # change default folder for projects
    os.environ["ASREVIEW_PATH"] = str(tmp_path)

    response = client.post("/api/project/info", data={
        "name": "project id",
        "authors": "name",
        "description": "hello world"
    })
    json_data = response.get_json()

    assert response.status_code == 201
    assert "name" in json_data
    assert isinstance(json_data, dict)


def test_demo_data_project(client):
    """Test retrieve plugin and benchmark datasets"""

    response_plugin = client.get("/api/datasets?subset=plugin")
    response_benchmark = client.get("/api/datasets?subset=benchmark")
    json_plugin_data = response_plugin.get_json()
    json_benchmark_data = response_benchmark.get_json()

    assert "result" in json_plugin_data
    assert "result" in json_benchmark_data
    assert isinstance(json_plugin_data["result"], list)
    assert isinstance(json_benchmark_data["result"], list)


def test_upload_data_to_project(client):
    """Test add data to project."""

    response = client.post("/api/project/project-id/data", data={
        "benchmark": "benchmark:Hall_2012"
    })
    assert response.status_code == 200


def test_get_project_data(client):
    """Test get info on the data"""

    response = client.get("/api/project/project-id/data")
    json_data = response.get_json()
    assert json_data["filename"] == "Hall_2012"


def test_update_project_info(client):
    """Test update project info"""

    response = client.put("/api/project/project-id/info", data={
        "name": "project id",
        "authors": "asreview team",
        "description": "hello world"
    })
    assert response.status_code == 200


def test_get_project_info(client):
    """Test get info on the project"""

    response = client.get("/api/project/project-id/info")
    json_data = response.get_json()
    assert json_data["authors"] == "asreview team"
    assert json_data["dataset_path"] == "Hall_2012.csv"


def test_search_data(client):
    """Test search for papers"""

    response = client.get("/api/project/project-id/search?q=Software&n_max=10")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_random_prior_papers(client):
    """Test get a selection of random papers to find exclusions"""

    response = client.get("/api/project/project-id/prior_random")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_label_item(client):
    """Test label item"""

    response_irrelevant = client.post("/api/project/project-id/labelitem", data={
        "doc_id": 5509,
        "label": 0,
        "is_prior": 1
    })
    response_relevant = client.post("/api/project/project-id/labelitem", data={
        "doc_id": 58,
        "label": 1,
        "is_prior": 1
    })

    assert response_irrelevant.status_code == 200
    assert response_relevant.status_code == 200


def test_get_prior(client):
    """Test get all papers classified as prior documents"""

    response = client.get("/api/project/project-id/prior")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_get_prior_stat(client):
    """Test get all papers classified as prior documents"""

    response = client.get("/api/project/project-id/prior_stats")
    json_data = response.get_json()

    assert "n_prior" in json_data
    assert isinstance(json_data, dict)


def test_list_algorithms(client):
    """Test get list of active learning models"""

    response = client.get("/api/algorithms")
    json_data = response.get_json()

    assert "classifier" in json_data.keys()
    assert "name" in json_data["classifier"][0].keys()
    assert isinstance(json_data, dict)


def test_set_algorithms(client):
    """Test set active learning model"""

    response = client.post("/api/project/project-id/algorithms", data={
        "model": "svm",
        "query_strategy": "random_max"
    })
    assert response.status_code == 200


def test_get_algorithms(client):
    """Test active learning model selection"""

    response = client.get("/api/project/project-id/algorithms")
    json_data = response.get_json()

    assert "model" in json_data
    assert "query_strategy" in json_data
    assert "svm" in json_data["model"]
    assert "random" in json_data["query_strategy"]
    assert isinstance(json_data, dict)


def test_start(client):
    """Test start training the model"""

    response = client.post("/api/project/project-id/start")
    assert response.status_code == 200


@pytest.mark.xfail(
    raises=KeyError,
    reason="status"
)
def test_init_model_ready(client):
    """Test check if trained model is available"""

    # wait the model ready
    time.sleep(8)

    response = client.get("/api/project/project-id/model/init_ready")
    json_data = response.get_json()

    assert json_data["status"] == 1


def test_clear_model_error(client):
    """Test clear model training error and retrain"""

    response_clear_error = client.delete("/api/project/project-id/model/clear_error")
    assert response_clear_error.status_code == 200

    # reset active learning model
    response_reset = client.post("/api/project/project-id/algorithms", data={
        "model": "svm",
        "query_strategy": "random"
    })
    assert response_reset.status_code == 200

    # retrain active learning model
    response_retrain = client.post("/api/project/project-id/start")
    assert response_retrain.status_code == 200

    # wait the model ready
    time.sleep(8)
    response_init_ready = client.get("/api/project/project-id/model/init_ready")
    json_data = response_init_ready.get_json()

    assert "status" in json_data
    assert json_data["status"] == 1


def test_export_result(client):
    """Test export result"""

    response_csv = client.get("/api/project/project-id/export?file_type=csv")
    response_tsv = client.get("/api/project/project-id/export?file_type=tsv")
    response_excel = client.get("/api/project/project-id/export?file_type=xlsx")
    response_ris = client.get("/api/project/project-id/export?file_type=ris")
    assert response_csv.status_code == 200
    assert response_tsv.status_code == 200
    assert response_excel.status_code == 200
    assert response_ris.status_code == 500


def test_export_project(client):
    """Test export the project file"""

    response = client.get("/api/project/project-id/export_project")
    assert response.status_code == 200


def test_finish_project(client):
    """Test mark a project as finished or not"""

    response = client.get("/api/project/project-id/finish")
    assert response.status_code == 200


def test_get_progress_info(client):
    """Test get progress info on the article"""

    response = client.get("/api/project/project-id/progress")
    json_data = response.get_json()
    assert isinstance(json_data, dict)


def test_get_progress_history(client):
    """Test get progress history on the article"""

    response = client.get("/api/project/project-id/progress_history")
    json_data = response.get_json()
    assert isinstance(json_data, list)


def test_get_progress_efficiency(client):
    """Test get cumulative number of inclusions by ASReview/at random"""

    response = client.get("/api/project/project-id/progress_efficiency")
    json_data = response.get_json()
    assert isinstance(json_data, list)


def test_classify_instance(client):
    """Test retrieve classification result"""

    response = client.post("/api/project/project-id/record/<doc_id>", data={
        "doc_id": 8208,
        "label": 1,
    })
    assert response.status_code == 200


def test_update_classify_instance(client):
    """Test update classification result"""

    response = client.put("/api/project/project-id/record/<doc_id>", data={
        "doc_id": 8208,
        "label": 0,
    })
    assert response.status_code == 200


def test_get_document(client):
    """Test retrieve documents in order of review"""

    response = client.get("/api/project/project-id/get_document")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data, dict)


def test_delete_project(client):
    """Test get info on the article"""

    response = client.delete("/api/project/project-id/delete")
    assert response.status_code == 200
