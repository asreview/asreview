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

import json
import socket
from abc import ABC
from abc import abstractmethod
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

from asreview.utils import get_entry_points
from asreview.utils import is_iterable


class DatasetNotFoundError(Exception):
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
        if "type" in data and data["type"] == "versioned":
            raise ValueError("Datasets of type 'versioned' are deprecated")

        datasets.append(BaseDataSet(**data))

    return datasets


class BaseDataSet():

    def __init__(self,
                 dataset_id,
                 filepath,
                 title,
                 description=None,
                 authors=None,
                 topic=None,
                 link=None,
                 reference=None,
                 img_url=None,
                 license=None,
                 year=None,
                 aliases=[],
                 **kwargs
                 ):
        """Base class for metadata of dataset.

        A BaseDataSet is a class with metadata about a (labeled)
        dataset used in ASReview LAB. The dataset can be used via
        the frontend or via command line interface.

        In general, a BaseDataSet is part of a group (BaseDataGroup).

        Examples
        --------

        The following example simulates a dataset with dataset_id
        'cord19'. The name of the group is 'covid'.

        >>> asreview simulate covid:cord_19

        Parameters
        ----------
        dataset_id: str
            Identifier of the dataset. The value is a alphanumeric
            string used to indentify the dataset via the command line
            interface. Example: 'groupname:DATASET_ID' where DATASET_ID
            is the value of dataset_id.
        filepath: str
            Path to file or URL to the dataset. See
            asreview.readthedocs.io/{URL} for information about valid
            datasets.
        title: str
            Title of the dataset.
        description: str
            Description of the dataset. Optional.
        authors: list
            Authors of the dataset. Optional.
        topic: str
            Topics of the dataset. Optional.
        link: str
            Link to a website or additional information.
        reference: str
            (Academic) reference describing the dataset. Optional.
        license: str
            License of the dataset. Optional
        year: str
            Year of publication of the dataset. Optional.
        img_url: str
            Image for display in graphical interfaces. Optional.
        aliases: list
            Additional identifiers for the dataset_id. This can be
            useful for long of complex dataset_id's. Optional.

        """

        self.dataset_id = dataset_id
        self.filepath = filepath
        self.title = title
        self.description = description
        self.authors = authors
        self.topic = topic
        self.link = link
        self.reference = reference
        self.license = license
        self.year = year
        self.img_url = img_url
        self.aliases = aliases
        self.kwargs = kwargs

    def __str__(self):
        return f"<BaseDataSet dataset_id='{self.dataset_id}' title='{self.title}'>"  # noqa

    def __dict__(self):

        return {
            'dataset_id': self.dataset_id,
            'filepath': self.filepath,
            'title': self.title,
            'description': self.description,
            'authors': self.authors,
            'topic': self.topic,
            'link': self.link,
            'reference': self.reference,
            'license': self.license,
            'year': self.year,
            'img_url': self.img_url,
            'aliases': self.aliases,
            **self.kwargs
        }


class BaseDataGroup(ABC):
    def __init__(self, *datasets):
        """Group of datasets.

        Group containing one or more datasets.

        Parameters
        ----------
        *datasets:
            One or more datasets.
        """
        self.datasets = list(datasets)

    @property
    @abstractmethod
    def group_id(cls):
        pass

    @property
    @abstractmethod
    def description(cls):
        pass

    def __str__(self):
        return f"<BaseDataGroup group_id='{self.group_id}'>"

    def __dict__(self):
        return {d.dataset_id: d for d in self.datasets}

    def append(self, dataset):
        """Append dataset to group.

        dataset: asreview.datasets.BaseDataSet
            A asreview BaseDataSet-like object.
        """
        if not issubclass(dataset, BaseDataSet):
            raise ValueError(
                "Expected BaseDataSet or subclass of BaseDataSet."
            )
        self.datasets.append(dataset)

    def find(self, dataset_id):
        """Find dataset in the group.

        Parameters
        ----------
        dataset_id: str
            Identifier of the dataset to look for. It can also be one
            of the aliases. Case insensitive.

        Returns
        -------
        asreview.datasets.BaseDataSet:
            Returns base dataset with the given dataset_id.
        """
        results = []
        for d in self.datasets:
            if dataset_id.lower() == d.dataset_id.lower() or \
                    dataset_id.lower() in [a.lower() for a in d.aliases]:
                results.append(d)

        if len(results) > 1:
            raise ValueError(
                f"Broken dataset group '{self.group_id}' containing multiple"
                f" datasets with the same name/alias '{dataset_id}'.")
        elif len(results) == 1:
            return results[0]

        raise DatasetNotFoundError(
            f"Dataset {dataset_id} not found"
        )


class DatasetManager():

    @property
    def groups(self):

        entry_points = get_entry_points('asreview.datasets')

        return list(entry_points.keys())

    def find(self, dataset_id):
        """Find a dataset.

        Parameters
        ----------
        dataset_id: str, iterable
            Look for this term in aliases within any dataset. A group can
            be specified by setting dataset_id to 'group_id:dataset_id'.
            This can be helpful if the dataset_id is not unique.
            The dataset_id can also be a non-string iterable, in which case
            a list will be returned with all terms.
            Dataset_ids should not contain semicolons (:).
            Return None if the dataset could not be found.

        Returns
        -------
        BaseDataSet:
            Return the dataset with dataset_id.
        """
        # If dataset_id is a non-string iterable, return a list.
        if is_iterable(dataset_id):
            return [self.find(x) for x in dataset_id]

        # If dataset_id is a valid path, create a dataset from it.
        if Path(dataset_id).is_file():
            return BaseDataSet(dataset_id)

        dataset_id = str(dataset_id)

        # get installed dataset groups
        dataset_groups = get_entry_points('asreview.datasets')

        # Split into group/dataset if possible.
        split_dataset_id = dataset_id.split(":")
        if len(split_dataset_id) == 2:
            data_group = split_dataset_id[0]
            split_dataset_id = split_dataset_id[1]
            if data_group in self.groups:
                return dataset_groups[data_group].load()() \
                    .find(split_dataset_id)

        # Look through all available/installed groups for the name.
        all_results = {}
        for group_id, dataset_entry in dataset_groups.items():
            try:
                all_results[group_id] = \
                    dataset_entry.load()().find(dataset_id)
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
        raise DatasetNotFoundError(
            f"Dataset {dataset_id} not found"
        )

    def list(self, include=None, exclude=None, serialize=True, raise_on_error=False):
        """List the available datasets.

        Parameters
        ----------
        include: str, iterable
            List of groups to include
        exclude: str, iterable
            List of groups to exclude from all groups.
        serialize: bool
            Make returned list serializable.
        raise_on_error: bool
            Raise error when entry point can't be loaded.

        Returns
        -------
        list:
            List with datasets as values.
        """

        if include is not None and exclude is not None:
            raise ValueError("Cannot exclude groups when include is not None.")

        if include is not None:
            if not is_iterable(include):
                include = [include]
            groups = include
        elif exclude is not None:
            exclude = exclude if is_iterable(exclude) else [exclude]
            groups = list(set(self.groups) - set(exclude))
        else:
            groups = self.groups.copy()

        dataset_groups = get_entry_points('asreview.datasets')

        group_list = []
        for group in groups:
            try:
                group_list.append(dataset_groups[group].load()())
            except Exception as err:

                # don't raise error on loading entry point
                if raise_on_error:
                    raise err

        if serialize:
            dataset_list_ser = []
            for data_group in group_list:
                try:
                    group_ser = []
                    for dataset in data_group.datasets:
                        group_ser.append(dataset.__dict__())
                    dataset_list_ser.append({
                        "group_id": data_group.group_id,
                        "description": data_group.description,
                        "datasets": group_ser
                    })
                except Exception as err:
                    # don't raise error on loading entry point
                    if raise_on_error:
                        raise err

            return dataset_list_ser

        return group_list


class BenchmarkDataGroup(BaseDataGroup):
    """Datasets available in the benchmark platform."""
    group_id = "benchmark"
    description = "Datasets available in the online benchmark platform"

    def __init__(self):
        meta_file = "https://raw.githubusercontent.com/asreview/systematic-review-datasets/master/index_v1.json"  # noqa
        datasets = _download_from_metadata(meta_file)

        super(BenchmarkDataGroup, self).__init__(
            *datasets
        )


class NaturePublicationDataGroup(BaseDataGroup):
    """Datasets used in the paper Van de Schoot et al. 2020."""
    group_id = "benchmark-nature"
    description = "Datasets used in the validation paper published in Nature Machine Intelligence (van de Schoot et al. 2021)"  # noqa

    def __init__(self):
        meta_file = "https://raw.githubusercontent.com/asreview/paper-asreview/master/index_v1.json"  # noqa
        datasets = _download_from_metadata(meta_file)

        super(NaturePublicationDataGroup, self).__init__(
            *datasets
        )
