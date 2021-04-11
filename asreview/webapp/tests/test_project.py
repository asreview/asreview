# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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
import re
import pytest
import requests
from io import BytesIO
from urllib.request import urlopen


project_urls = []

# Retrieve urls to .asreview files exported in previous versions
link_project_file = "https://github.com/asreview/" \
    + "asreview-project-files-testing/tree/master/asreview_file"
html_project_file = requests.get(link_project_file).text
HTML_TAG_ASREVIEW = re.compile(r"<a[^<>]+?href=([\'\"])(.*\.asreview)\1")

for match in HTML_TAG_ASREVIEW.findall(html_project_file):
    project_urls.append("https://github.com" + match[1] + "?raw=true")


def test_retrieve_project_file():
    """Test retrieve project files from GitHub"""

    if not project_urls:
        assert False


@pytest.mark.parametrize("url", project_urls)
def test_project_file(tmp_path, client, url):
    """Test import and continue a project created in previous versions."""

    # change default folder for projects
    os.environ["ASREVIEW_PATH"] = str(tmp_path)

    # Test import uploaded project
    response_import = client.post("/api/project/import_project", data={
        "file": (BytesIO(urlopen(url).read()), "project.asreview")
    })
    json_data_import = response_import.get_json()
    assert response_import.status_code == 200

    project_path = f"/api/project/{json_data_import['id']}"

    # Test get projects
    response_projects = client.get("/api/projects")
    json_data_projects = response_projects.get_json()
    assert "result" in json_data_projects
    assert any(
        item["id"] == f"{json_data_import['id']}"
        for item in json_data_projects["result"]
    )

    # Test get progress info on the article
    response_progress = client.get(f"{project_path}/progress")
    json_data_progress = response_progress.get_json()
    assert isinstance(json_data_progress, dict)

    # Test get progress history on the article
    response_progress_history = client.get(f"{project_path}/progress_history")
    json_data_progress_history = response_progress_history.get_json()
    assert isinstance(json_data_progress_history, list)

    # Test get cumulative number of inclusions by ASReview/at random
    response_progress_efficiency = client.get(f"{project_path}/progress_efficiency")
    json_data_progress_efficiency = response_progress_efficiency.get_json()
    assert isinstance(json_data_progress_efficiency, list)

    # Test retrieve documents in order of review
    response_get_document = client.get(f"{project_path}/get_document")
    json_data_get_document = response_get_document.get_json()
    assert "result" in json_data_get_document
    assert isinstance(json_data_get_document, dict)

    # Test retrieve classification result
    response_classify_instance = client.post(f"{project_path}/record/<doc_id>", data={
        "doc_id": 99,
        "label": 1,
    })
    assert response_classify_instance.status_code == 200

    # Test update classification result
    response_update_classify = client.put(f"{project_path}/record/<doc_id>", data={
        "doc_id": 99,
        "label": 0,
    })
    assert response_update_classify.status_code == 200

    # Test retrieve review history
    response_prior = client.get(f"{project_path}/prior")
    json_data_prior = response_prior.get_json()
    assert "result" in json_data_prior
    assert isinstance(json_data_prior["result"], list)

    # Test export result
    response_export_result_excel = client.get(f"{project_path}/export?file_type=excel")
    response_export_result_csv = client.get(f"{project_path}/export?file_type=csv")
    response_export_result_tsv = client.get(f"{project_path}/export?file_type=tsv")
    assert response_export_result_excel.status_code == 200
    assert response_export_result_csv.status_code == 200
    assert response_export_result_tsv.status_code == 200

    # Test export project
    response_export_project = client.get(f"{project_path}/export_project")
    assert response_export_project.status_code == 200

    # Test finish project
    response_finish = client.get(f"{project_path}/finish")
    assert response_finish.status_code == 200

    # Test delete project
    response_delete = client.delete(f"{project_path}/delete")
    assert response_delete.status_code == 200
