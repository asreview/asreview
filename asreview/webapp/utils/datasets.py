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
from asreview.utils import is_iterable
from asreview.webapp.utils.io import read_data


def get_dataset_metadata(exclude=None, include=None):

    manager = DatasetManager()
    groups = manager.groups.copy()

    if exclude is not None:

        # make iterable if not the case
        if not is_iterable(exclude):
            exclude = [exclude]

        # pop items
        for group_id in exclude:
            try:
                groups.remove(group_id)
            except ValueError:
                pass

    if include is not None:

        # make iterable if not the case
        if not is_iterable(include):
            include = [include]

        # pop items
        for group_id in groups.copy():
            if group_id not in include:
                groups.remove(group_id)

    # get datasets
    all_datasets = manager.list(
        group_name=groups,
        latest_only=False,
        raise_on_error=True
    )

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
                result_datasets.append(dataset.to_dict())

    return result_datasets
