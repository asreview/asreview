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


def test_get_projects(client):
    """Test get projects."""
    response = client.get("/api/projects")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)


def test_create_project(tmp_path, client):
    """Test create project."""

    os.environ["ASREVIEW_PATH"] = str(tmp_path)

    response = client.post("/api/project/info", data={
        "name": "project_id",
        "authors": "name",
        "description": "hello world"
    })
    json_data = response.get_json()

    assert "name" in json_data
    assert isinstance(json_data, dict)

    response = client.get("/api/projects")
    json_data = response.get_json()

    response = client.post("/api/project/project-id/data", data={
        "benchmark": "benchmark:Hall_2012"
    })
    assert response.status_code == 200

    response = client.get("/api/project/project-id/info")
    json_data = response.get_json()
    assert json_data["dataset_path"] == "Hall_2012.csv"
