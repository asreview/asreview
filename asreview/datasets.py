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

import json
import socket
import warnings
from pathlib import Path

from asreview.utils import get_entry_points
from asreview.utils import pretty_format
from asreview.utils import is_iterable, is_url
from urllib.request import urlopen
from urllib.error import URLError


class DataSetNotFoundError(Exception):
    pass


def _create_dataset_from_meta(data):
    """Create dataset from entry."""
    if data["type"] == "versioned":
        datasets = []
        title = data["title"]
        base_dataset_id = data["base_id"]
        for config in data["configs"]:
            datasets.append(BaseDataSet.from_config(config))
        return BaseVersionedDataSet(base_dataset_id, datasets, title)
    elif data["type"] == "base":
        return BaseDataSet.from_config(data)
    else:
        raise ValueError(f"Dataset type {data['type']} unknown.")


def dataset_from_url(*args, **kwargs):
    # compat for asreview-covid<=0.9.1
    warnings.warn("Deprecated function.")


class BaseDataSet():
    def __init__(self, fp=None):
        """Initialize BaseDataSet which contains metadata.

        Parameters
        ----------
        fp: str
            Path to file, if None, either an url/fp has to be set manually.
        """

        if fp is not None:
            self.fp = fp
            self.id = Path(fp).name

        super(BaseDataSet, self).__init__()

    def __str__(self):
        return pretty_format(self.to_dict())

    @classmethod
    def from_config(cls, config_file):
        """Create DataSet from a JSON configuration file.

        Parameters
        ----------
        config_file: str, dict
            Can be a link to a config file or one on the disk.
            Another option is to supply a dictionary with the metadata.
        """
        if is_url(config_file):
            with urlopen(config_file) as f:
                config = json.loads(f.read().decode())
        elif isinstance(config_file, dict):
            config = config_file
        else:
            with open(config_file, "r") as f:
                config = json.load(f)

        # Set the attributes of the dataset.
        dataset = cls()
        for attr, val in config.items():
            setattr(dataset, attr, val)
        return dataset

    @property
    def aliases(self):
        """Can be overriden by setting it manually."""
        return [self.dataset_id.lower()]

    def get(self):
        """Get the url/fp for the dataset."""
        try:
            return self.url
        except AttributeError:
            return self.fp

    def to_dict(self):
        """Convert self to a python dictionary."""
        mydict = {}
        for attr in dir(self):
            try:
                is_callable = callable(getattr(BaseDataSet, attr))
            except AttributeError:
                is_callable = False
            if attr.startswith("__") or is_callable:
                continue
            try:
                val = getattr(self, attr)
                mydict[attr] = val
            except AttributeError:
                pass
        return mydict

    def find(self, data_name):
        """Return self if the name is one of our aliases."""
        if data_name.lower() in self.aliases:
            return self

        raise DataSetNotFoundError(
            f"Dataset {data_name} not found"
        )

    def list(self, latest_only=True):
        """Return a list of itself."""
        return [self]


class BaseVersionedDataSet():
    def __init__(self, base_dataset_id, datasets, title="Unknown title"):
        """Initialize a BaseVersionedDataDet instance.

        Parameters
        ----------
        base_dataset_id: str
            This is the identification given to the versioned dataset as a
            whole. Each individual version has their own dataset_id.
        datasets: list
            List of BaseDataSet's containing all the different versions.
        """
        self.datasets = datasets
        self.title = title
        self.dataset_id = base_dataset_id

    def __str__(self):
        dataset_dict = self.datasets[-1].to_dict()
        dataset_dict["versions_available"] = [
            d.dataset_id for d in self.datasets
        ]
        return pretty_format(dataset_dict)

    def __len__(self):
        return len(self.datasets)

    def find(self, dataset_name):
        if dataset_name == self.dataset_id:
            return self

        all_dataset_names = [(d, d.aliases) for d in self.datasets]
        for dataset, aliases in all_dataset_names:
            if dataset_name.lower() in aliases:
                return dataset

        raise DataSetNotFoundError(
            f"Dataset {dataset_name} not found"
        )

    def get(self, i_version=-1):
        return self.datasets[i_version].get()

    def list(self, latest_only=True):
        if latest_only:
            return [self.datasets[-1]]
        return [self]


class BaseDataGroup():
    def __init__(self, *args):
        """Group of datasets."""
        self._data_sets = [a for a in args]

    def __str__(self):
        return "".join([
            f"*******  {str(data.dataset_id)}  *******\n"
            f"{str(data)}\n\n" for data in self._data_sets
        ])

    def to_dict(self):
        return {data.dataset_id: data for data in self._data_sets}

    def append(self, dataset):
        self._data_sets.append(dataset)

    def find(self, dataset_name):
        results = []
        for d in self._data_sets:
            try:
                dataset_result = d.find(dataset_name)
                results.append(dataset_result)
            except DataSetNotFoundError:
                pass
        if len(results) > 1:
            raise ValueError(
                f"Broken dataset group '{self.group_id}' containing multiple"
                f" datasets with the same name/alias '{dataset_name}'.")
        elif len(results) == 1:
            return results[0]

        raise DataSetNotFoundError(
            f"Dataset {dataset_name} not found"
        )

    def list(self, latest_only=True):
        return_list = []
        for d in self._data_sets:
            return_list.extend(d.list(latest_only=latest_only))
        return return_list


class DatasetManager():

    @property
    def groups(self):

        entry_points = get_entry_points('asreview.datasets')

        return list(entry_points.keys())

    def find(self, dataset_name):
        """Find a dataset.

        Parameters
        ----------
        dataset_name: str, iterable
            Look for this term in aliases within any dataset. A group can
            be specified by setting dataset_name to 'group_id:dataset_id'.
            This can be helpful if the dataset_id is not unique.
            The dataset_name can also be a non-string iterable, in which case
            a list will be returned with all terms.
            Dataset_ids should not contain semicolons (:).
            Return None if the dataset could not be found.

        Returns
        -------
        BaseDataSet, VersionedDataSet:
            If the dataset with that name is found, return it
            (or a list there of).
        """
        # If dataset_name is a non-string iterable, return a list.
        if is_iterable(dataset_name):
            return [self.find(x) for x in dataset_name]

        # If dataset_name is a valid path, create a dataset from it.
        if Path(dataset_name).is_file():
            return BaseDataSet(dataset_name)

        dataset_name = str(dataset_name)

        # get installed dataset groups
        dataset_groups = get_entry_points('asreview.datasets')

        # Split into group/dataset if possible.
        split_dataset_id = dataset_name.split(":")
        if len(split_dataset_id) == 2:
            data_group = split_dataset_id[0]
            split_dataset_name = split_dataset_id[1]
            if data_group in self.groups:
                return dataset_groups[data_group].load()() \
                    .find(split_dataset_name)

        # Look through all available/installed groups for the name.
        all_results = {}
        for group_name, dataset_entry in dataset_groups.items():
            try:
                all_results[group_name] = \
                    dataset_entry.load()().find(dataset_name)
            except Exception:
                # don't raise error on loading entry point
                pass

        # If we have multiple results, throw an error.
        if len(all_results) > 1:
            raise ValueError(
                f"Multiple datasets found: {list(all_results)}."
                "Use DATAGROUP:DATASET format to specify which one"
                " you want.")

        if len(all_results) == 1:
            return list(all_results.values())[0]

        # Could not find dataset
        raise DataSetNotFoundError(
            f"Dataset {dataset_name} not found"
        )

    def list(self, group_name=None, latest_only=True, raise_on_error=False):
        """List the available datasets.

        Parameters
        ----------
        group_name: str, iterable
            List only datasets in the group(s) with that name. Lists all
            groups if group_name is None.
        latest_only: bool
            Only include the latest version of the dataset.
        raise_on_error: bool
            Raise error when entry point can't be loaded.

        Returns
        -------
        dict:
            Dictionary with group names as keys and lists of datasets as
            values.
        """
        if group_name is None:
            group_names = self.groups
        elif not is_iterable(group_name):
            group_names = [group_name]
        else:
            group_names = group_name

        dataset_groups = get_entry_points('asreview.datasets')

        dataset_list = {}
        for group in group_names:
            try:
                dataset_list[group] = \
                    dataset_groups[group].load()().list(latest_only=latest_only)
            except Exception as err:

                # don't raise error on loading entry point
                if raise_on_error:
                    raise err

        return dataset_list


class BenchmarkDataGroup(BaseDataGroup):
    group_id = "benchmark"
    description = "A collections of labeled datasets for benchmarking."

    def __init__(self):
        meta_file = "https://raw.githubusercontent.com/asreview/systematic-review-datasets/master/index.json"  # noqa
        datasets = download_from_metadata(meta_file)

        super(BenchmarkDataGroup, self).__init__(
            *datasets
        )


def download_from_metadata(url):
    """Download metadata to dataset."""

    try:
        with urlopen(url, timeout=10) as f:
            meta_data = json.loads(f.read().decode())
    except URLError as e:
        if isinstance(e.reason, socket.timeout):
            raise Exception("Connection time out.")
        raise e

    datasets = []
    for data in meta_data.values():
        datasets.append(_create_dataset_from_meta(data))

    return datasets
