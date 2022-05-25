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

import os
from io import BytesIO
from urllib.request import urlopen

import pytest

from asreview.webapp.tests.utils import retrieve_project_url_github

# Retrieve urls to .asreview files exported from previous versions
project_urls = retrieve_project_url_github()


@pytest.mark.parametrize("url", project_urls)
def test_project_file(tmp_path, client, url):
    """Test import and continue a project created in previous versions."""

    # change default folder for projects
    os.environ["ASREVIEW_PATH"] = str(tmp_path)

    # Test import uploaded project
    with urlopen(url) as project_file:
        response_import = client.post(
            "/api/projects/import_project",
            data={"file": (BytesIO(project_file.read()), "project.asreview")})
    json_data_import = response_import.get_json()
    assert response_import.status_code == 200

    project_id = json_data_import["id"]
    api_url = f"/api/projects/{project_id}"

    # Test get dashboard analytics
    response_stats = client.get("/api/projects/stats")
    json_data_stats = response_stats.get_json()

    assert "result" in json_data_stats
    assert "n_in_review" in json_data_stats["result"]
    assert "n_finished" in json_data_stats["result"]
    assert isinstance(json_data_stats["result"], dict)

    # Test get projects
    response_projects = client.get("/api/projects")
    json_data_projects = response_projects.get_json()
    assert "result" in json_data_projects
    assert any(item["id"] == project_id
               for item in json_data_projects["result"])

    # Test export project before upgrade
    response_export_old_project = client.get(f"{api_url}/export_project")
    assert response_export_old_project.status_code == 200

    # Test upgrade project if old
    response_upgrade_if_old = client.get(f"{api_url}/upgrade_if_old")
    assert response_upgrade_if_old.status_code == 200

    # Test get info on the project
    response_get_info = client.get(f"{api_url}/info")
    json_data_get_info = response_get_info.get_json()
    assert json_data_get_info["id"] == project_id

    # Test get dataset writer
    response_get_writer = client.get(f"{api_url}/dataset_writer")
    json_data_get_writer = response_get_writer.get_json()
    assert isinstance(json_data_get_writer["result"], list)

    # Test update info of the project
    response_update_info = client.put(f"{api_url}/info",
                                      data={
                                          "mode": "explore",
                                          "name": json_data_get_info["name"],
                                          "authors":
                                          json_data_get_info["authors"],
                                          "description": "Hoi Elas"
                                      })
    assert response_update_info.status_code == 200

    # Test get progress info on the article
    response_progress = client.get(f"{api_url}/progress")
    json_data_progress = response_progress.get_json()
    assert isinstance(json_data_progress, dict)

    # Test get progress density of the project
    response_progress_density = client.get(f"{api_url}/progress_density")
    json_data_progress_density = response_progress_density.get_json()
    assert "relevant" in json_data_progress_density
    assert "irrelevant" in json_data_progress_density
    assert isinstance(json_data_progress_density, dict)

    # Test get cumulative number of inclusions by ASReview/at random
    response_progress_recall = client.get(f"{api_url}/progress_recall")
    json_data_progress_recall = response_progress_recall.get_json()
    assert "asreview" in json_data_progress_recall
    assert "random" in json_data_progress_recall
    assert isinstance(json_data_progress_recall, dict)

    # Test retrieve documents in order of review
    response_get_document = client.get(f"{api_url}/get_document")
    json_data_get_document = response_get_document.get_json()
    assert "result" in json_data_get_document
    assert isinstance(json_data_get_document, dict)

    # get doc_id from the queue and label the item
    doc_id = json_data_get_document["result"]["doc_id"]

    # Test retrieve classification result
    response_classify_instance = client.post(f"{api_url}/record/{doc_id}",
                                             data={
                                                 "doc_id": doc_id,
                                                 "label": 1,
                                             })
    assert response_classify_instance.status_code == 200

    # Test update classification result
    response_update_classify = client.put(f"{api_url}/record/{doc_id}",
                                          data={
                                              "doc_id": doc_id,
                                              "label": 0,
                                          })
    assert response_update_classify.status_code == 200

    # Test retrieve review history
    response_prior = client.get(f"{api_url}/labeled")
    json_data_prior = response_prior.get_json()
    assert "result" in json_data_prior
    assert isinstance(json_data_prior["result"], list)

    # Test export result
    response_export_result_csv = client.get(
        f"{api_url}/export_dataset?file_format=csv")
    response_export_result_tsv = client.get(
        f"{api_url}/export_dataset?file_format=tsv")
    response_export_result_excel = client.get(
        f"{api_url}/export_dataset?file_format=xlsx")
    assert response_export_result_csv.status_code == 200
    assert response_export_result_tsv.status_code == 200
    assert response_export_result_excel.status_code == 200

    # Test export project
    response_export_project = client.get(f"{api_url}/export_project")
    assert response_export_project.status_code == 200

    # Test get project status
    response_status = client.get(f"{api_url}/status")
    json_data_status = response_status.get_json()
    assert "status" in json_data_status
    assert isinstance(json_data_status, dict)

    # Test mark project as finished
    response_finish = client.put(f"{api_url}/status",
                                 data={"status": "finished"})
    assert response_finish.status_code == 200

    # Test delete project
    response_delete = client.delete(f"{api_url}/delete")
    assert response_delete.status_code == 200
