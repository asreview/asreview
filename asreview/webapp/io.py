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

import logging

from asreview.project import ProjectNotFoundError
from asreview.project import is_project


def read_data(project, use_cache=True, save_cache=True):
    """Get ASReviewData object from file.

    Parameters
    ----------
    project_path: str, iterable
        The project identifier.
    use_cache: bool
        Use the pickle file if available.
    save_cache: bool
        Save the file to a pickle file if not available.

    Returns
    -------
    ASReviewData:
        The data object for internal use in ASReview.

    """

    logging.warning(
        "read_data is deprecated, use ASReviewProject.read_data instead. "
        "read_data will be removed in version 2.0."
    )

    if not is_project(project.project_path):
        raise ProjectNotFoundError()

    return project.read_data(use_cache=use_cache, save_cache=save_cache)
