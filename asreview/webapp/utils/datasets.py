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

from asreview.datasets import BaseVersionedDataSet
from asreview.datasets import DatasetManager
from asreview.search import fuzzy_find
from asreview.utils import is_iterable
from asreview.webapp.utils.io import read_data


def search_data(project_id, q, n_max=100):
    """Get the title/authors/abstract for a paper."""

    # read the dataset
    as_data = read_data(project_id)

    # search for the keywords
    result_idx = fuzzy_find(
        as_data, q, max_return=n_max, exclude=[], by_index=True)

    # return full information on the records
    return as_data.record(result_idx, by_index=True)


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


def get_dataset_metadata(exclude=None, include=None):
    all_datasets = DatasetManager().list(latest_only=False)
    if exclude is not None:
        if not is_iterable(exclude):
            exclude = [exclude]
        for group_id in exclude:
            all_datasets.pop(group_id, None)

    if include is not None:
        if not is_iterable(include):
            include = [include]
        for group_id in list(all_datasets):
            if group_id not in include:
                all_datasets.pop(group_id, None)

    result_datasets = []
    for group_id, data_list in all_datasets.items():
        for dataset in data_list:
            if isinstance(dataset, BaseVersionedDataSet):
                cur_data = []
                for vdata in dataset.datasets:
                    vdata.dataset_id = f"{group_id}:{vdata.dataset_id}"
                    cur_data.append(vdata.to_dict())
                result_datasets.append(cur_data)
            else:
                dataset.dataset_id = f"{group_id}:{dataset.dataset_id}"
                result_datasets.append([dataset.to_dict()])

    return result_datasets
