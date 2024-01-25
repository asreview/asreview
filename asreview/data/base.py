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

__all__ = ["Dataset", "Record"]

import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from pandas.api.types import is_object_dtype
from pandas.api.types import is_string_dtype

from asreview.config import COLUMN_DEFINITIONS
from asreview.config import LABEL_NA
from asreview.exceptions import BadFileFormatError
from asreview.utils import _entry_points
from asreview.utils import is_iterable


def _type_from_column(col_name, col_definitions):
    """Transform a column name to its standardized form.

    Arguments
    ---------
    col_name: str
        Name of the column in the dataframe.
    col_definitions: dict
        Dictionary of {standardized_name: [list of possible names]}.
        Ex. {"title": ["title", "primary_title"],
            "authors": ["authors", "author names", "first_authors"]}

    Returns
    -------
    str:
        The standardized name. If it wasn't found, return None.
    """
    for name, definition in col_definitions.items():
        if col_name.lower() in definition:
            return name
    return None


def _convert_keywords(keywords):
    """Split keywords separated by commas etc to lists."""
    if not isinstance(keywords, str):
        return keywords

    current_best = [keywords]
    for splitter in [", ", "; ", ": ", ";", ":"]:
        new_split = keywords.split(splitter)
        if len(new_split) > len(current_best):
            current_best = new_split
    return current_best


@dataclass
class Record:
    """A record from the dataset.

    The record contains only fields that are relevant for the
    systematic review. Other fields are stored not included.

    Arguments
    ---------
    record_id: int
        Identifier for this record.
    title: str
        Title of the record.
    abstract: str
        Abstract of the record.
    authors: str
        Authors of the record.
    notes: str
        Notes of the record.
    keywords: str
        Keywords of the record.
    included: int
        Label of the record.
    type_of_reference: str
        Type of reference.
    year: int
        Year of publication.
    doi: str
        DOI of the record.
    url: str
        URL of the record.
    is_prior: bool
        Whether the record is a prior record.
    """

    record_id: int
    title: str = None
    abstract: str = None
    authors: str = None
    notes: str = None
    keywords: str = None
    type_of_reference: str = None
    year: int = None
    doi: str = None
    url: str = None
    included: int = None
    is_prior: bool = False


class Dataset:
    """Dataset object to the dataset with texts, labels, DOIs etc.

    Arguments
    ---------
    df: pandas.DataFrame
        Dataframe containing the data for the ASReview data object.
    column_spec: dict
        Specification for which column corresponds to which standard
        specification. Key is the standard specification, key is which column
        it is actually in. Default: None.

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

    def __init__(self, df=None, column_spec=None):
        self.df = df
        self.column_spec = column_spec

        if column_spec is None:
            self._get_column_spec_df()

        self.df.columns = self.df.columns.str.strip()

        # Convert labels to integers.
        if self.column_spec and "included" in list(self.column_spec):
            col = self.column_spec["included"]
            self.df[col] = self.df[col].fillna(LABEL_NA).astype(int)

        self.df["record_id"] = np.arange(len(self.df.index)).astype("int64")
        self.df.set_index("record_id", inplace=True)

        # Check if we either have abstracts or titles.
        if "abstract" not in list(self.column_spec) and "title" not in list(
            self.column_spec
        ):
            raise BadFileFormatError(
                "File supplied without 'abstract' or 'title'" " fields."
            )
        if "abstract" not in list(self.column_spec):
            logging.warning("Unable to detect abstracts in dataset.")
        if "title" not in list(self.column_spec):
            logging.warning("Unable to detect titles in dataset.")

    def _get_column_spec_df(self):
        self.column_spec = {}
        for col_name in list(self.df):
            data_type = _type_from_column(col_name, COLUMN_DEFINITIONS)
            if data_type is not None:
                self.column_spec[data_type] = col_name

    def __len__(self):
        if self.df is None:
            return 0
        return len(self.df.index)

    def record(self, i):
        """Create a record from an index.

        Arguments
        ---------
        i: int, iterable
            Index of the record, or list of indices.

        Returns
        -------
        Record
            The corresponding record if i was an integer, or a list of records
            if i was an iterable.
        """
        if not is_iterable(i):
            index_list = [i]
        else:
            index_list = i

        column_spec_inv = {v: k for k, v in self.column_spec.items()}

        records = [
            Record(
                record_id=int(self.df.index.values[j]),
                **self.df.rename(column_spec_inv, axis=1)[self.column_spec.keys()]
                .iloc[j]
                .replace(np.nan, None)
                .to_dict(),
            )
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
        if self.title is None:
            return self.abstract
        if self.abstract is None:
            return self.title

        s_title = pd.Series(self.title)
        s_abstract = pd.Series(self.abstract)

        cur_texts = (s_title + " " + s_abstract).str.strip()

        return cur_texts.values

    @property
    def headings(self):
        return self.title

    @property
    def title(self):
        try:
            return self.df[self.column_spec["title"]].fillna("").values
        except KeyError:
            return None

    @property
    def bodies(self):
        return self.abstract

    @property
    def abstract(self):
        try:
            return self.df[self.column_spec["abstract"]].fillna("").values
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
            return self.df[self.column_spec["keywords"]].apply(_convert_keywords).values
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

    @property
    def url(self):
        try:
            return self.df[self.column_spec["url"]].values
        except KeyError:
            return None

    def get(self, name):
        "Get column with name."
        try:
            return self.df[self.column_spec[name]].values
        except KeyError:
            return self.df[name].values

    @property
    def included(self):
        return self.labels

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

    def is_prior(self):
        """Get the labels that are marked as 'prior'.

        Returns
        -------
        numpy.ndarray
            Array of booleans that have the 'prior' property.
        """

        column = self.column_spec["is_prior"]
        return self.df[column] == 1

    def to_file(
        self, fp, labels=None, ranking=None, writer=None, keep_old_labels=False
    ):
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
        writer: class
            Writer to export the file.
        keep_old_labels: bool
            If True, the old labels are kept in a column 'asreview_label_to_validate'.
            Default False.
        """
        df = self.to_dataframe(
            labels=labels, ranking=ranking, keep_old_labels=keep_old_labels
        )

        if writer is not None:
            writer().write_data(df, fp)
        else:
            best_suffix = None

            for entry in _entry_points(group="asreview.writers"):
                if Path(fp).suffix == entry.name:
                    if best_suffix is None or len(entry.name) > len(best_suffix):
                        best_suffix = entry.name

            if best_suffix is None:
                raise BadFileFormatError(
                    f"Error exporting file {fp}, no capabilities "
                    "for exporting such a file."
                )

            writer = _entry_points(group="asreview.writers")[best_suffix].load()
            writer.write_data(df, fp)

    def to_dataframe(self, labels=None, ranking=None, keep_old_labels=False):
        """Create new dataframe with updated label (order).

        Arguments
        ---------
        labels: list, numpy.ndarray
            Current labels will be overwritten by these labels
            (including unlabelled). No effect if labels is None.
        ranking: list
            Reorder the dataframe according to these record_ids.
            Default ordering if ranking is None.
        keep_old_labels: bool
            If True, the old labels are kept in a column 'asreview_label_to_validate'.
            Default False.

        Returns
        -------
        pandas.DataFrame
            Dataframe of all available record data.
        """
        result_df = pd.DataFrame.copy(self.df)

        # if there are labels, add them to the frame
        if "included" in self.column_spec and labels is not None:
            col_label = self.column_spec["included"]
            # unnest list of nested (record_id, label) tuples
            labeled_record_ids = [x[0] for x in labels]
            labeled_values = [x[1] for x in labels]

            if keep_old_labels:
                result_df["asreview_label_to_validate"] = (
                    result_df[col_label].replace(LABEL_NA, None).astype("Int64")
                )

            # remove the old results and write the values
            result_df[col_label] = LABEL_NA
            result_df.loc[labeled_record_ids, col_label] = labeled_values
            result_df[col_label] = (
                result_df[col_label].replace(LABEL_NA, None).astype("Int64")
            )

        # if there is a ranking, apply this ranking as order
        if ranking is not None:
            # sort the datasets based on the ranking
            result_df = result_df.loc[ranking]
            # append a column with 1 to n
            result_df["asreview_ranking"] = np.arange(1, len(result_df) + 1)

        return result_df

    def duplicated(self, pid="doi"):
        """Return boolean Series denoting duplicate rows.

        Identify duplicates based on titles and abstracts and if available,
        on a persistent identifier (PID) such as the Digital Object Identifier
        (`DOI <https://www.doi.org/>`_).

        Arguments
        ---------
        pid: string
            Which persistent identifier to use for deduplication.
            Default is 'doi'.

        Returns
        -------
        pandas.Series
            Boolean series for each duplicated rows.
        """
        if pid in self.df.columns:
            # in case of strings, strip whitespaces and replace empty strings with None
            if is_string_dtype(self.df[pid]) or is_object_dtype(self.df[pid]):
                s_pid = self.df[pid].str.strip().replace("", None)
                if pid == "doi":
                    s_pid = s_pid.str.lower().str.replace(
                        r"^https?://(www\.)?doi\.org/", "", regex=True
                    )
            else:
                s_pid = self.df[pid]

            # save boolean series for duplicates based on persistent identifiers
            s_dups_pid = (s_pid.duplicated()) & (s_pid.notnull())
        else:
            s_dups_pid = None

        # get the texts, clean them and replace empty strings with None
        s = (
            pd.Series(self.texts)
            .str.replace("[^A-Za-z0-9]", "", regex=True)
            .str.lower()
            .str.strip()
            .replace("", None)
        )

        # save boolean series for duplicates based on titles/abstracts
        s_dups_text = (s.duplicated()) & (s.notnull())

        # final boolean series for all duplicates
        if s_dups_pid is not None:
            s_dups = s_dups_pid | s_dups_text
        else:
            s_dups = s_dups_text

        return s_dups

    def drop_duplicates(self, pid="doi", inplace=False, reset_index=True):
        """Drop duplicate records.

        Drop duplicates based on titles and abstracts and if available,
        on a persistent identifier (PID) such the Digital Object Identifier
        (`DOI <https://www.doi.org/>`_).

        Arguments
        ---------
        pid: string, default 'doi'
            Which persistent identifier to use for deduplication.
        inplace: boolean, default False
            Whether to modify the DataFrame rather than creating a new one.
        reset_index: boolean, default True
            If True, the existing index column is reset to the default integer index.

        Returns
        -------
        pandas.DataFrame or None
            DataFrame with duplicates removed or None if inplace=True
        """
        df = self.df[~self.duplicated(pid)]

        if reset_index:
            df = df.reset_index(drop=True)
        if inplace:
            self.df = df
            return
        return Dataset(df, self.column_spec)
