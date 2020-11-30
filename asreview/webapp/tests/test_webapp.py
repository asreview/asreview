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


def test_landing(client):
    """Test if index.html is available.

    This test will fail if build is missing. Please run
    `python setup.py compile_assets` first.
    """
    response = client.get("/")
    html = response.data.decode()

    assert "<title>ASReview - A tool for AI-assisted systematic reviews</title>" in html  # noqa


def test_boot(client):
    """Test if version number is available on boot."""
    response = client.get("/boot")
    json_data = response.get_json()

    assert "version" in json_data
    assert "status" in json_data
