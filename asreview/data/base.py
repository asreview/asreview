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

import hashlib
import pkg_resources
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import pandas as pd

from asreview.config import COLUMN_DEFINITIONS
from asreview.config import LABEL_NA
from asreview.exceptions import BadFileFormatError
from asreview.io.paper_record import PaperRecord
from asreview.io.ris_writer import write_ris
from asreview.io.utils import type_from_column
from asreview.io.utils import convert_keywords
from asreview.utils import is_iterable
from asreview.utils import is_url


class ASReviewData():
    """Data object to the dataset with texts, labels, DOIs etc.

    Arguments
    ---------
    df: pandas.DataFrame
        Dataframe containing the data for the ASReview data object.
    data_name: str
        Give a name to the data object.
    data_type: str
        What kind of data the dataframe contains.
    column_spec: dict
        Specification for which column corresponds to which standard
        specification. Key is the standard specification, key is which column
        it is actually in.

    Attributes
    ----------
    record_ids: numpy.ndarray
        Return an array representing the data in the Index.
    texts: numpy.ndarray
        Returns an array with either headings, bodies, or both.
    headings: numpy.ndarray
        Returns an array with dataset headings.
    title: numpy.ndarray
        Identical to headings.
    bodies: numpy.ndarray
        Returns an array with dataset bodies.
    abstract: numpy.ndarray
        Identical to bodies.
    notes: numpy.ndarray
        Returns an array with dataset notes.
    keywords: numpy.ndarray
        Returns an array with dataset keywords.
    authors: numpy.ndarray
        Returns an array with dataset authors.
    doi: numpy.ndarray
        Returns an array with dataset DOI.
    included: numpy.ndarray
        Returns an array with document inclusion markers.
    final_included: numpy.ndarray
        Pending deprecation! Returns an array with document inclusion markers.
    labels: numpy.ndarray
        Identical to included.

    """

    def __init__(self,
                 df=None,
                 data_name="empty",
                 data_type="standard",
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

        if "included" not in self.column_spec:
            self.column_spec["included"] = "included"

        if "notes" not in self.column_spec:
            self.column_spec["notes"] = "notes"

        if data_type == "included":
            self.labels = np.ones(len(self), dtype=int)
        if data_type == "excluded":
            self.labels = np.zeros(len(self), dtype=int)
        if data_type == "prior":
            self.prior_idx = df.index.values

    def __len__(self):
        if self.df is None:
            return 0
        return len(self.df.index)

    def hash(self):
        """Compute a hash from the dataset.

        Returns
        -------
        str:
            SHA1 hash, computed from the titles/abstracts of the dataframe.
        """
        if ((len(self.df.index) < 1000 and self.bodies is not None) or
                self.texts is None):
            texts = " ".join(self.bodies)
        else:
            texts = " ".join(self.texts)
        return hashlib.sha1(" ".join(texts).encode(
            encoding='UTF-8', errors='ignore')).hexdigest()

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
        fp: str, pathlib.Path
            Read the data from this file.
        read_fn: callable
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
            return cls(read_fn(fp), data_name=data_name, data_type=data_type)

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
        return cls(df,
                   column_spec=column_spec,
                   data_name=data_name,
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
        PaperRecord
            The corresponding record if i was an integer, or a list of records
            if i was an iterable.
        """
        if not is_iterable(i):
            index_list = [i]
        else:
            index_list = i

        if not by_index:
            records = [
                PaperRecord(**self.df.loc[j, :],
                            record_id=j,
                            column_spec=self.column_spec) for j in index_list
            ]
        else:
            records = [
                PaperRecord(**self.df.iloc[j],
                            column_spec=self.column_spec,
                            record_id=self.df.index.values[j])
                for j in index_list
            ]

        if is_iterable(i):
            return records
        return records[0]

    @property
    def record_ids(self):
        return self.df.index.values

    @property
    def texts(self):
        if self.headings is None:
            return self.bodies
        if self.bodies is None:
            return self.headings

        cur_texts = np.array([
            self.headings[i] + " " + self.bodies[i] for i in range(len(self))
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
    def notes(self):
        try:
            return self.df[self.column_spec["notes"]].values
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

    @property
    def doi(self):
        try:
            return self.df[self.column_spec["doi"]].values
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
    def included(self):
        return self.labels

    @included.setter
    def included(self, labels):
        self.labels = labels

    @property  # pending deprecation
    def final_included(self):
        return self.labels

    @final_included.setter  # pending deprecation
    def final_included(self, labels):
        self.labels = labels

    @property
    def labels(self):
        try:
            column = self.column_spec["included"]
            return self.df[column].values
        except KeyError:
            return None

    @labels.setter
    def labels(self, labels):
        try:
            column = self.column_spec["included"]
            self.df[column] = labels
        except KeyError:
            self.df["included"] = labels

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
        numpy.ndarray
            Array of indices that have the 'initial' property.
        """
        query_src = state.startup_vals()["query_src"]
        if "initial" not in query_src:
            return np.array([], dtype=int)
        if by_index:
            return np.array(query_src["initial"], dtype=int)
        return self.df.index.values[query_src["initial"]]

    def to_file(self, fp, labels=None, ranking=None):
        """Export data object to file.

        RIS, CSV, TSV and Excel are supported file formats at the moment.

        Arguments
        ---------
        fp: str
            Filepath to export to.
        labels: list, numpy.ndarray
            Labels to be inserted into the dataframe before export.
        ranking: list, numpy.ndarray
            Optionally, dataframe rows can be reordered.
        """
        if Path(fp).suffix in [".csv", ".CSV"]:
            self.to_csv(fp, labels=labels, ranking=ranking)
        elif Path(fp).suffix in [".tsv", ".TSV", ".tab", ".TAB"]:
            self.to_csv(fp, sep="\t", labels=labels, ranking=ranking)
        elif Path(fp).suffix in [".ris", ".RIS", ".txt", ".TXT"]:
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
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these record_ids.
            Default ordering if ranking is None.

        Returns
        -------
        pandas.DataFrame
            Dataframe of all available record data.
        """
        result_df = pd.DataFrame.copy(self.df)
        col_label = self.column_spec["included"]

        # if there are labels, add them to the frame
        if labels is not None:

            # unnest the nested (record_id, label) tuples
            labeled_record_ids = [x[0] for x in labels]
            labeled_values = [x[1] for x in labels]

            # remove the old results and write the values
            result_df[col_label] = LABEL_NA
            result_df.loc[labeled_record_ids, col_label] = labeled_values

        # if there is a ranking, apply this ranking as order
        if ranking is not None:
            # sort the datasets based on the ranking
            result_df = result_df.loc[ranking]
            # append a column with 1 to n
            result_df["asreview_ranking"] = np.arange(1, len(result_df) + 1)

        # replace labeled NA values by np.nan
        if col_label in list(result_df):
            result_df[col_label] = result_df[col_label].astype(object)
            result_df.loc[result_df[col_label] == LABEL_NA, col_label] = np.nan

        return result_df

    def to_csv(self, fp, sep=",", labels=None, ranking=None):
        """Export to csv.

        Arguments
        ---------
        fp: str, NoneType
            Filepath or None for buffer.
        sep: str
            Seperator of the file.
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pandas.DataFrame
            Dataframe of all available record data.
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)
        return df.to_csv(fp, sep=sep, index=True)

    def to_excel(self, fp, labels=None, ranking=None):
        """Export to Excel xlsx file.

        Arguments
        ---------
        fp: str, NoneType
            Filepath or None for buffer.
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pandas.DataFrame
            Dataframe of all available record data.
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)
        return df.to_excel(fp, index=True)

    def to_ris(self, fp, labels=None, ranking=None):
        """Export to RIS (.ris) file.

        Arguments
        ---------
        fp: str, NoneType
            Filepath or None for buffer.
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these (internal) indices.
            Default ordering if ranking is None.

        Returns
        -------
        pandas.DataFrame
            Dataframe of all available record data.
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)
        return write_ris(df, fp)
