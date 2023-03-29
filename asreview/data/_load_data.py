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

from pathlib import Path


from asreview.datasets import DatasetManager
from asreview.datasets import DatasetNotFoundError
from asreview.utils import is_url
from ._asreview_data import ASReviewData


def load_data(name, *args, **kwargs):
    """Load data from file, URL, or plugin.

    Parameters
    ----------
    name: str, pathlib.Path
        File path, URL, or alias of extension dataset.

    Returns
    -------
    asreview.ASReviewData:
        Inititalized ASReview data object.
    """

    # check is file or URL
    if is_url(name) or Path(name).exists():
        return ASReviewData.from_file(name, *args, **kwargs)

    # check if dataset is plugin dataset\
    try:
        dataset_path = DatasetManager().find(name).filepath
        return ASReviewData.from_file(dataset_path, *args, **kwargs)
    except DatasetNotFoundError:
        pass

    # Could not find dataset, return None.
    raise FileNotFoundError(
        f"File, URL, or dataset does not exist: '{name}'")
