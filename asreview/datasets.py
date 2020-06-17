from pathlib import Path
import pkg_resources
import json

from asreview.utils import pretty_format
from asreview.utils import is_iterable, is_url
from urllib.request import urlopen


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
        "Can be overriden by setting it manually."
        return [self.dataset_id]

    def get(self):
        "Get the url/fp for the dataset."
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

    def __str__(self):
        return pretty_format(self.to_dict())

    def find(self, data_name):
        "Return self if the name is one of our aliases."
        if data_name in self.aliases:
            return self
        return None

    def list(self, latest_only=True):
        "Return a list of itself."
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

    def find(self, dataset_name):
        if dataset_name == self.dataset_id:
            return self

        all_dataset_names = [(d, d.aliases) for d in self.datasets]
        for dataset, aliases in all_dataset_names:
            if dataset_name in aliases:
                return dataset

        return None

    def get(self, i_version=-1):
        return self.datasets[i_version].get()

    def list(self, latest_only=True):
        if latest_only:
            return [self.datasets[-1]]
        return [self]

    def __str__(self):
        dataset_dict = self.datasets[-1].to_dict()
        dataset_dict["versions_available"] = [
            d.dataset_id for d in self.datasets]
        return pretty_format(dataset_dict)

    def __len__(self):
        return len(self.datasets)


class DatasetManager():
    """Manager to search for datasets from the ones currently available."""
    def __init__(self):
        """Look through the entry points to create a database of datasets."""
        entry_points = {
            entry.name: entry
            for entry in pkg_resources.iter_entry_points('asreview.datasets')
        }

        self.all_datasets = {}
        for group, entry in entry_points.items():
            self.all_datasets[group] = entry.load()()

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

        # Split into group/dataset if possible.
        split_dataset_id = dataset_name.split(":")
        if len(split_dataset_id) == 2:
            data_group = split_dataset_id[0]
            split_dataset_name = split_dataset_id[1]
            if data_group in self.all_datasets:
                return self.all_datasets[data_group].find(split_dataset_name)

        # Look through all available/installed groups for the name.
        all_results = {}
        for group_name, dataset in self.all_datasets.items():
            result = dataset.find(dataset_name)
            if result is not None:
                all_results[group_name] = result

        # If we have multiple results, throw an error.
        if len(all_results) > 1:
            raise ValueError(
                f"Multiple datasets found: {list(all_results)}."
                "Use DATAGROUP:DATASET format to specify which one"
                " you want.")

        if len(all_results) == 1:
            return list(all_results.values())[0]

        # Could not find dataset, return None.
        return None

    def list(self, group_name=None, latest_only=True):
        """List the available datasets.

        Parameters
        ----------
        group_name: str, iterable
            List only datasets in the group(s) with that name. Lists all
            groups if group_name is None.
        latest_only: bool
            Only include the latest version of the dataset.

        Returns
        -------
        dict:
            Dictionary with group names as keys and lists of datasets as
            values.
        """
        if group_name is None:
            group_names = list(self.all_datasets)
        elif not is_iterable(group_name):
            group_names = [group_name]
        else:
            group_names = group_name

        dataset_list = {gn: self.all_datasets[gn].list(latest_only=latest_only)
                        for gn in group_names}
        return dataset_list


class BaseDataGroup():
    """A grouping of datasets."""
    def __init__(self, *args):
        self._data_sets = [a for a in args]

    def to_dict(self):
        return {data.dataset_id: data for data in self._data_sets}

    def __str__(self):
        return "".join([
            f"*******  {str(data.dataset_id)}  *******\n"
            f"{str(data)}\n\n"
            for data in self._data_sets
        ])

    def append(self, dataset):
        self._data_sets.append(dataset)

    def find(self, dataset_name):
        results = []
        for d in self._data_sets:
            res = d.find(dataset_name)
            if res is not None:
                results.append(res)
        if len(results) > 1:
            raise ValueError(
                f"Broken dataset group '{self.group_id}' containing multiple"
                f" datasets with the same name/alias '{dataset_name}'.")
        elif len(results) == 1:
            return results[0]
        return None

    def list(self, latest_only=True):
        return_list = []
        for d in self._data_sets:
            return_list.extend(d.list(latest_only=latest_only))
        return return_list


class PTSDDataSet(BaseDataSet):
    dataset_id = "ptsd"
    aliases = ["ptsd", "example_ptsd", "schoot"]
    title = "PTSD - Schoot"
    description = "Bayesian PTSD-Trajectory Analysis with Informed Priors"
    url = "https://raw.githubusercontent.com/asreview/asreview/master/datasets/PTSD_VandeSchoot_18.csv"  # noqa
    url_demo = "https://raw.githubusercontent.com/asreview/asreview/master/tests/test_datasets/PTSD_VandeSchoot_18_debug.csv"  # noqa
    sha512 = ("e2b62c93e4e9ddebf786e2cc8a0effb7fd8bf2ada986d53e6e5133092e7de88"
              "6b311286fa459144576ed3ac0dfff1bca1ba9c198d0235d8280a40b2533d0c0"
              "a7")
    authors = ['Rens van de Schoot', 'Marit Sijbrandij', 'Sarah Depaoli',
               'Sonja D. Winter', 'Miranda Olff', 'Nancy E. van Loey']
    topic = "PTSD"
    license = "CC-BY Attribution 4.0 International"
    link = "https://osf.io/h5k2q/"
    last_update = "2020-03-23"
    year = 2018
    img_url = ("https://raw.githubusercontent.com/asreview/asreview/master/"
               "images/ptsd.png")
    date = "2018-01-11"


class AceDataSet(BaseDataSet):
    dataset_id = "ace"
    aliases = ["ace", "example_cohen", "example_ace"]
    title = "ACEInhibitors - Cohen"
    description = "Systematic Drug Class Review Gold Standard Data"
    url = "https://raw.githubusercontent.com/asreview/asreview/master/datasets/ACEInhibitors.csv"  # noqa
    url_demo = "https://raw.githubusercontent.com/asreview/asreview/master/tests/test_datasets/ACEInhibitors_debug.csv"  # noqa
    link = ("https://dmice.ohsu.edu/cohenaa/"
            "systematic-drug-class-review-data.html")
    authors = ["A.M. Cohen", "W.R. Hersh", "K. Peterson", "Po-Yin Yen"]
    year = 2006
    license = None
    topic = "ACEInhibitors"
    sha512 = ("bde84809236e554abd982c724193777c1b904adb2326cb0a0ccb350b02d4246"
              "e8db5e9b36d0cb4b23e9aab521441764cdb0e31d6cb90fdc9e6c907ae1650d6"
              "1a")
    img_url = ("https://raw.githubusercontent.com/asreview/asreview/master/"
               "images/ace.png")
    last_update = "2020-03-23"
    date = "2006-03-01"


class HallDataSet(BaseDataSet):
    dataset_id = "hall"
    aliases = ["hall", "example_hall", "example_software"]
    title = "Fault prediction - Hall"
    description = ("A systematic literature review on fault prediction "
                   "performance in software engineering")
    url = "https://raw.githubusercontent.com/asreview/asreview/master/datasets/Software_Engineering_Hall.csv"  # noqa
    url_demo = "https://raw.githubusercontent.com/asreview/asreview/master/tests/test_datasets/Software_Engineering_Hall_debug.csv"  # noqa
    link = "https://zenodo.org/record/1162952#.XIVBE_ZFyVR"
    authors = ["Tracy Hall", "Sarah Beecham", "David Bowes", "David Gray",
               "Steve Counsell"]
    year = 2012
    license = "CC-BY Attribution 4.0 International"
    topic = "Software Fault Prediction"
    sha512 = ("0d5cc86586d7e6f28e5c52c78cf4647556cdf41a73c9188b6424ca007f38ea9"
              "55230e297d7c4a96a41ae46ec716a21c2d5dc432a77dd4d81886aa60ad9b771"
              "00")
    img_url = ("https://raw.githubusercontent.com/asreview/asreview/master/"
               "images/softwareengineering.png")
    last_update = "2020-03-23"
    date = "2011-10-06"


class BuiltinDataGroup(BaseDataGroup):
    group_id = "builtin"

    def __init__(self):
        super(BuiltinDataGroup, self).__init__(
            PTSDDataSet(),
            AceDataSet(),
            HallDataSet(),
        )


def get_available_datasets():
    """Deprecated, use DatasetManager instead"""
    entry_points = {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points('asreview.datasets')
    }

    all_datasets = {}
    for group, entry in entry_points.items():
        datasets = entry.load()().to_dict()
        all_datasets[group] = datasets
    return all_datasets


def dataset_from_url(url):
    """Helper function to create a dataset from an url"""
    index_file = url + "/index.json"
    with urlopen(index_file) as f:
        meta_data = json.loads(f.read().decode())
    dataset_type = meta_data["type"]
    if dataset_type == "versioned":
        file_list = meta_data["filenames"]
        base_dataset_id = meta_data["base_id"]
        title = meta_data["title"]
        if meta_data["type"] != "versioned":
            raise ValueError("BaseVersionedDataSet: wrong datatype: "
                             f"{meta_data['type']}")
        datasets = []
        for config_file in [url+"/"+f for f in file_list]:
            datasets.append(BaseDataSet.from_config(config_file))
        return BaseVersionedDataSet(base_dataset_id, datasets, title)
    elif dataset_type == "base":
        config_file = url + "/" + meta_data["filenames"][0]
        return BaseDataSet.from_config(config_file)
    raise ValueError(f"Dataset type {dataset_type} unknown.")


def find_data(project_id):
    return DatasetManager().find(project_id).get()
