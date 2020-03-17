from pathlib import Path
import pkg_resources

from asreview.utils import pretty_format
from asreview.utils import is_iterable


class BaseDataSet():
    name = "unknown"

    def __init__(self, fp=None):
        if fp is not None:
            self.fp = fp
            self.name = Path(fp).name

    def get(self):
        try:
            return self.url
        except AttributeError:
            return self.fp

    def to_dict(self):
        mydict = {}
        for attr in ["url", "fp", "authors", "topic", "link", "license"]:
            try:
                val = getattr(self, attr)
                mydict[attr] = val
            except AttributeError:
                pass
        return mydict

    def __str__(self):
        return pretty_format(self.to_dict())


class PTSDDataSet(BaseDataSet):
    name = "ptsd"
    url = (
        "https://raw.githubusercontent.com/asreview/systematic-review-datasets"
        "/master/datasets/Van_de_Schoot_PTSD/output/PTSD_VandeSchoot_18.csv")
    authors = ['Rens van de Schoot', 'Marit Sijbrandij', 'Sarah Depaoli',
               'Sonja D. Winter', 'Miranda Olff', 'Nancy E. van Loey']
    topic = "PTSD"
    license = "CC-BY Attribution 4.0 International"
    link = "https://osf.io/h5k2q/"
    year = 2018


class AceDataSet(BaseDataSet):
    name = "ace"
    url = (
        "https://raw.githubusercontent.com/asreview/systematic-review-datasets"
        "/master/datasets/Cohen_EBM/output/ACEInhibitors.csv")
    link = ("https://dmice.ohsu.edu/cohenaa/"
            "systematic-drug-class-review-data.html")
    authors = ["A.M. Cohen", "W.R. Hersh", "K. Peterson", "Po-Yin Yen"]
    year = 2006
    license = None
    topic = "ACEInhibitors"


class HallDataSet(BaseDataSet):
    name = "hall"
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


class BaseDataGroup():
    def __init__(self, *args):
        self._data_sets = [a for a in args]

    def to_dict(self):
        return {data.name: data for data in self._data_sets}

    def __str__(self):
        return "".join([
            f"*******  {str(data.name)}  *******\n"
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


def get_dataset(name):
    if is_iterable(name):
        return [get_dataset(data) for data in name]

    all_datasets = get_available_datasets()

    data_group = None
    try:
        split_name = name.split(":")
        if len(split_name) == 2:
            data_group = split_name[0]
            name = split_name[1]
    except TypeError:
        pass

    my_datasets = {}

    for group, cur_datasets in all_datasets.items():
        if data_group is not None and group != data_group:
            continue
        if name in cur_datasets:
            my_datasets[name] = cur_datasets[name]

    if len(my_datasets) == 1:
        return my_datasets[list(my_datasets)[0]]
    if len(my_datasets) > 1:
        raise ValueError(f"Multiple datasets found: {list(my_datasets)}."
                         "Use DATAGROUP:DATASET format to specify which one"
                         " you want.")

    return BaseDataSet(name)


def find_data(name):
    return get_dataset(name).get()
