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

from difflib import SequenceMatcher
import hashlib
from pathlib import Path
import pkg_resources
from urllib.parse import urlparse
import re

import numpy as np
import pandas as pd

from asreview.config import LABEL_NA, COLUMN_DEFINITIONS
from asreview.exceptions import BadFileFormatError
from asreview.io.paper_record import PaperRecord
from asreview.io.ris_reader import write_ris
from asreview.io.utils import type_from_column, convert_keywords
from asreview.utils import format_to_str
from asreview.utils import is_iterable
from asreview.utils import is_url


def create_inverted_index(match_strings):
    index = {}
    WORD = re.compile("['\w]+")
    for i, match in enumerate(match_strings):
        tokens = WORD.findall(match.lower())
        for token in tokens:
            if token in index:
                if index[token][-1] != i:
                    index[token].append(i)
            else:
                index[token] = [i]
    return index


def match_best(keywords, index, match_strings, threshold=0.75):
    n_match = len(match_strings)
    WORD = re.compile("['\w]+")
    key_list = WORD.findall(keywords.lower())

    ratios = np.zeros(n_match)
    for key in key_list:
        cur_ratios = {}
        s = SequenceMatcher()
        s.set_seq2(key)
        for token in index:
            s.set_seq1(token)
            ratio = s.quick_ratio()
            if ratio < threshold:
                continue
            for idx in index[token]:
                if ratio > cur_ratios.get(idx, 0.0):
                    cur_ratios[idx] = ratio

        for idx, rat in cur_ratios.items():
            ratios[idx] += rat

    return (100*ratios)/len(key_list)


def token_set_ratio(keywords, match_strings):
    inv_index = create_inverted_index(match_strings)
    return match_best(keywords, inv_index, match_strings)


def get_fuzzy_scores(keywords, match_strings):
    """Rank a list of strings, depending on a set of keywords.

    Arguments
    ---------
    keywords: str
        Keywords that we are trying to find in the string list.
    str_list: list
        List of strings that should be scored according to the keywords.

    Returns
    -------
    np.ndarray:
        Array of scores ordered in the same way as the str_list input.
    """
    return token_set_ratio(keywords, match_strings)


class ASReviewData():
    """Data object to the dataset with texts, labels, DOIs etc.

    Arguments
    ---------
    df: pd.DataFrame
        Dataframe containing the data for the ASReview data object.
    data_name: str
        Give a name to the data object.
    data_type: str
        What kind of data the dataframe contains.
    column_spec: dict
        Specification for which column corresponds to which standard
        specification. Key is the standard specification, key is which column
        it is actually in.
    """

    def __init__(self, df=None, data_name="empty", data_type="standard",
                 column_spec=None):
        self.df = df
        self.data_name = data_name
        self.prior_idx = np.array([], dtype=int)
        if df is None:
            self.column_spec = {}
            return

        self.max_idx = max(df.index.values) + 1

        # Infer column specifications if it is not given.
        if column_spec is None:
            self.column_spec = {}
            for col_name in list(df):
                data_type = type_from_column(col_name, COLUMN_DEFINITIONS)
                if data_type is not None:
                    self.column_spec[data_type] = col_name
        else:
            self.column_spec = column_spec

        if "final_included" not in self.column_spec:
            self.column_spec["final_included"] = "final_included"

        if data_type == "included":
            self.labels = np.ones(len(self), dtype=int)
        if data_type == "excluded":
            self.labels = np.zeros(len(self), dtype=int)
        if data_type == "prior":
            self.prior_idx = df.index.values

    def hash(self):
        """Compute a hash from the dataset.

        Returns
        -------
        str:
            SHA1 hash, computed from the titles/abstracts of the dataframe.
        """
        if ((len(self.df.index) < 1000 and self.bodies is not None)
                or self.texts is None):
            texts = " ".join(self.bodies)
        else:
            texts = " ".join(self.texts)
        return hashlib.sha1(" ".join(texts).encode(
            encoding='UTF-8', errors='ignore')).hexdigest()

    def slice(self, idx):
        """Create a slice from itself.

        Useful if some parts should be kept/thrown away.

        Arguments
        ---------
        idx: list, np.ndarray
            Record ids that should be kept.

        Returns
        -------
        ASReviewData:
            Slice of itself.
        """
        if self.df is None:
            raise ValueError("Cannot slice empty ASReviewData object.")

        return ASReviewData(self.df[idx], data_name="sliced")

    def append(self, as_data):
        """Append another ASReviewData object.

        It puts the training data at the end.

        Arguments
        ---------
        as_data: ASReviewData
            Dataset to append.
        """
        if as_data.df is None:
            return
        if len(self) == 0:
            self.df = as_data.df
            self.data_name = as_data.data_name
            self.prior_idx = as_data.prior_idx
            self.max_idx = as_data.max_idx
            self.column_spec = as_data.column_spec
            return

        reindex_val = max(self.max_idx - min(as_data.df.index.values), 0)
        new_index = np.append(self.df.index.values,
                              as_data.df.index.values + reindex_val)
        new_priors = np.append(self.prior_idx, as_data.prior_idx + reindex_val)
        new_df = self.df.append(as_data.df, sort=False)
        new_df.index = new_index

        new_labels = None
        if self.labels is None and as_data.labels is not None:
            new_labels = np.append(np.full(len(self), LABEL_NA, dtype=int),
                                   as_data.labels)
        elif self.labels is not None and as_data.labels is None:
            new_labels = np.append(self.labels,
                                   np.full(len(as_data), LABEL_NA, dtype=int))
        self.max_idx = max(self.max_idx, as_data.max_idx, max(new_index))
        self.df = new_df
        if new_labels is not None:
            self.labels = new_labels
        self.prior_idx = new_priors
        self.data_name += "_" + as_data.data_name
        for data_type, col in as_data.column_spec.items():
            if data_type in self.column_spec:
                if self.column_spec[data_type] != col:
                    raise ValueError(
                        "Error merging dataframes: column specifications "
                        f"differ: {self.column_spec} vs {as_data.column_spec}")
            else:
                self.column_spec[data_type] = col

    @classmethod
    def from_file(cls, fp, read_fn=None, data_name=None, data_type=None):
        """Create instance from csv/ris/excel file.

        It works in two ways; either manual control where the conversion
        functions are supplied or automatic, where it searches in the entry
        points for the right conversion functions.

        Arguments
        ---------
        fp: str, Path
            Read the data from this file.
        read_fn: function
            Function to read the file. It should return a standardized
            dataframe.
        data_name: str
            Name of the data.
        data_type: str
            What kind of data it is. Special names: 'included', 'excluded',
            'prior'.
        """
        if is_url(fp):
            path = urlparse(fp).path
            new_data_name = Path(path.split("/")[-1]).stem
        else:
            path = str(Path(fp).resolve())
            new_data_name = Path(fp).stem

        if data_name is None:
            data_name = new_data_name

        if read_fn is not None:
            return cls(read_fn(fp), data_name=data_name,
                       data_type=data_type)

        entry_points = {
            entry.name: entry
            for entry in pkg_resources.iter_entry_points('asreview.readers')
        }
        best_suffix = None
        for suffix, entry in entry_points.items():
            if path.endswith(suffix):
                if best_suffix is None or len(suffix) > len(best_suffix):
                    best_suffix = suffix

        if best_suffix is None:
            raise ValueError(f"Error reading file {fp}, no capabilities for "
                             "reading such a file.")

        read_fn = entry_points[best_suffix].load()
        df, column_spec = read_fn(fp)
        return cls(df, column_spec=column_spec, data_name=data_name,
                   data_type=data_type)

    def record(self, i, by_index=True):
        """Create a record from an index.

        Arguments
        ---------
        i: int, iterable
            Index of the record, or list of indices.
        by_index: bool
            If True, take the i-th value as used internally by the review.
            If False, take the record with record_id==i.

        Returns
        -------
        PaperRecord:
            The corresponding record if i was an integer, or a list of records
            if i was an iterable.
        """
        if not is_iterable(i):
            index_list = [i]
        else:
            index_list = i

        if not by_index:
            records = [PaperRecord(**self.df.loc[j, :], record_id=j,
                                   column_spec=self.column_spec)
                       for j in index_list]
        else:
            records = [PaperRecord(**self.df.iloc[j],
                                   column_spec=self.column_spec,
                                   record_id=self.df.index.values[j])
                       for j in index_list]

        if is_iterable(i):
            return records
        return records[0]

    def preview_record(self, i, by_index=True, *args, **kwargs):
        "Return a preview string for record i."
        return self.record(i, by_index=by_index).preview(*args, **kwargs)

    def format_record(self, i, by_index=True, *args, **kwargs):
        "Format one record for displaying in the CLI."
        return self.record(i, by_index=by_index).format(*args, **kwargs)

    def print_record(self, *args, **kwargs):
        "Print a record to the CLI."
        print(self.format_record(*args, **kwargs))

    @property
    def match_string(self):
        match_str = np.full(len(self), "x", dtype=object)

        all_titles = self.title
        all_authors = self.authors
        all_keywords = self.keywords
        for i in range(len(self)):
            match_list = []
            if all_authors is not None:
                match_list.append(format_to_str(all_authors[i]))
            match_list.append(all_titles[i])
            if all_keywords is not None:
                match_list.append(format_to_str(all_keywords[i]))
            match_str[i, ] = " ".join(match_list)
        return match_str

    def fuzzy_find(self, keywords, threshold=60, max_return=10, exclude=None,
                   by_index=True):
        """Find a record using keywords.

        It looks for keywords in the title/authors/keywords
        (for as much is available). Using the diflib package it creates
        a ranking based on token set matching.

        Arguments
        ---------
        keywords: str
            A string of keywords together, can be a combination.
        threshold: float
            Don't return records below this threshold.
        max_return: int
            Maximum number of records to return.
        exclude: list, np.ndarray
            List of indices that should be excluded in the search. You would
            put papers that were already labeled here for example.
        by_index: bool
            If True, use internal indexing.
            If False, use record ids for indexing.
        Returns
        -------
        list:
            Sorted list of indexes that match best the keywords.
        """
        new_ranking = get_fuzzy_scores(keywords, self.match_string)
        sorted_idx = np.argsort(-new_ranking)
        best_idx = []
        if exclude is None:
            exclude = np.array([], dtype=int)
        for idx in sorted_idx:
            if ((not by_index and self.df.index.values[idx] in exclude)
                    or by_index and idx in exclude):
                continue
            if len(best_idx) >= max_return:
                break
            if len(best_idx) > 0 and new_ranking[idx] < threshold:
                break
            best_idx.append(idx)
        fuzz_idx = np.array(best_idx, dtype=np.int)
        if not by_index:
            fuzz_idx = self.df.index.values[fuzz_idx]
        return fuzz_idx.tolist()

    @property
    def record_ids(self):
        return self.df.index.values

    @property
    def texts(self):
        if self.headings is None:
            return self.bodies
        if self.bodies is None:
            return self.headings

        cur_texts = np.array([self.headings[i] + " " + self.bodies[i]
                              for i in range(len(self))
                              ], dtype=object)
        return cur_texts

    @property
    def headings(self):
        return self.title

    @property
    def title(self):
        try:
            return self.df[self.column_spec["title"]].values
        except KeyError:
            return None

    @property
    def bodies(self):
        return self.abstract

    @property
    def abstract(self):
        try:
            return self.df[self.column_spec["abstract"]].values
        except KeyError:
            return None

    @property
    def keywords(self):
        try:
            return self.df[self.column_spec["keywords"]].apply(
                convert_keywords).values
        except KeyError:
            return None

    @property
    def authors(self):
        try:
            return self.df[self.column_spec["authors"]].values
        except KeyError:
            return None

    def get(self, name):
        "Get column with name."
        try:
            return self.df[self.column_spec[name]].values
        except KeyError:
            return self.df[name].values

    @property
    def prior_data_idx(self):
        "Get prior_included, prior_excluded from dataset."
        convert_array = np.full(self.max_idx, 999999999)
        convert_array[self.df.index.values] = np.arange(len(self.df.index))
        return convert_array[self.prior_idx]

    @property
    def final_included(self):
        return self.labels

    @final_included.setter
    def final_included(self, labels):
        self.labels = labels

    @property
    def labels(self):
        try:
            column = self.column_spec["final_included"]
            return self.df[column].values
        except KeyError:
            return None

    @labels.setter
    def labels(self, labels):
        try:
            column = self.column_spec["final_included"]
            self.df[column] = labels
        except KeyError:
            self.df["final_included"] = labels

    @property
    def abstract_included(self):
        return self.get("abstract_included")

    @abstract_included.setter
    def abstract_included(self, abstract_included):
        try:
            column = self.column_spec["abstract_included"]
            self.df[column] = abstract_included
        except KeyError:
            self.df["abstract_included"] = abstract_included

    def prior_labels(self, state, by_index=True):
        """Get the labels that are marked as 'initial'.

        state: BaseState
            Open state that contains the label information.
        by_index: bool
            If True, return internal indexing.
            If False, return record_ids for indexing.

        Returns
        -------
        np.array:
            Array of indices that have the 'initial' property.
        """
        query_src = state.startup_vals()["query_src"]
        if "initial" not in query_src:
            return np.array([], dtype=int)
        if by_index:
            return np.array(query_src["initial"], dtype=int)
        return self.df.index.values[query_src["initial"]]

    def __len__(self):
        if self.df is None:
            return 0
        return len(self.df.index)

    def to_file(self, fp, labels=None, ranking=None):
        """Export data object to file.

        RIS, CSV and Excel are supported file formats at the moment.

        Arguments
        ---------
        fp: str
            Filepath to export to.
        labels: list, np.array
            Labels to be inserted into the dataframe before export.
        ranking: list, np.array
            Optionally, dataframe rows can be reordered.
        """
        if Path(fp).suffix in [".csv", ".CSV"]:
            self.to_csv(fp, labels=labels, ranking=ranking)
        elif Path(fp).suffix in [".ris", ".RIS"]:
            self.to_ris(fp, labels=labels, ranking=ranking)
        elif Path(fp).suffix in [".xlsx", ".XLSX"]:
            self.to_excel(fp, labels=labels, ranking=ranking)
        else:
            raise BadFileFormatError(
                f"Unknown file extension: {Path(fp).suffix}.\n"
                f"from file {fp}")

    def to_dataframe(self, labels=None, ranking=None):
        """Create new dataframe with updated label (order).

        Arguments
        ---------
        labels: list, np.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pd.DataFrame:
            Dataframe of all available record data.
        """
        new_df = pd.DataFrame.copy(self.df)
        col = self.column_spec["final_included"]
        if labels is not None:
            new_df[col] = labels
        if ranking is not None:
            # sort the datasets based on the ranking
            new_df = new_df.iloc[ranking]
            # append a column with 1 to n
            new_df["asreview_ranking"] = np.arange(1, len(new_df) + 1)

        if col in list(new_df):
            new_df[col] = new_df[col].astype(object)
            new_df.loc[new_df[col] == LABEL_NA, col] = np.nan
        return new_df

    def to_csv(self, fp, labels=None, ranking=None):
        """Export to csv.

        Arguments
        ---------
        fp: str, NoneType
            Filepath or None for buffer.
        labels: list, np.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pd.DataFrame:
            Dataframe of all available record data.
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)
        return df.to_csv(fp, index=True)

    def to_excel(self, fp, labels=None, ranking=None):
        """Export to Excel xlsx file.

        Arguments
        ---------
        fp: str, NoneType
            Filepath or None for buffer.
        labels: list, np.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pd.DataFrame:
            Dataframe of all available record data.
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)
        return df.to_excel(fp, index=True)

    def to_ris(self, ris_fp, labels=None, ranking=None):
        df = self.to_dataframe(labels=labels, ranking=ranking)
        write_ris(df, ris_fp)
