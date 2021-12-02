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
from urllib.error import URLError
from urllib.request import urlopen

from asreview.utils import get_entry_points
from asreview.utils import is_iterable
from asreview.utils import is_url
from asreview.utils import pretty_format


class DataSetNotFoundError(Exception):
    pass


def _download_from_metadata(url):
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

        # raise error on versioned datasets
        if data["type"] == "versioned":
            raise ValueError("Datasets of type 'versioned' are deprecated")

        datasets.append(BaseDataSet.from_config(data))

    return datasets


class BaseDataSet():
    def __init__(self,

        ):
        """Initialize BaseDataSet which contains metadata.


        # {
        #     "description": "A free dataset on publications on the corona virus.",
        #     "authors": [
        #         "Allen institute for AI"
        #     ],
        #     "topic": "Covid-19",
        #     "link": "https://pages.semanticscholar.org/coronavirus-research",
        #     "img_url": "https://pages.semanticscholar.org/hs-fs/hubfs/covid-image.png?width=300&name=covid-image.png",
        #     "license": "Covid dataset license",
        #     "dataset_id": "cord19-v2020-03-13",
        #     "title": "CORD-19 (v2020-03-13)",
        #     "last_update": "2020-03-13",
        #     "url": "https://ai2-semanticscholar-cord-19.s3-us-west-2.amazonaws.com/2020-03-13/metadata.csv"
        # },

        Parameters
        ----------
        fp: str
            Path to file, if None, either an url/fp has to be set manually.
        """

        self.dataset_id = dataset_id
        self.title = title
        self.description = description
        self.authors = authors
        self.topic = topic
        self.link = link
        self.img_url = img_url
        self.license = license
        self.dataset_id = dataset_id
        self.title = title
        self.last_update = last_update
        self.url = url


        if fp is not None:
            self.fp = fp
            self.id = Path(fp).name

        super(BaseDataSet, self).__init__()

    def __str__(self):
        return pretty_format(self.to_dict())

    def __dict__(self):
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
            if data_name.lower() in d.aliases:
                results.append(d)

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
        datasets = _download_from_metadata(meta_file)

        super(BenchmarkDataGroup, self).__init__(
            *datasets
        )


class NaturePublicationDataGroup(BaseDataGroup):
    group_id = "benchmark-nature"
    description = "Featured benchmarking datasets from the Nature publication."

    def __init__(self):
        meta_file = "INSERT URL"  # noqa
        datasets = _download_from_metadata(meta_file)

        super(NaturePublicationDataGroup, self).__init__(
            *datasets
        )
