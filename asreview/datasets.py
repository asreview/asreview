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
        raise

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
            return next(iter(all_results.values()))

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
            except Exception:
                # don't raise error on loading entry point
                if raise_on_error:
                    raise

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
                except Exception:
                    # don't raise error on loading entry point
                    if raise_on_error:
                        raise

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
    """Datasets available in the SYNERGY+ dataset."""

    group_id = "synergy"
    description = "SYNERGY+"
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
        #         "topic": x.metadata["publication"]["primary_topic"]["field"]["display_name"],
        #         "link": "https://doi.org/10.34894/DDCVCV",
        #         "reference": x.metadata["publication"]["doi"],
        #         "license": "See Synergy dataset",
        #         "year": x.metadata["publication"]["publication_year"],
        #         "n_records": x.metadata["data"]["n_records"],
        #         "n_relevant": x.metadata["data"]["n_records_included"],
        #     }
        # pprint(meta_synergy)

        synergy_metadata = {
            "Abgaz_2023": {
                "authors": "Abgaz et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 733,
                "n_relevant": 34,
                "reference": "https://doi.org/10.1109/tse.2023.3287297",
                "title": "Decomposition of Monolith Applications Into "
                "Microservices Architectures: A Systematic Review",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Adamo_2021": {
                "authors": "Adamo et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4524,
                "n_relevant": 63,
                "reference": "https://doi.org/10.1007/s10270-020-00847-w",
                "title": "What is a process model composed of?",
                "topic": "Business, Management and Accounting",
                "year": 2021,
            },
            "Ali_2024": {
                "authors": "Ali et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2140,
                "n_relevant": 113,
                "reference": "https://doi.org/10.1007/s12599-024-00868-5",
                "title": "Data-Driven Identification and Analysis of Waiting "
                "Times in Business Processes",
                "topic": "Business, Management and Accounting",
                "year": 2024,
            },
            "Anmarkrud_2021": {
                "authors": "Anmarkrud et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2284,
                "n_relevant": 64,
                "reference": "https://doi.org/10.1007/s10648-021-09640-7",
                "title": "The Role of Individual Differences in Sourcing: "
                "a Systematic Review",
                "topic": "Psychology",
                "year": 2021,
            },
            "Aouad_2024": {
                "authors": "Aouad et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1009,
                "n_relevant": 46,
                "reference": "https://doi.org/10.1136/ard-2024-225567",
                "title": "Patient research partner involvement in rheumatology "
                "research: a systematic literature review informing "
                "the 2023 updated EULAR recommendations for the "
                "involvement of patient research partners",
                "topic": "Health Professions",
                "year": 2024,
            },
            "Appenzeller-Herzog_2019": {
                "authors": "Appenzeller‐Herzog et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2897,
                "n_relevant": 26,
                "reference": "https://doi.org/10.1111/liv.14179",
                "title": "Comparative effectiveness of common "
                "therapies for Wilson disease: A "
                "systematic review and meta‐analysis of "
                "controlled studies",
                "topic": "Nursing",
                "year": 2019,
            },
            "Attai_2022": {
                "authors": "Attai et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3801,
                "n_relevant": 235,
                "reference": "https://doi.org/10.3390/tropicalmed7120398",
                "title": "A Systematic Review of Applications of Machine "
                "Learning and Other Soft Computing Techniques for the "
                "Diagnosis of Tropical Diseases",
                "topic": "Computer Science",
                "year": 2022,
            },
            "Bakker-Jacobs_2022": {
                "authors": "Bakker-Jacobs et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2237,
                "n_relevant": 22,
                "reference": "https://doi.org/10.29011/2688-9501.101268",
                "title": "Overview of Wound Care Interventions for "
                "Hospital and Community Care Nurses: A "
                "Systematic Scoping Review",
                "topic": "Health Professions",
                "year": 2022,
            },
            "Bech_2019": {
                "authors": "Bech et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1634,
                "n_relevant": 45,
                "reference": "https://doi.org/10.1136/annrheumdis-2019-215458",
                "title": "2018 update of the EULAR recommendations for the role "
                "of the nurse in the management of chronic "
                "inflammatory arthritis",
                "topic": "Medicine",
                "year": 2019,
            },
            "Bindoli_2024a": {
                "authors": "Bindoli et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3370,
                "n_relevant": 112,
                "reference": "https://doi.org/10.1136/ard-2024-225854",
                "title": "Efficacy and safety of therapies for Still's "
                "disease and macrophage activation syndrome (MAS): "
                "a systematic review informing the EULAR/PReS "
                "guidelines for the management of Still's disease",
                "topic": "Medicine",
                "year": 2024,
            },
            "Bindoli_2024b": {
                "authors": "Bindoli et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 675,
                "n_relevant": 12,
                "reference": "https://doi.org/10.1136/ard-2024-225854",
                "title": "Efficacy and safety of therapies for Still's "
                "disease and macrophage activation syndrome (MAS): "
                "a systematic review informing the EULAR/PReS "
                "guidelines for the management of Still's disease",
                "topic": "Medicine",
                "year": 2024,
            },
            "Boersma-van_Dam_2024": {
                "authors": "Boersma-van Dam et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1961,
                "n_relevant": 102,
                "reference": "https://doi.org/10.1080/17437199.2024.2423725",
                "title": "The prevalence of posttraumatic stress "
                "disorder symptomatology and diagnosis in "
                "burn survivors: a systematic review and "
                "meta-analysis",
                "topic": "Medicine",
                "year": 2024,
            },
            "Bos_2018": {
                "authors": "Bos et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5072,
                "n_relevant": 10,
                "reference": "https://doi.org/10.1016/j.jalz.2018.04.007",
                "title": "Cerebral small vessel disease and the risk of "
                "dementia: A systematic review and meta‐analysis of "
                "population‐based evidence",
                "topic": "Medicine",
                "year": 2018,
            },
            "Bosch_2021": {
                "authors": "Bosch et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5299,
                "n_relevant": 65,
                "reference": "https://doi.org/10.1136/rmdopen-2021-001864",
                "title": "Value of imaging to guide interventional procedures "
                "in rheumatic and musculoskeletal diseases: a "
                "systematic literature review informing EULAR points "
                "to consider",
                "topic": "Medicine",
                "year": 2021,
            },
            "Bosch_2023": {
                "authors": "Bosch et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4372,
                "n_relevant": 37,
                "reference": "https://doi.org/10.1136/rmdopen-2023-003379",
                "title": "Imaging in diagnosis, monitoring and outcome "
                "prediction of large vessel vasculitis: a systematic "
                "literature review and meta-analysis informing the "
                "2023 update of the EULAR recommendations",
                "topic": "Medicine",
                "year": 2023,
            },
            "Brons_2024": {
                "authors": "Brons et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 275,
                "n_relevant": 39,
                "reference": "https://doi.org/10.2196/47774",
                "title": "Machine Learning Methods to Personalize Persuasive "
                "Strategies in mHealth Interventions That Promote "
                "Physical Activity: Scoping Review and Categorization "
                "Overview",
                "topic": "Health Professions",
                "year": 2024,
            },
            "Brouwer_2019": {
                "authors": "Brouwer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 40089,
                "n_relevant": 62,
                "reference": "https://doi.org/10.1016/j.cpr.2019.101773",
                "title": "Psychological theories of depressive relapse and "
                "recurrence: A systematic review and meta-analysis "
                "of prospective studies",
                "topic": "Psychology",
                "year": 2019,
            },
            "Burska_2023": {
                "authors": "Burska et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 8686,
                "n_relevant": 275,
                "reference": "https://doi.org/10.1136/rmdopen-2022-002876",
                "title": "Type I interferon pathway assays in studies of "
                "rheumatic and musculoskeletal diseases: a "
                "systematic literature review informing EULAR points "
                "to consider",
                "topic": "Medicine",
                "year": 2023,
            },
            "Butink_2023": {
                "authors": "Butink et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 8089,
                "n_relevant": 70,
                "reference": "https://doi.org/10.1136/rmdopen-2022-002903",
                "title": "Non-pharmacological interventions to promote work "
                "participation in people with rheumatic and "
                "musculoskeletal diseases: a systematic review and "
                "meta-analysis from the EULAR taskforce on healthy "
                "and sustainable work participation",
                "topic": "Medicine",
                "year": 2023,
            },
            "Chakraborty_2023": {
                "authors": "Chakraborty et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 10771,
                "n_relevant": 28,
                "reference": "https://doi.org/10.1007/s10270-023-01117-1",
                "title": "Modelling guidance in software engineering: a "
                "systematic literature review",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Chueca_2023": {
                "authors": "Chueca et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2764,
                "n_relevant": 90,
                "reference": "https://doi.org/10.1016/j.infsof.2023.107330",
                "title": "The consolidation of game software engineering: A "
                "systematic literature review of software "
                "engineering for industry-scale computer games",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Cinquin_2018": {
                "authors": "Cinquin et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 908,
                "n_relevant": 27,
                "reference": "https://doi.org/10.1016/j.compedu.2018.12.004",
                "title": "Online e-learning and cognitive disabilities: A "
                "systematic review",
                "topic": "Social Sciences",
                "year": 2018,
            },
            "Clarinval_2021": {
                "authors": "Clarinval et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2126,
                "n_relevant": 127,
                "reference": "https://doi.org/10.1109/tits.2021.3092036",
                "title": "Intra-City Traffic Data Visualization: A "
                "Systematic Literature Review",
                "topic": "Computer Science",
                "year": 2021,
            },
            "Clark_2021": {
                "authors": "Clark et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 801,
                "n_relevant": 5,
                "reference": "https://doi.org/10.1044/2021_lshss-20-00123",
                "title": "Orthographic Support for Word Learning in Clinical "
                "Populations: A Systematic Review",
                "topic": "Psychology",
                "year": 2021,
            },
            "Cozim-Melges_2024": {
                "authors": "Cozim-Melges et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1786,
                "n_relevant": 320,
                "reference": "https://doi.org/10.1038/s44185-023-00034-2",
                "title": "Farming practices to enhance biodiversity "
                "across biomes: a systematic review",
                "topic": "Agricultural and Biological Sciences",
                "year": 2024,
            },
            "Deckers_2022": {
                "authors": "Deckers et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 495,
                "n_relevant": 17,
                "reference": "https://doi.org/10.1016/j.jss.2022.111415",
                "title": "Systematic literature review of domain-oriented "
                "specification techniques",
                "topic": "Computer Science",
                "year": 2022,
            },
            "Dolinska_2022": {
                "authors": "Dolińska et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 7833,
                "n_relevant": 37,
                "reference": "https://doi.org/10.1016/j.xfnr.2022.12.001",
                "title": "Accuracy and utility of blood and urine "
                "biomarkers for the noninvasive diagnosis of "
                "endometriosis: a systematic literature review and "
                "meta-analysis",
                "topic": "Medicine",
                "year": 2022,
            },
            "Donners_2021": {
                "authors": "Donners et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 260,
                "n_relevant": 15,
                "reference": "https://doi.org/10.1007/s40262-021-01042-w",
                "title": "Pharmacokinetics and Associated Efficacy of "
                "Emicizumab in Humans: A Systematic Review",
                "topic": "Medicine",
                "year": 2021,
            },
            "Dornauer_2023": {
                "authors": "Dornauer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 869,
                "n_relevant": 13,
                "reference": "https://doi.org/10.1109/mobilsoft59058.2023.00017",
                "title": "Energy-Saving Strategies for Mobile Web Apps and "
                "their Measurement: Results from a Decade of "
                "Research",
                "topic": "Engineering",
                "year": 2023,
            },
            "Eggmann_2023": {
                "authors": "Eggmann et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 828,
                "n_relevant": 23,
                "reference": "https://doi.org/10.3390/ma16072580",
                "title": "Impact of Irradiation on the Adhesive Performance "
                "of Resin-Based Dental Biomaterials: A Systematic "
                "Review of Laboratory Studies",
                "topic": "Dentistry",
                "year": 2023,
            },
            "Endedijk_2021": {
                "authors": "Endedijk et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3907,
                "n_relevant": 295,
                "reference": "https://doi.org/10.3102/00346543211051428",
                "title": "The Teacher’s Invisible Hand: A Meta-Analysis of "
                "the Relevance of Teacher–Student Relationship "
                "Quality for Peer Relationships and the "
                "Contribution of Student Behavior",
                "topic": "Social Sciences",
                "year": 2021,
            },
            "Farisogullari_2023": {
                "authors": "Farisogullari et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3268,
                "n_relevant": 94,
                "reference": "https://doi.org/10.1136/rmdopen-2023-003349",
                "title": "Efficacy of pharmacological interventions: a "
                "systematic review informing the 2023 EULAR "
                "recommendations for the management of "
                "fatigue in people with inflammatory "
                "rheumatic and musculoskeletal diseases",
                "topic": "Medicine",
                "year": 2023,
            },
            "Fejza_2023": {
                "authors": "Fejza et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2506,
                "n_relevant": 47,
                "reference": "https://doi.org/10.3389/fimmu.2023.1270981",
                "title": "The entanglement of extracellular matrix molecules "
                "and immune checkpoint inhibitors in cancer: a "
                "systematic review of the literature",
                "topic": "Medicine",
                "year": 2023,
            },
            "Ferreira_2022": {
                "authors": "Ferreira et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 866,
                "n_relevant": 13,
                "reference": "https://doi.org/10.1017/s0007114522003506",
                "title": "Effects of selenium supplementation on glycaemic "
                "control markers in healthy rodents: a systematic "
                "review and meta-analysis",
                "topic": "Nursing",
                "year": 2022,
            },
            "Filges_2018": {
                "authors": "Filges et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 6157,
                "n_relevant": 138,
                "reference": "https://doi.org/10.4073/csr.2018.10",
                "title": "Small class sizes for improving student achievement "
                "in primary and secondary schools: a systematic "
                "review",
                "topic": "Arts and Humanities",
                "year": 2018,
            },
            "Filges_2022": {
                "authors": "Filges et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4577,
                "n_relevant": 28,
                "reference": "https://doi.org/10.1002/cl2.1210",
                "title": "Service learning for improving academic success in "
                "students in grade K to 12: A systematic review",
                "topic": "Social Sciences",
                "year": 2022,
            },
            "Fong_2021": {
                "authors": "Fong et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1339,
                "n_relevant": 119,
                "reference": "https://doi.org/10.1016/j.edurev.2021.100407",
                "title": "LASSI's great adventure: A meta-analysis of the "
                "Learning and Study Strategies Inventory and academic "
                "outcomes",
                "topic": "Psychology",
                "year": 2021,
            },
            "Giesen_2021": {
                "authors": "Giesen et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4198,
                "n_relevant": 43,
                "reference": "https://doi.org/10.29011/26889501.101265",
                "title": "Overview of Pain Interventions for Hospital and "
                "Community Care Nurses: A Systematic Scoping Review",
                "topic": "Medicine",
                "year": 2021,
            },
            "Greca_2023": {
                "authors": "Greca et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1163,
                "n_relevant": 78,
                "reference": "https://doi.org/10.1145/3579851",
                "title": "State of Practical Applicability of Regression "
                "Testing Research: A Live Systematic Literature "
                "Review",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Hall_2011": {
                "authors": "Hall et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 8669,
                "n_relevant": 104,
                "reference": "https://doi.org/10.1109/tse.2011.103",
                "title": "A Systematic Literature Review on Fault Prediction "
                "Performance in Software Engineering",
                "topic": "Computer Science",
                "year": 2011,
            },
            "Hamaker_2022": {
                "authors": "Hamaker et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3133,
                "n_relevant": 24,
                "reference": "https://doi.org/10.1016/j.jgo.2022.04.008",
                "title": "Geriatric assessment in the management of older "
                "patients with cancer – A systematic review "
                "(update)",
                "topic": "Medicine",
                "year": 2022,
            },
            "Hanlon_2022": {
                "authors": "Hanlon et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 206,
                "n_relevant": 16,
                "reference": "https://doi.org/10.12688/wellcomeopenres.17208.2",
                "title": "Frailty in people with rheumatoid arthritis: a "
                "systematic review of observational studies",
                "topic": "Medicine",
                "year": 2022,
            },
            "Harms_2024": {
                "authors": "Harms et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1548,
                "n_relevant": 71,
                "reference": "https://doi.org/10.1186/s42854-024-00066-2",
                "title": "Planning cities with nature for sustainability "
                "transformations\xa0— a systematic review",
                "topic": "Environmental Science",
                "year": 2024,
            },
            "Hilfiker_2017": {
                "authors": "Hilfiker et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 20485,
                "n_relevant": 1842,
                "reference": "https://doi.org/10.1136/bjsports-2016-096422",
                "title": "Exercise and other non-pharmaceutical "
                "interventions for cancer-related fatigue in "
                "patients during or after cancer treatment: a "
                "systematic review incorporating an "
                "indirect-comparisons meta-analysis",
                "topic": "Medicine",
                "year": 2017,
            },
            "Kapuka_2021": {
                "authors": "Kapuka et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 428,
                "n_relevant": 28,
                "reference": "https://doi.org/10.1002/ecs2.3860",
                "title": "Climate change impacts on ecosystems and adaptation "
                "options in nine countries in southern Africa: What "
                "do we know?",
                "topic": "Environmental Science",
                "year": 2021,
            },
            "Kerschbaumer_2022": {
                "authors": "Kerschbaumer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4544,
                "n_relevant": 42,
                "reference": "https://doi.org/10.1136/ard-2022-223365",
                "title": "Efficacy of synthetic and biological DMARDs: "
                "a systematic literature review informing the "
                "2022 update of the EULAR recommendations for "
                "the management of rheumatoid arthritis",
                "topic": "Immunology and Microbiology",
                "year": 2022,
            },
            "Kerschbaumer_2024a": {
                "authors": "Kerschbaumer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3242,
                "n_relevant": 36,
                "reference": "https://doi.org/10.1136/ard-2024-225534",
                "title": "Efficacy and safety of pharmacological "
                "treatment of psoriatic arthritis: a "
                "systematic literature research informing the "
                "2023 update of the EULAR recommendations for "
                "the management of psoriatic arthritis",
                "topic": "Medicine",
                "year": 2024,
            },
            "Kerschbaumer_2024b": {
                "authors": "Kerschbaumer et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1691,
                "n_relevant": 20,
                "reference": "https://doi.org/10.1136/ard-2024-225534",
                "title": "Efficacy and safety of pharmacological "
                "treatment of psoriatic arthritis: a "
                "systematic literature research informing the "
                "2023 update of the EULAR recommendations for "
                "the management of psoriatic arthritis",
                "topic": "Medicine",
                "year": 2024,
            },
            "Lauper_2021": {
                "authors": "Lauper et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 9520,
                "n_relevant": 211,
                "reference": "https://doi.org/10.1136/rmdopen-2021-001818",
                "title": "Analysing and reporting of observational data: a "
                "systematic review informing the EULAR points to "
                "consider when analysing and reporting comparative "
                "effectiveness research with observational data in "
                "rheumatology",
                "topic": "Medicine",
                "year": 2021,
            },
            "Leenaars_2019": {
                "authors": "Leenaars et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5873,
                "n_relevant": 17,
                "reference": "https://doi.org/10.5334/jcr.183",
                "title": "Sleep and Microdialysis: An Experiment and a "
                "Systematic Review of Histamine and Several Amino "
                "Acids",
                "topic": "Neuroscience",
                "year": 2019,
            },
            "Leenaars_2020": {
                "authors": "Leenaars et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 7394,
                "n_relevant": 590,
                "reference": "https://doi.org/10.3390/ani10061047",
                "title": "A Systematic Review Comparing Experimental Design "
                "of Animal and Human Methotrexate Efficacy Studies "
                "for Rheumatoid Arthritis: Lessons for the "
                "Translational Value of Animal Studies",
                "topic": "Medicine",
                "year": 2020,
            },
            "Lewowski_2021": {
                "authors": "Lewowski et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1642,
                "n_relevant": 45,
                "reference": "https://doi.org/10.1016/j.infsof.2021.106783",
                "title": "How far are we from reproducible research on code "
                "smell detection? A systematic literature review",
                "topic": "Computer Science",
                "year": 2021,
            },
            "Low_2023": {
                "authors": "Low et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1273,
                "n_relevant": 80,
                "reference": "https://doi.org/10.1016/j.agsy.2023.103606",
                "title": "Mixed farming and agroforestry systems: A systematic "
                "review on value chain implications",
                "topic": "Agricultural and Biological Sciences",
                "year": 2023,
            },
            "Maciel_2024": {
                "authors": "Maciel et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 987,
                "n_relevant": 60,
                "reference": "https://doi.org/10.1080/07481187.2024.2419605",
                "title": "Adult insecure attachment styles and suicidality: A "
                "meta-analysis",
                "topic": "Psychology",
                "year": 2024,
            },
            "Marques_2021": {
                "authors": "Marques et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1500,
                "n_relevant": 34,
                "reference": "https://doi.org/10.1136/rmdopen-2021-001647",
                "title": "Effectiveness of self-management interventions in "
                "inflammatory arthritis: a systematic review "
                "informing the 2021 EULAR recommendations for the "
                "implementation of self-management strategies in "
                "patients with inflammatory arthritis",
                "topic": "Medicine",
                "year": 2021,
            },
            "Meijboom_2021": {
                "authors": "Meijboom et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 891,
                "n_relevant": 37,
                "reference": "https://doi.org/10.1007/s40259-021-00508-4",
                "title": "Patients Retransitioning from Biosimilar TNFα "
                "Inhibitor to the Corresponding Originator After "
                "Initial Transitioning to the Biosimilar: A "
                "Systematic Review",
                "topic": "Immunology and Microbiology",
                "year": 2021,
            },
            "Mejean_2024": {
                "authors": "Méjean et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1005,
                "n_relevant": 127,
                "reference": "https://doi.org/10.1088/1748-9326/ad376e",
                "title": "Climate change impacts increase economic "
                "inequality: evidence from a systematic literature "
                "review",
                "topic": "Agricultural and Biological Sciences",
                "year": 2024,
            },
            "Menon_2022": {
                "authors": "Menon et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 950,
                "n_relevant": 74,
                "reference": "https://doi.org/10.1080/10408444.2022.2082917",
                "title": "The methodological rigour of systematic reviews in "
                "environmental health",
                "topic": "Social Sciences",
                "year": 2022,
            },
            "Mohamed_2023": {
                "authors": "Mohamed et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5539,
                "n_relevant": 95,
                "reference": "https://doi.org/10.1093/carcin/bgad091",
                "title": "Identification of biomarkers for the early "
                "detection of non-small cell lung cancer: a "
                "systematic review and meta-analysis",
                "topic": "Medicine",
                "year": 2023,
            },
            "Monschau_2025": {
                "authors": "Monschau et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 11228,
                "n_relevant": 72,
                "reference": "https://doi.org/10.31234/osf.io/zg3sw_v1",
                "title": "Data from the IMPROVE Project: Labelling "
                "Decisions and Metadata from an Umbrella Review on "
                "Patient-Generated Health Data in Digital Health",
                "topic": "Medicine",
                "year": 2025,
            },
            "Moran_2020": {
                "authors": "Moran et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5244,
                "n_relevant": 142,
                "reference": "https://doi.org/10.1111/brv.12655",
                "title": "Poor nutritional condition promotes high‐risk "
                "behaviours: a systematic review and meta‐analysis",
                "topic": "Psychology",
                "year": 2020,
            },
            "Moseng_2024": {
                "authors": "Moseng et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 6509,
                "n_relevant": 61,
                "reference": "https://doi.org/10.1136/ard-2023-225041",
                "title": "EULAR recommendations for the non-pharmacological "
                "core management of hip and knee osteoarthritis: "
                "2023 update",
                "topic": "Medicine",
                "year": 2024,
            },
            "Muthu_2020": {
                "authors": "Muthu et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2711,
                "n_relevant": 70,
                "reference": "https://doi.org/10.1097/brs.0000000000003645",
                "title": "Fragility Analysis of Statistically Significant "
                "Outcomes of Randomized Control Trials in Spine "
                "Surgery",
                "topic": "Medicine",
                "year": 2020,
            },
            "Nobrega-Dos_Santos_2023": {
                "authors": "Santos et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 982,
                "n_relevant": 23,
                "reference": "https://doi.org/10.1145/3613372.3613404",
                "title": "Evolution of Teamwork Quality "
                "Instruments in Agile Software "
                "Development: A Systematic Literature "
                "Review",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Noetel_2021": {
                "authors": "Noetel et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1077,
                "n_relevant": 29,
                "reference": "https://doi.org/10.3102/00346543211052329",
                "title": "Multimedia Design for Learning: An Overview of "
                "Reviews With Meta-Meta-Analysis",
                "topic": "Psychology",
                "year": 2021,
            },
            "Oliveira_2021": {
                "authors": "Oliveira et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 568,
                "n_relevant": 43,
                "reference": "https://doi.org/10.3389/fpsyg.2021.677217",
                "title": "Impacts of Social and Emotional Learning "
                "Interventions for Teachers on Teachers' Outcomes: "
                "A Systematic Review With Meta-Analysis",
                "topic": "Social Sciences",
                "year": 2021,
            },
            "Oud_2018": {
                "authors": "Oud et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 973,
                "n_relevant": 20,
                "reference": "https://doi.org/10.1177/0004867418791257",
                "title": "Specialized psychotherapies for adults with borderline "
                "personality disorder: A systematic review and "
                "meta-analysis",
                "topic": "Psychology",
                "year": 2018,
            },
            "Parodis_2023a": {
                "authors": "Parodis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 9559,
                "n_relevant": 111,
                "reference": "https://doi.org/10.1136/rmdopen-2023-003297",
                "title": "Systematic literature review informing the EULAR "
                "recommendations for the non-pharmacological "
                "management of systemic lupus erythematosus and "
                "systemic sclerosis",
                "topic": "Medicine",
                "year": 2023,
            },
            "Parodis_2023b": {
                "authors": "Parodis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3923,
                "n_relevant": 78,
                "reference": "https://doi.org/10.1136/rmdopen-2023-003297",
                "title": "Systematic literature review informing the EULAR "
                "recommendations for the non-pharmacological "
                "management of systemic lupus erythematosus and "
                "systemic sclerosis",
                "topic": "Medicine",
                "year": 2023,
            },
            "Pijls_2017": {
                "authors": "Pijls et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 255,
                "n_relevant": 22,
                "reference": "https://doi.org/10.1177/0284185117719575",
                "title": "Ribbing disease: a systematic review",
                "topic": "Biochemistry, Genetics and Molecular Biology",
                "year": 2017,
            },
            "Pijls_2018": {
                "authors": "Pijls et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1004,
                "n_relevant": 52,
                "reference": "https://doi.org/10.1080/17453674.2018.1443635",
                "title": "RSA migration of total knee replacements",
                "topic": "Medicine",
                "year": 2018,
            },
            "Pinos-Cisneros_2023": {
                "authors": "Pinos Cisneros et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 228,
                "n_relevant": 54,
                "reference": "https://doi.org/10.2196/44904",
                "title": "Playfulness and New Technologies in Hand "
                "Therapy for Children With Cerebral Palsy: "
                "Scoping Review",
                "topic": "Medicine",
                "year": 2023,
            },
            "Quevedo_2023": {
                "authors": "Quevedo et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 455,
                "n_relevant": 42,
                "reference": "https://doi.org/10.1109/access.2023.3333946",
                "title": "Legal Natural Language Processing From 2015 to "
                "2022: A Comprehensive Systematic Mapping Study of "
                "Advances and Applications",
                "topic": "Social Sciences",
                "year": 2023,
            },
            "Ramiro_2015": {
                "authors": "Ramiro et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1055,
                "n_relevant": 24,
                "reference": "https://doi.org/10.1136/annrheumdis-2015-208466",
                "title": "Pharmacological treatment of psoriatic arthritis: a "
                "systematic literature review for the 2015 update of "
                "the EULAR recommendations for the management of "
                "psoriatic arthritis",
                "topic": "Medicine",
                "year": 2015,
            },
            "Rinne_2021": {
                "authors": "Rinne et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1765,
                "n_relevant": 407,
                "reference": "https://doi.org/10.1016/j.healthplace.2021.102737",
                "title": "Delineating the geographic context of physical "
                "activities: A systematic search and scoping review "
                "of the methodological approaches used in social "
                "ecological research over two decades",
                "topic": "Social Sciences",
                "year": 2021,
            },
            "Roberts_2021": {
                "authors": "Roberts et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4304,
                "n_relevant": 24,
                "reference": "https://doi.org/10.3102/00346543211051423",
                "title": "Understanding the Dynamics of Dosage Response: A "
                "Nonlinear Meta-Analysis of Recent Reading "
                "Interventions",
                "topic": "Psychology",
                "year": 2021,
            },
            "Ruggeri_2019": {
                "authors": "Ruggeri et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5532,
                "n_relevant": 40,
                "reference": "https://doi.org/10.1177/1362361319885215",
                "title": "The effect of motor and physical activity "
                "intervention on motor outcomes of children with "
                "autism spectrum disorder: A systematic review",
                "topic": "Neuroscience",
                "year": 2019,
            },
            "Sanchez-Acedo_2023": {
                "authors": "Sanchez-Acedo et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 892,
                "n_relevant": 56,
                "reference": "https://doi.org/10.3390/mti7100096",
                "title": "Metaverse and Extended Realities in "
                "Immersive Journalism: A Systematic "
                "Literature Review",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Sanchez-Alvarez_2023": {
                "authors": "Sanchez-Alvarez et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 6134,
                "n_relevant": 132,
                "reference": "https://doi.org/10.1136/rmdopen-2023-003233",
                "title": "Measuring treatment outcomes and change in "
                "disease activity in giant cell arteritis: "
                "a systematic literature review informing "
                "the development of the EULAR-ACR response "
                "criteria on behalf of the EULAR-ACR "
                "response criteria in giant cell arteritis "
                "task force",
                "topic": "Medicine",
                "year": 2023,
            },
            "Sanchez-Gomez_2024": {
                "authors": "Sánchez-Gómez et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1142,
                "n_relevant": 22,
                "reference": "https://doi.org/10.3390/bs14040308",
                "title": "How to Assess Oral Narrative Skills of "
                "Children and Adolescents with Intellectual "
                "Disabilities: A Systematic Review",
                "topic": "Psychology",
                "year": 2024,
            },
            "Santos_2018": {
                "authors": "Santos et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2886,
                "n_relevant": 64,
                "reference": "https://doi.org/10.1016/j.jss.2018.07.035",
                "title": "A systematic review on the code smell effect",
                "topic": "Computer Science",
                "year": 2018,
            },
            "Seghers_2022": {
                "authors": "Seghers et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4523,
                "n_relevant": 28,
                "reference": "https://doi.org/10.3390/cancers14051147",
                "title": "Patient Preferences for Treatment Outcomes in "
                "Oncology with a Focus on the Older Patient—A "
                "Systematic Review",
                "topic": "Economics, Econometrics and Finance",
                "year": 2022,
            },
            "Sep_2021": {
                "authors": "Sep et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 268,
                "n_relevant": 40,
                "reference": "https://doi.org/10.1371/journal.pone.0249102",
                "title": "The rodent object-in-context task: A systematic review "
                "and meta-analysis of important variables",
                "topic": "Neuroscience",
                "year": 2021,
            },
            "Sepriano_2020": {
                "authors": "Sepriano et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3844,
                "n_relevant": 43,
                "reference": "https://doi.org/10.1136/annrheumdis-2019-216653",
                "title": "Safety of synthetic and biological DMARDs: a "
                "systematic literature review informing the 2019 "
                "update of the EULAR recommendations for the "
                "management of rheumatoid arthritis",
                "topic": "Medicine",
                "year": 2020,
            },
            "Sepriano_2022": {
                "authors": "Sepriano et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2792,
                "n_relevant": 86,
                "reference": "https://doi.org/10.1136/ard-2022-223357",
                "title": "Safety of synthetic and biological DMARDs: a "
                "systematic literature review informing the 2022 "
                "update of the EULAR recommendations for the "
                "management of rheumatoid arthritis",
                "topic": "Medicine",
                "year": 2022,
            },
            "Smid_2019": {
                "authors": "Smid et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2892,
                "n_relevant": 27,
                "reference": "https://doi.org/10.1080/10705511.2019.1577140",
                "title": "Bayesian Versus Frequentist Estimation for Structural "
                "Equation Models in Small Sample Contexts: A "
                "Systematic Review",
                "topic": "Mathematics",
                "year": 2019,
            },
            "Taschner_2024": {
                "authors": "Täschner et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3830,
                "n_relevant": 109,
                "reference": "https://doi.org/10.3102/00346543231221499",
                "title": "“Yes, I Can!” A Systematic Review and "
                "Meta-Analysis of Intervention Studies Promoting "
                "Teacher Self-Efficacy",
                "topic": "Social Sciences",
                "year": 2024,
            },
            "Tektonidou_2019": {
                "authors": "Tektonidou et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5653,
                "n_relevant": 180,
                "reference": "https://doi.org/10.1136/rmdopen-2019-000924",
                "title": "Management of thrombotic and obstetric "
                "antiphospholipid syndrome: a systematic "
                "literature review informing the EULAR "
                "recommendations for the management of "
                "antiphospholipid syndrome in adults",
                "topic": "Medicine",
                "year": 2019,
            },
            "Theobald_2021": {
                "authors": "Theobald et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 351,
                "n_relevant": 35,
                "reference": "https://doi.org/10.1016/j.cedpsych.2021.101976",
                "title": "Self-regulated learning training programs enhance "
                "university students’ academic performance, "
                "self-regulated learning strategies, and "
                "motivation: A meta-analysis",
                "topic": "Psychology",
                "year": 2021,
            },
            "Toffalini_2021": {
                "authors": "Toffalini et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 725,
                "n_relevant": 37,
                "reference": "https://doi.org/10.3758/s13428-021-01549-x",
                "title": "Dyslexia treatment studies: A systematic review "
                "and suggestions on testing treatment efficacy "
                "with small effects and small samples",
                "topic": "Psychology",
                "year": 2021,
            },
            "Tumkaya_2018": {
                "authors": "Tumkaya et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 721,
                "n_relevant": 52,
                "reference": "https://doi.org/10.1016/j.neubiorev.2018.07.016",
                "title": "A systematic review of Drosophila "
                "short-term-memory genetics: Meta-analysis reveals "
                "robust reproducibility",
                "topic": "Neuroscience",
                "year": 2018,
            },
            "Verdugo-Castro_2022": {
                "authors": "Verdugo-Castro et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3310,
                "n_relevant": 26,
                "reference": "https://doi.org/10.1016/j.heliyon.2022.e10300",
                "title": "The gender gap in higher STEM studies: A "
                "systematic literature review",
                "topic": "Social Sciences",
                "year": 2022,
            },
            "Viguie_2020": {
                "authors": "Viguié et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 5985,
                "n_relevant": 321,
                "reference": "https://doi.org/10.1088/1748-9326/abc044",
                "title": "When adaptation increases energy demand: A "
                "systematic map of the literature",
                "topic": "Environmental Science",
                "year": 2020,
            },
            "Walker_2018": {
                "authors": "Walker et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 47132,
                "n_relevant": 762,
                "reference": "https://doi.org/10.1016/j.envint.2017.12.032",
                "title": "Human and animal evidence of potential "
                "transgenerational inheritance of health effects: An "
                "evidence map and state-of-the-science evaluation",
                "topic": "Medicine",
                "year": 2018,
            },
            "Ward_2020": {
                "authors": "Ward et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1314,
                "n_relevant": 26,
                "reference": "https://doi.org/10.1177/1087054720972801",
                "title": "The Effects of ADHD Teacher Training Programs on "
                "Teachers and Pupils: A Systematic Review and "
                "Meta-Analysis",
                "topic": "Medicine",
                "year": 2020,
            },
            "Wassenaar_2017": {
                "authors": "Wassenaar et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 7549,
                "n_relevant": 111,
                "reference": "https://doi.org/10.1289/ehp1233",
                "title": "Systematic Review and Meta-Analysis of "
                "Early-Life Exposure to Bisphenol A and "
                "Obesity-Related Outcomes in Rodents",
                "topic": "Environmental Science",
                "year": 2017,
            },
            "Webers_2022": {
                "authors": "Webers et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 15474,
                "n_relevant": 129,
                "reference": "https://doi.org/10.1136/ard-2022-223298",
                "title": "Efficacy and safety of biological DMARDs: a "
                "systematic literature review informing the 2022 "
                "update of the ASAS-EULAR recommendations for the "
                "management of axial spondyloarthritis",
                "topic": "Medicine",
                "year": 2022,
            },
            "Wijnen_2024": {
                "authors": "Wijnen et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 807,
                "n_relevant": 7,
                "reference": "https://doi.org/10.5194/gc-7-91-2024",
                "title": "Evaluating the impact of climate communication "
                "activities by scientists: what is known and "
                "necessary?",
                "topic": "Social Sciences",
                "year": 2024,
            },
            "Williamson_2023": {
                "authors": "Williamson et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 832,
                "n_relevant": 13,
                "reference": "https://doi.org/10.1007/s11160-022-09751-6",
                "title": "The drivers of anguillid eel movement in lentic "
                "water bodies: a systematic map",
                "topic": "Environmental Science",
                "year": 2023,
            },
            "Wolters_2018": {
                "authors": "Wolters et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 4436,
                "n_relevant": 19,
                "reference": "https://doi.org/10.1016/j.jalz.2018.01.007",
                "title": "Coronary heart disease, heart failure, and the "
                "risk of dementia: A systematic review and "
                "meta‐analysis",
                "topic": "Medicine",
                "year": 2018,
            },
            "Xu_2022": {
                "authors": "Xu et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3165,
                "n_relevant": 62,
                "reference": "https://doi.org/10.1016/j.edurev.2022.100474",
                "title": "A conducive learning environment in international "
                "higher education: A systematic review of research on "
                "students’ perspectives",
                "topic": "Social Sciences",
                "year": 2022,
            },
            "Zakeri-Nasrabadi_2023a": {
                "authors": "Zakeri-Nasrabadi et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2202,
                "n_relevant": 42,
                "reference": "https://doi.org/10.1145/3596908",
                "title": "A Systematic Literature Review on the "
                "Code Smells Datasets and Validation "
                "Mechanisms",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Zakeri-Nasrabadi_2023b": {
                "authors": "Zakeri-Nasrabadi et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 8771,
                "n_relevant": 299,
                "reference": "https://doi.org/10.1016/j.jss.2023.111796",
                "title": "A systematic literature review on source "
                "code similarity measurement and clone "
                "detection: Techniques, applications, and "
                "challenges",
                "topic": "Computer Science",
                "year": 2023,
            },
            "Zanframundo_2022": {
                "authors": "Zanframundo et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3723,
                "n_relevant": 80,
                "reference": "https://doi.org/10.55563/clinexprheumatol/8xj0b9",
                "title": "Defining anti-synthetase syndrome: a "
                "systematic literature review",
                "topic": "Medicine",
                "year": 2022,
            },
            "Zinsser_2022": {
                "authors": "Zinsser et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 469,
                "n_relevant": 20,
                "reference": "https://doi.org/10.3102/00346543211070047",
                "title": "A Systematic Review of Early Childhood "
                "Exclusionary Discipline",
                "topic": "Social Sciences",
                "year": 2022,
            },
            "de_Matteis_2024a": {
                "authors": "De Matteis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 302,
                "n_relevant": 7,
                "reference": "https://doi.org/10.1136/ard-2024-225853",
                "title": "Systemic juvenile idiopathic arthritis and "
                "adult-onset Still's disease are the same "
                "disease: evidence from systematic reviews and "
                "meta-analyses informing the 2023 EULAR/PReS "
                "recommendations for the diagnosis and "
                "management of Still's disease",
                "topic": "Medicine",
                "year": 2024,
            },
            "de_Matteis_2024b": {
                "authors": "De Matteis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 866,
                "n_relevant": 32,
                "reference": "https://doi.org/10.1136/ard-2024-225853",
                "title": "Systemic juvenile idiopathic arthritis and "
                "adult-onset Still's disease are the same "
                "disease: evidence from systematic reviews and "
                "meta-analyses informing the 2023 EULAR/PReS "
                "recommendations for the diagnosis and "
                "management of Still's disease",
                "topic": "Medicine",
                "year": 2024,
            },
            "van_Ballegooijen_2024": {
                "authors": "van Ballegooijen et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 8806,
                "n_relevant": 182,
                "reference": "https://doi.org/10.1001/jamapsychiatry.2024.2854",
                "title": "Suicidal Ideation and Suicide Attempts "
                "After Direct or Indirect Psychotherapy",
                "topic": "Psychology",
                "year": 2024,
            },
            "van_Dis_2019": {
                "authors": "van Dis et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 9883,
                "n_relevant": 72,
                "reference": "https://doi.org/10.1001/jamapsychiatry.2019.3986",
                "title": "Long-term Outcomes of Cognitive Behavioral Therapy "
                "for Anxiety-Related Disorders",
                "topic": "Psychology",
                "year": 2019,
            },
            "van_Heugten_Breurkes_2022": {
                "authors": "van Heugten Breurkes et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 1415,
                "n_relevant": 48,
                "reference": "https://doi.org/10.1145/3530019.3530028",
                "title": "Overlap between Automated Unit and "
                "Acceptance Testing – a Systematic "
                "Literature Review",
                "topic": "Computer Science",
                "year": 2022,
            },
            "van_Hoorn_2020": {
                "authors": "van Hoorn et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 3468,
                "n_relevant": 38,
                "reference": "https://doi.org/10.1111/dmcn.14781",
                "title": "Risk factors in early life for developmental "
                "coordination disorder: a scoping review",
                "topic": "Medicine",
                "year": 2020,
            },
            "van_de_Schoot_2025": {
                "authors": "van de Schoot et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 14764,
                "n_relevant": 172,
                "reference": "https://doi.org/10.1080/20008066.2025.2546214",
                "title": "The hunt for the last relevant paper: "
                "blending the best of humans and AI",
                "topic": "Medicine",
                "year": 2025,
            },
            "van_der_Valk_2021": {
                "authors": "van der Valk et al.",
                "license": "See Synergy dataset",
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 774,
                "n_relevant": 90,
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
                "link": "https://doi.org/10.34894/DDCVCV",
                "n_records": 2148,
                "n_relevant": 33,
                "reference": "https://doi.org/10.1016/j.jgo.2022.09.012",
                "title": "A meta-analysis on the role older adults with "
                "cancer favour in treatment decision making",
                "topic": "Health Professions",
                "year": 2022,
            },
        }

        datasets = [SynergyDataSet(k, **v) for k, v in synergy_metadata.items()]

        super().__init__(*datasets)
