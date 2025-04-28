# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

__all__ = [
    "BaseDataGroup",
    "BaseDataSet",
    "DatasetManager",
    "SynergyDataGroup",
    "SynergyDataSet",
]

import json
import socket
import tempfile
from abc import ABC
from abc import abstractmethod
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen
from urllib.request import urlretrieve

import synergy_dataset as sd

from asreview.data import CSVReader
from asreview.extensions import extensions
from asreview.utils import _get_filename_from_url


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


class BaseDataSet:
    def __init__(
        self,
        dataset_id,
        filepath=None,
        title=None,
        description=None,
        authors=None,
        topic=None,
        link=None,
        reference=None,
        img_url=None,
        license=None,
        year=None,
        aliases=None,
        **kwargs,
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

        if aliases is None:
            aliases = []
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
        return f"<BaseDataSet dataset_id='{self.dataset_id}' title='{self.title}'>"

    def __dict__(self):
        return {
            "dataset_id": self.dataset_id,
            "filepath": self.filepath,
            "title": self.title,
            "description": self.description,
            "authors": self.authors,
            "topic": self.topic,
            "link": self.link,
            "reference": self.reference,
            "license": self.license,
            "year": self.year,
            "img_url": self.img_url,
            "aliases": self.aliases,
            **self.kwargs,
        }

    @property
    def reader(self):
        return None

    @property
    def filename(self):
        if not hasattr(self, "_filename"):
            self._filename = _get_filename_from_url(self.filepath)

        return self._filename

    def to_file(self, path):
        # todo return without store
        urlretrieve(self.filepath, path)


class BaseDataGroup(ABC):
    url = None

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
            raise ValueError("Expected BaseDataSet or subclass of BaseDataSet.")
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
            if dataset_id.lower() == d.dataset_id.lower() or dataset_id.lower() in [
                a.lower() for a in d.aliases
            ]:
                results.append(d)

        if len(results) > 1:
            raise ValueError(
                f"Broken dataset group '{self.group_id}' containing multiple"
                f" datasets with the same name/alias '{dataset_id}'."
            )
        elif len(results) == 1:
            return results[0]

        raise ValueError(f"Dataset {dataset_id} not found")


class DatasetManager:
    @property
    def groups(self):
        return list(extensions("datasets").names)

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

        # If dataset_id is a valid path, create a dataset from it.
        if Path(dataset_id).is_file():
            return BaseDataSet(dataset_id)

        dataset_id = str(dataset_id)

        # get installed dataset groups
        dataset_groups = extensions("datasets")

        # Split into group/dataset if possible.
        split_dataset_id = dataset_id.split(":")
        if len(split_dataset_id) == 2:
            data_group = split_dataset_id[0]
            split_dataset_id = split_dataset_id[1]
            if data_group in self.groups:
                return dataset_groups[data_group].load()().find(split_dataset_id)

        # Look through all available/installed groups for the name.
        all_results = {}
        for data_group in dataset_groups:
            try:
                all_results[data_group.name] = data_group.load()().find(dataset_id)
            except Exception:
                # don't raise error on loading entry point
                pass

        # If we have multiple results, throw an error.
        if len(all_results) > 1:
            raise ValueError(
                f"Multiple datasets found: {list(all_results)}."
                "Use DATAGROUP:DATASET format to specify which one"
                " you want."
            )

        if len(all_results) == 1:
            return list(all_results.values())[0]

        # Could not find dataset
        raise ValueError(f"Dataset {dataset_id} not found")

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
            include = [include] if isinstance(include, str) else include
            groups = include
        elif exclude is not None:
            exclude = [exclude] if isinstance(exclude, str) else exclude
            groups = list(set(self.groups) - set(exclude))
        else:
            groups = self.groups.copy()

        dataset_groups = extensions("datasets")

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
                    dataset_list_ser.append(
                        {
                            "group_id": data_group.group_id,
                            "description": data_group.description,
                            "url": data_group.url,
                            "datasets": group_ser,
                        }
                    )
                except Exception as err:
                    # don't raise error on loading entry point
                    if raise_on_error:
                        raise err

            return dataset_list_ser

        return group_list


class SynergyDataSet(BaseDataSet):
    @property
    def filename(self):
        return self.dataset_id + ".csv"

    @property
    def reader(self):
        return CSVReader

    def to_file(self, path=None):
        # download, build, and store to local file
        try:
            return sd.Dataset(self.dataset_id).to_frame().to_csv(path)
        except FileNotFoundError:
            tmp_synergy_folder = tempfile.mkdtemp()
            sd.download_raw_subset(self.dataset_id, path=tmp_synergy_folder)

            for d in sd.iter_datasets(path=tmp_synergy_folder):
                if d.name == self.dataset_id:
                    return d.to_frame().to_csv(path)

        raise ValueError("Synergy dataset not found")


class SynergyDataGroup(BaseDataGroup):
    """Datasets available in the SYNERGY dataset."""

    group_id = "synergy"
    description = "SYNERGY"
    url = "https://asreview.ai/synergy"

    def __init__(self):
        # The following code was used to generate the metadata
        #
        # import synergy_dataset as sd
        # from pprint import pprint
        # meta_synergy = {}
        # for x in sd.iter_datasets():
        #     meta_synergy[x.name] = {
        #         "title": x.metadata["publication"]["display_name"],
        #         "authors": x.cite.split(",")[0] + " et al.",
        #         "topic": x.metadata
        #             ["data"]["concepts"]["included"][0]["display_name"],
        #         "link": "https://doi.org/10.34894/HE6NAQ",
        #         "reference": x.metadata["publication"]["doi"],
        #         "license": "See Synergy dataset",
        #         "year": x.metadata["publication"]["publication_year"],
        #         "n_records": x.metadata["data"]["n_records"],
        #         "n_relevant": x.metadata["data"]["n_records_included"],
        #     }
        # pprint(meta_synergy)

        synergy_metadata = {
            "Appenzeller-Herzog_2019": {
                "authors": "Appenzeller‐Herzog et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 2873,
                "n_relevant": 26,
                "reference": "https://doi.org/10.1111/liv.14179",
                "title": "Comparative effectiveness of common "
                "therapies for Wilson disease: A "
                "systematic review and meta‐analysis of "
                "controlled studies",
                "topic": "Medicine",
                "year": 2019,
            },
            "Bos_2018": {
                "authors": "Bos et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 4878,
                "n_relevant": 10,
                "reference": "https://doi.org/10.1016/j.jalz.2018.04.007",
                "title": "Cerebral small vessel disease and the risk of "
                "dementia: A systematic review and meta‐analysis of "
                "population‐based evidence",
                "topic": "Medicine",
                "year": 2018,
            },
            "Brouwer_2019": {
                "authors": "Brouwer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 38114,
                "n_relevant": 62,
                "reference": "https://doi.org/10.1016/j.cpr.2019.101773",
                "title": "Psychological theories of depressive relapse and "
                "recurrence: A systematic review and meta-analysis "
                "of prospective studies",
                "topic": "Psychology",
                "year": 2019,
            },
            "Chou_2003": {
                "authors": "Chou et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 1908,
                "n_relevant": 15,
                "reference": "https://doi.org/10.1016/j.jpainsymman.2003.03.003",
                "title": "Comparative efficacy and safety of long-acting oral "
                "opioids for chronic non-cancer pain: a systematic "
                "review",
                "topic": "Medicine",
                "year": 2003,
            },
            "Chou_2004": {
                "authors": "Chou et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 1630,
                "n_relevant": 9,
                "reference": "https://doi.org/10.1016/j.jpainsymman.2004.05.002",
                "title": "Comparative efficacy and safety of skeletal muscle "
                "relaxants for spasticity and musculoskeletal "
                "conditions: a systematic review",
                "topic": "Medicine",
                "year": 2004,
            },
            "Donners_2021": {
                "authors": "Donners et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 258,
                "n_relevant": 15,
                "reference": "https://doi.org/10.1007/s40262-021-01042-w",
                "title": "Pharmacokinetics and Associated Efficacy of "
                "Emicizumab in Humans: A Systematic Review",
                "topic": "Medicine",
                "year": 2021,
            },
            "Hall_2012": {
                "authors": "Hall et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 8793,
                "n_relevant": 104,
                "reference": "https://doi.org/10.1109/tse.2011.103",
                "title": "A Systematic Literature Review on Fault Prediction "
                "Performance in Software Engineering",
                "topic": "Computer science",
                "year": 2012,
            },
            "Jeyaraman_2020": {
                "authors": "Jeyaraman et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 1175,
                "n_relevant": 96,
                "reference": "https://doi.org/10.1177/1947603520951623",
                "title": "Does the Source of Mesenchymal Stem Cell Have an "
                "Effect in the Management of Osteoarthritis of "
                "the Knee? Meta-Analysis of Randomized Controlled "
                "Trials",
                "topic": "Medicine",
                "year": 2020,
            },
            "Leenaars_2019": {
                "authors": "Leenaars et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 5812,
                "n_relevant": 17,
                "reference": "https://doi.org/10.5334/jcr.183",
                "title": "Sleep and Microdialysis: An Experiment and a "
                "Systematic Review of Histamine and Several Amino "
                "Acids",
                "topic": "Psychology",
                "year": 2019,
            },
            "Leenaars_2020": {
                "authors": "Leenaars et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 7216,
                "n_relevant": 583,
                "reference": "https://doi.org/10.3390/ani10061047",
                "title": "A Systematic Review Comparing Experimental Design "
                "of Animal and Human Methotrexate Efficacy Studies "
                "for Rheumatoid Arthritis: Lessons for the "
                "Translational Value of Animal Studies",
                "topic": "Medicine",
                "year": 2020,
            },
            "Meijboom_2021": {
                "authors": "Meijboom et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 882,
                "n_relevant": 37,
                "reference": "https://doi.org/10.1007/s40259-021-00508-4",
                "title": "Patients Retransitioning from Biosimilar TNFα "
                "Inhibitor to the Corresponding Originator After "
                "Initial Transitioning to the Biosimilar: A "
                "Systematic Review",
                "topic": "Medicine",
                "year": 2021,
            },
            "Menon_2022": {
                "authors": "Menon et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 975,
                "n_relevant": 74,
                "reference": "https://doi.org/10.1080/10408444.2022.2082917",
                "title": "The methodological rigour of systematic reviews in "
                "environmental health",
                "topic": "Medicine",
                "year": 2022,
            },
            "Moran_2021": {
                "authors": "Moran et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 5214,
                "n_relevant": 111,
                "reference": "https://doi.org/10.1111/brv.12655",
                "title": "Poor nutritional condition promotes high‐risk "
                "behaviours: a systematic review and meta‐analysis",
                "topic": "Biology",
                "year": 2021,
            },
            "Muthu_2021": {
                "authors": "Muthu et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 2719,
                "n_relevant": 336,
                "reference": "https://doi.org/10.1097/brs.0000000000003645",
                "title": "Fragility Analysis of Statistically Significant "
                "Outcomes of Randomized Control Trials in Spine "
                "Surgery",
                "topic": "Medicine",
                "year": 2021,
            },
            "Nelson_2002": {
                "authors": "Nelson et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 366,
                "n_relevant": 80,
                "reference": "https://doi.org/10.1001/jama.288.7.872",
                "title": "Postmenopausal Hormone Replacement Therapy",
                "topic": "Medicine",
                "year": 2002,
            },
            "Oud_2018": {
                "authors": "Oud et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 952,
                "n_relevant": 20,
                "reference": "https://doi.org/10.1177/0004867418791257",
                "title": "Specialized psychotherapies for adults with borderline "
                "personality disorder: A systematic review and "
                "meta-analysis",
                "topic": "Psychology",
                "year": 2018,
            },
            "Radjenovic_2013": {
                "authors": "Radjenović et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 5935,
                "n_relevant": 48,
                "reference": "https://doi.org/10.1016/j.infsof.2013.02.009",
                "title": "Software fault prediction metrics: A systematic "
                "literature review",
                "topic": "Computer science",
                "year": 2013,
            },
            "Sep_2021": {
                "authors": "Sep et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 271,
                "n_relevant": 40,
                "reference": "https://doi.org/10.1371/journal.pone.0249102",
                "title": "The rodent object-in-context task: A systematic review "
                "and meta-analysis of important variables",
                "topic": "Psychology",
                "year": 2021,
            },
            "Smid_2020": {
                "authors": "Smid et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 2627,
                "n_relevant": 27,
                "reference": "https://doi.org/10.1080/10705511.2019.1577140",
                "title": "Bayesian Versus Frequentist Estimation for Structural "
                "Equation Models in Small Sample Contexts: A "
                "Systematic Review",
                "topic": "Computer science",
                "year": 2020,
            },
            "Walker_2018": {
                "authors": "Walker et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 48375,
                "n_relevant": 762,
                "reference": "https://doi.org/10.1016/j.envint.2017.12.032",
                "title": "Human and animal evidence of potential "
                "transgenerational inheritance of health effects: An "
                "evidence map and state-of-the-science evaluation",
                "topic": "Biology",
                "year": 2018,
            },
            "Wassenaar_2017": {
                "authors": "Wassenaar et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 7668,
                "n_relevant": 111,
                "reference": "https://doi.org/10.1289/ehp1233",
                "title": "Systematic Review and Meta-Analysis of "
                "Early-Life Exposure to Bisphenol A and "
                "Obesity-Related Outcomes in Rodents",
                "topic": "Medicine",
                "year": 2017,
            },
            "Wolters_2018": {
                "authors": "Wolters et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 4280,
                "n_relevant": 19,
                "reference": "https://doi.org/10.1016/j.jalz.2018.01.007",
                "title": "Coronary heart disease, heart failure, and the "
                "risk of dementia: A systematic review and "
                "meta‐analysis",
                "topic": "Medicine",
                "year": 2018,
            },
            "van_Dis_2020": {
                "authors": "van Dis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 9128,
                "n_relevant": 72,
                "reference": "https://doi.org/10.1001/jamapsychiatry.2019.3986",
                "title": "Long-term Outcomes of Cognitive Behavioral Therapy "
                "for Anxiety-Related Disorders",
                "topic": "Psychology",
                "year": 2020,
            },
            "van_de_Schoot_2018": {
                "authors": "van de Schoot et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 4544,
                "n_relevant": 38,
                "reference": "https://doi.org/10.1080/00273171.2017.1412293",
                "title": "Bayesian PTSD-Trajectory Analysis with "
                "Informed Priors Based on a Systematic "
                "Literature Search and Expert Elicitation",
                "topic": "Psychology",
                "year": 2018,
            },
            "van_der_Valk_2021": {
                "authors": "Valk et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 725,
                "n_relevant": 89,
                "reference": "https://doi.org/10.1111/obr.13376",
                "title": "Cross‐sectional relation of long‐term "
                "glucocorticoids in hair with anthropometric "
                "measurements and their possible determinants: "
                "A systematic review and meta‐analysis",
                "topic": "Medicine",
                "year": 2021,
            },
            "van_der_Waal_2022": {
                "authors": "van der Waal et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/HE6NAQ",
                "n_records": 1970,
                "n_relevant": 33,
                "reference": "https://doi.org/10.1016/j.jgo.2022.09.012",
                "title": "A meta-analysis on the role older adults with "
                "cancer favour in treatment decision making",
                "topic": "Medicine",
                "year": 2022,
            },
        }

        datasets = [SynergyDataSet(k, **v) for k, v in synergy_metadata.items()]

        super().__init__(*datasets)
