# Copyright 2021 The ASReview Authors. All Rights Reserved.
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

from asreview.data.base import ASReviewData
from asreview.datasets import DataSetNotFoundError
from asreview.datasets import DatasetManager
from asreview.utils import is_url


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
    if Path(name).exists() or is_url(name):
        return ASReviewData.from_file(name, *args, **kwargs)

    # check if dataset is plugin dataset\
    try:
        dataset_path = DatasetManager().find(name).get()
        return ASReviewData.from_file(dataset_path, *args, **kwargs)
    except DataSetNotFoundError:
        pass

    # Could not find dataset, return None.
    raise FileNotFoundError(
        f"File, URL, or dataset does not exist: '{name}'")
