from pathlib import Path, PurePath
import pkg_resources
import json

from asreview.utils import pretty_format
from asreview.utils import is_iterable


class BaseDataSet():

    def __init__(self, fp=None):

        if fp is not None:
            self.fp = fp
            self.id = Path(fp).name

        super(BaseDataSet, self).__init__()

    def get(self):
        try:
            return self.url
        except AttributeError:
            return self.fp

    def to_dict(self):
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


class PTSDDataSet(BaseDataSet):
    dataset_id = "ptsd"
    title = "PTSD - Schoot"
    description = "Bayesian PTSD-Trajectory Analysis with Informed Priors"
    url = (
        "https://raw.githubusercontent.com/asreview/systematic-review-datasets"
        "/master/datasets/Van_de_Schoot_PTSD/output/PTSD_VandeSchoot_18.csv")
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
    title = "ACEInhibitors - Cohen"
    description = "Systematic Drug Class Review Gold Standard Data"
    url = (
        "https://raw.githubusercontent.com/asreview/systematic-review-datasets"
        "/master/datasets/Cohen_EBM/output/ACEInhibitors.csv")
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
    title = "Fault prediction - Hall"
    description = ("A systematic literature review on fault prediction "
                   "performance in software engineering")
    url = (
        "https://raw.githubusercontent.com/asreview/systematic-review-datasets"
        "/master/datasets/Four%20Software%20Engineer%20Data%20Sets/"
        "Software%20Engineering%201%20Hall.csv"
    )
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


class BaseDataGroup():
    def __init__(self, *args):
        self._data_sets = [a for a in args]

    def to_dict(self):
        return {data.dataset_id: data for data in self._data_sets}

    # @classmethod
    # def from_config(cls, fp):
    #     with open(fp, "r") as f:
    #         config_dict = json.load(f)
    #     last_update = config_dict.pop("last_update", None)
    #     name = config_dict.pop("name", None)
    #     new_datasets = []
    #     for dataset in config_dict["datasets"]:
    #         data_instance = BaseDataSet()
    #         for attr in config_dict:
    #             if attr == "datasets":
    #                 continue
    #             setattr(data_instance, attr, config_dict[attr])
    #         for attr in dataset:
    #             setattr(data_instance, attr, dataset[attr])
    #         new_datasets.append(data_instance)
    #     group_instance = cls(*new_datasets)
    #     group_instance.name = name
    #     group_instance.last_update = last_update
    #     return group_instance

    def __str__(self):
        return "".join([
            f"*******  {str(data.dataset_id)}  *******\n"
            f"{str(data)}\n\n"
            for data in self._data_sets
        ])

    def append(self, dataset):
        self._data_sets.append(dataset)


class BuiltinDataGroup(BaseDataGroup):
    def __init__(self):
        super(BuiltinDataGroup, self).__init__(
            PTSDDataSet(),
            AceDataSet(),
            HallDataSet(),
        )


def get_available_datasets():
    entry_points = {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points('asreview.datasets')
    }

    all_datasets = {}
    for group, entry in entry_points.items():
        datasets = entry.load()().to_dict()
        all_datasets[group] = datasets
    return all_datasets


def get_dataset(dataset_id):
    if is_iterable(dataset_id):
        return [get_dataset(data) for data in dataset_id]

    all_datasets = get_available_datasets()

    data_group = None
    try:
        split_dataset_id = dataset_id.split(":")
        if len(split_dataset_id) == 2:
            data_group = split_dataset_id[0]
            dataset_id = split_dataset_id[1]
    except TypeError:
        pass

    my_datasets = {}

    for group, cur_datasets in all_datasets.items():
        if data_group is not None and group != data_group:
            continue
        if dataset_id in cur_datasets:
            my_datasets[dataset_id] = cur_datasets[dataset_id]

    if len(my_datasets) == 1:
        return my_datasets[list(my_datasets)[0]]
    if len(my_datasets) > 1:
        raise ValueError(f"Multiple datasets found: {list(my_datasets)}."
                         "Use DATAGROUP:DATASET format to specify which one"
                         " you want.")

    return BaseDataSet(dataset_id)


def find_data(project_id):
    if isinstance(project_id, PurePath):
        return project_id
    return get_dataset(project_id).get()
