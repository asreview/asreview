import json
import logging

from asreview.datasets import DatasetManager, BaseVersionedDataSet
from asreview.utils import is_iterable
from asreview.webapp.utils.io import read_data


def search_data(project_id, q, n_max=100):
    """Get the title/authors/abstract for a paper."""

    # read the dataset
    as_data = read_data(project_id)

    # search for the keywords
    paper_ids = as_data.fuzzy_find(q, max_return=n_max, exclude=[])

    # return full information on the records
    return as_data.record(paper_ids)


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
