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

# from asreview.dataset import ASReviewData
from asreview.webapp.utils.paths import get_project_path


def check_dataset(fp):

    # try:
    #     ASReviewData.from_file(fp)
    # except Exception as err:
    #     raise Exception("Incorrect file format")
    pass


def is_project(project_id):

    if get_project_path(project_id).exists():
        return True

    return False
