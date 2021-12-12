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

from asreview.datasets import DatasetManager
from asreview.utils import is_iterable
from asreview.webapp.utils.io import read_data


def get_data_statistics(project_id):
    """Get the title/authors/abstract for a paper."""

    # read the dataset
    as_data = read_data(project_id)

    result = {
        "n_rows": as_data.df.shape[0],
        "n_cols": as_data.df.shape[1],
    }

    # return full information on the records
    return result

