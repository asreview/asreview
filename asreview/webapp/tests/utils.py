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

import json
from urllib.request import urlopen


def retrieve_project_url_github():
    '''Retrieve .asreview file url from
    asreview-project-files-testing GitHub repository'''

    repo = "/asreview/asreview-project-files-testing"
    repo_api_url = "https://api.github.com/repos" + repo + "/git/trees/master"
    repo_url = "https://github.com" + repo + "/blob/master"
    file_type = "startreview.asreview?raw=true"

    json_file = json.loads(urlopen(repo_api_url).read().decode("utf-8"))["tree"]

    version_tags = []
    project_urls = []

    for file in json_file:
        if file["type"] == "tree":
            version_tags.append(file["path"])

    for tag in version_tags:
        file_version = f"/{tag}/asreview-project-{tag.replace('.', '-')}-"
        project_urls.append(repo_url + file_version + file_type)

    return project_urls
