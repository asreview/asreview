# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

from pathlib import Path
import warnings
import pkg_resources
import os
import hashlib

import numpy as np
import pandas as pd

from asreview.exceptions import BadFileFormatError
from asreview.io.ris_reader import write_ris
from asreview.config import LABEL_NA

with warnings.catch_warnings():
    warnings.filterwarnings("ignore")
    from fuzzywuzzy import fuzz


def format_to_str(obj):
    if obj is None:
        return ""
    res = ""
    if isinstance(obj, list):
        for sub in obj:
            res += str(sub) + " "
    else:
        res = obj
    return res


def get_fuzzy_ranking(keywords, str_list):
    rank_list = np.zeros(len(str_list), dtype=np.float)
    for i, my_str in enumerate(str_list):
        rank_list[i] = fuzz.token_set_ratio(keywords, my_str)
    return rank_list


def record_list_hash(records):
    texts = " ".join([record.heading for record in records])
    if len(texts) < 1000:
        texts = " ".join([record.body for record in records])
    return hashlib.sha1(" ".join(texts).encode(
        encoding='UTF-8', errors='ignore'))


class ASReviewData(object):
    """Data object to store csv/ris file.

    Extracts relevant properties of papers."""

    def __init__(self, records=[], data_name="empty", data_type="standard"):
        self.records = records
        self.data_name = data_name
        if len(records) == 0:
            self.record_sources = {}
            return

        self.data_name = data_name
        self.record_sources = {
            data_name: {
                "start": 0,
                "end": len(records),
                "data_type": data_type,
                "hash": record_list_hash(self.records),
            }
        }
        if data_type == "included":
            for record in self.records:
                record.label = 1
        if data_type == "excluded":
            for record in self.records:
                record.label = 0

    def slice(self, idx):
        new_rec_src = {}
        new_records = []
        for data_name, source in self.record_sources.items():
            cur_idx = idx[np.where((idx >= source["start"])
                                   & (idx < source["end"]))[0]]
            sub_records = [self.records[idx] for idx in cur_idx]
            if len(cur_idx) > 0:
                new_rec_src[data_name] = {
                    "start": len(new_records),
                    "end": len(new_records) + len(cur_idx),
                    "data_type": source["data_type"],
                    "hash": record_list_hash(sub_records)
                }
                new_records.extend(sub_records)
                for record in new_records:
                    print(record.label)
        self.records = new_records
        self.record_sources = new_rec_src

    def append(self, as_data):
        """Append another ASReviewData object.

        It puts the training data at the end.

        Arguments
        ---------
        as_data: ASReviewData
            Dataset to append.
        """
        if len(as_data.records) == 0:
            return
        if len(self.records) == 0:
            self.records = as_data.records
            self.data_name = as_data.data_name
            self.record_sources = as_data.record_sources
            return

        all_sources = {name: dict(**source, self=True)
                       for name, source in self.record_sources.items()}
        for ext_data_name, source in as_data.record_sources.items():
            while ext_data_name in self.record_sources:
                ext_data_name += "_"
            all_sources[ext_data_name] = dict(**source, self=False)

        data_order = sorted(all_sources,
                            key=lambda key: all_sources[key]["hash"])

        new_records = []
        new_sources = {}
        for data_name in data_order:
            record_source = all_sources[data_name]
            from_self = record_source.pop("self")
            record_start = len(new_records)
            if from_self:
                new_records.append(
                    self.records[record_source["start"]:record_source["end"]])
            else:
                new_records.append(
                    as_data.records[
                        record_source["start"]:record_source["end"]])
            new_sources[data_name] = {
                "start": record_start,
                "end": len(new_records),
                "hash": record_source["hash"]
            }
        self.records = new_records
        self.record_sources = new_sources
        self.data_name += "_" + as_data.data_name

    @classmethod
    def from_file(cls, fp, data_name=None, read_fn=None, data_type=None):
        "Create instance from csv/ris/excel file."
        if data_name is None:
            data_name = Path(fp).stem

        if read_fn is not None:
            return cls([x for x in read_fn(fp)], data_name=data_name,
                       data_type=data_type)

        entry_points = {
            entry.name: entry
            for entry in pkg_resources.iter_entry_points('asreview.readers')
        }
        best_suffix = None
        for suffix, entry in entry_points.items():
            if str(Path(fp).resolve()).endswith(suffix):
                if best_suffix is None or len(suffix) > len(best_suffix):
                    best_suffix = suffix

        if best_suffix is None:
            raise ValueError(f"Error reading file {fp}, no capabilities for "
                             "reading such a file.")

        read_fn = entry_points[best_suffix].load()
        return cls([x for x in read_fn(fp)], data_name=data_name,
                   data_type=data_type)

    def preview_record(self, i, *args, **kwargs):
        "Return a preview string for record i."
        return self.records[i].preview(*args, **kwargs)

    def format_record(self, i, *args, **kwargs):
        " Format one record for displaying in the CLI. "
        return self.records[i].format(*args, **kwargs)

    def print_record(self, *args, **kwargs):
        "Print a record to the CLI."
        print(self.format_record(*args, **kwargs))

    def fuzzy_find(self, keywords, threshold=50, max_return=10, exclude=None):
        """Find a record using keywords.

        It looks for keywords in the title/authors/keywords
        (for as much is available). Using the fuzzywuzzy package it creates
        a ranking based on token set matching.

        Arguments
        ---------
        keywords: str
            A string of keywords together, can be a combination.
        threshold: float
            Don't return records below this threshold.
        max_return: int
            Maximum number of records to return.

        Returns
        -------
        list:
            Sorted list of indexes that match best the keywords.
        """
        match_str = np.full(len(self.records), "x", dtype=object)

        for i, record in enumerate(self.records):
            authors = format_to_str(record.authors)
            title = format_to_str(record.title)
            rec_keywords = format_to_str(record.keywords)
            match_str[i, ] = " ".join([title, authors, rec_keywords])

        new_ranking = get_fuzzy_ranking(keywords, match_str)
        sorted_idx = np.argsort(-new_ranking)
        best_idx = []
        for idx in sorted_idx:
            if idx in exclude:
                continue
            if len(best_idx) >= max_return:
                break
            if len(best_idx) > 0 and new_ranking[idx] < threshold:
                break
            best_idx.append(idx)
        return np.array(best_idx, dtype=np.int).tolist()

    @property
    def texts(self):
        return [record.text for record in self.records]

    @property
    def headings(self):
        return [record.heading for record in self.records]

    @property
    def title(self):
        return self.headings

    @property
    def bodies(self):
        return [record.body for record in self.records]

    @property
    def abstract(self):
        return self.bodies

    @property
    def prior_data_idx(self):
        "Get prior_included, prior_excluded from dataset."
        prior_idx = []
        for rec_source in self.record_sources.values():
            if rec_source["data_type"] == "prior":
                prior_idx.extend(
                    list(range(rec_source["start"], rec_source["end"])))
        return prior_idx

    @property
    def labels(self):
        return np.array([record.label for record in self.records], dtype=int)

    @labels.setter
    def labels(self, labels):
        print("Set labels")
        for i, record in enumerate(labels):
            record[i].label = labels[i]

    @property
    def final_labels(self):
        return None

    def to_file(self, fp, labels=None, df_order=None):
        """
        Export data object to file.
        Both RIS and CSV are supported file formats at the moment.

        Arguments
        ---------
        fp: str
            Filepath to export to.
        labels: list, np.array
            Labels to be inserted into the dataframe before export.
        df_order: list, np.array
            Optionally, dataframe rows can be reordered.
        """
        if Path(fp).suffix in [".csv", ".CSV"]:
            self.to_csv(fp, labels=labels, df_order=df_order)
        elif Path(fp).suffix in [".ris", ".RIS"]:
            self.to_ris(fp, labels=labels, df_order=df_order)
        else:
            raise BadFileFormatError(
                f"Unknown file extension: {Path(fp).suffix}.\n"
                f"from file {fp}")

    def to_dataframe(self, labels=None, df_order=None):
        if df_order is None:
            df_order = np.arange(len(self.records))

        df_dict = {}
        for i in df_order:
            record = self.records[i]
            add_dict = record.todict()
            if labels is not None and labels[i] != LABEL_NA:
                add_dict["label"] = labels[i]
            if len(df_dict) > 0:
                for key, value in add_dict.items():
                    df_dict[key].append(value)
            else:
                for key, value in add_dict.items():
                    df_dict[key] = [value]
        return pd.DataFrame(df_dict)

    def to_csv(self, fp, labels=None, df_order=None):
        self.to_dataframe(labels=labels, df_order=df_order).to_csv(fp)

    def to_ris(self, ris_fp, labels=None, df_order=None):
        df = self.to_dataframe(labels=labels, df_order=df_order)
        write_ris(df, ris_fp)
