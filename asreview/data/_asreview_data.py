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

import hashlib
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import urlopen

import numpy as np
import pandas as pd
from pandas.api.types import is_string_dtype

from asreview.config import COLUMN_DEFINITIONS
from asreview.config import LABEL_NA
from asreview.exceptions import BadFileFormatError
from asreview.io import PaperRecord
from asreview.io.utils import convert_keywords
from asreview.io.utils import type_from_column
from asreview.utils import get_entry_points
from asreview.utils import is_iterable
from asreview.utils import is_url


class ASReviewData:
    """Data object to the dataset with texts, labels, DOIs etc.

    Arguments
    ---------
    df: pandas.DataFrame
        Dataframe containing the data for the ASReview data object.
    column_spec: dict
        Specification for which column corresponds to which standard
        specification. Key is the standard specification, key is which column
        it is actually in. Default: None.

    """

    def __init__(self,
                 df=None,
                 column_spec=None):
        self.df = df
        self.prior_idx = np.array([], dtype=int)

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

    @classmethod
    def _get_filename_from_url(cls, url):

        if not is_url(url):
            raise ValueError(f"'{url}' is not a valid URL.")

        if Path(urlparse(url).path).suffix:
            return Path(urlparse(url).path).name, url
        else:

            try:
                return urlopen(url).headers.get_filename(), url
            except HTTPError as err:
                # 308 (Permanent Redirect) not supported
                # See https://bugs.python.org/issue40321
                if err.code == 308:
                    return ASReviewData._get_filename_from_url(err.headers.get("Location"))
                else:
                    raise err

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

    @classmethod
    def from_file(cls, fp, reader=None):
        """Create instance from supported file format.

        It works in two ways; either manual control where the conversion
        functions are supplied or automatic, where it searches in the entry
        points for the right conversion functions.

        Arguments
        ---------
        fp: str, pathlib.Path
            Read the data from this file or url.
        reader: class
            Reader to import the file.
        """

        if reader is not None:
            return cls(reader.read_data(fp))

        # get the filename from a url else file path
        if is_url(fp):
            fn, fp = ASReviewData._get_filename_from_url(fp)
        else:
            fn = Path(fp).name

        entry_points = get_entry_points(entry_name="asreview.readers")

        try:
            reader = entry_points[Path(fn).suffix].load()
        except Exception:
            raise BadFileFormatError(
                f"Importing file {fp} not possible.")

        df, column_spec = reader.read_data(fp)

        return cls(df, column_spec=column_spec)

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

        if by_index:
            records = [
                PaperRecord(**self.df.iloc[j],
                            column_spec=self.column_spec,
                            record_id=self.df.index.values[j])
                for j in index_list
            ]
        else:
            records = [
                PaperRecord(**self.df.loc[j, :],
                            record_id=j,
                            column_spec=self.column_spec) for j in index_list
            ]

        if is_iterable(i):
            return records
        return records[0]

    @property
    def record_ids(self):
        """An array representing the data in the Index.

        Returns
        -------

        numpy.ndarray
            An array representing the data in the Index.
        """
        return self.df.index.values

    @property
    def texts(self):
        """An array with either headings, bodies, or both.

        Returns
        -------

        numpy.ndarray
            An array with either headings, bodies, or both.
        """

        if self.title is None:
            return self.abstract
        if self.abstract is None:
            return self.title

        cur_texts = np.array([
            self.title[i] + " " + self.abstract[i] for i in range(len(self))
        ], dtype=object)
        return cur_texts

    @property
    def headings(self):
        """
        The dataset headings.

        Returns
        -------

        numpy.ndarray
            An array with dataset headings.
        """
        return self.title

    @property
    def title(self):
        """Alias for `headings`.

        Returns
        -------

        numpy.ndarray
            Alias for `headings`.
        """
        try:
            return self.df[self.column_spec["title"]].values
        except KeyError:
            return None

    @property
    def bodies(self):
        """
        Alias for `abstracts`.

        Returns
        -------

        numpy.ndarray
            Alias for `abstracts`.
        """
        return self.abstract

    @property
    def abstract(self):
        """
        The abstracts.

        Returns
        -------

        numpy.ndarray
            Identical to bodies.
        """
        try:
            return self.df[self.column_spec["abstract"]].values
        except KeyError:
            return None

    @property
    def notes(self):
        """An array with dataset notes.

        Returns
        -------

        numpy.ndarray
            An array with dataset notes.
        """
        try:
            return self.df[self.column_spec["notes"]].values
        except KeyError:
            return None

    @property
    def keywords(self):
        """
        The dataset keywords.

        Returns
        -------

        numpy.ndarray
            An array with dataset keywords.
        """
        try:
            return self.df[self.column_spec["keywords"]].apply(
                convert_keywords).values
        except KeyError:
            return None

    @property
    def authors(self):
        """
        The dataset authors.

        Returns:
        --------
        authors: numpy.ndarray
            An array with dataset authors.
        """
        try:
            return self.df[self.column_spec["authors"]].values
        except KeyError:
            return None

    @property
    def doi(self):
        """
        The dataset DOIs.

        Returns
        -------

        numpy.ndarray
            An array with dataset DOIs.
        """
        try:
            return self.df[self.column_spec["doi"]].values
        except KeyError:
            return None

    @property
    def url(self):
        """An array with dataset URLs.

        Returns
        -------
        numpy.ndarray
            An array with dataset URLs.
        """
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
    def prior_data_idx(self):
        "Get prior_included, prior_excluded from dataset."
        convert_array = np.full(self.max_idx, 999999999)
        convert_array[self.df.index.values] = np.arange(len(self.df.index))
        return convert_array[self.prior_idx]

    @property
    def included(self):
        """
        The dataset inclusion markers.

        Returns
        -------

        numpy.ndarray
            An array with inclusion markers.
        """
        return self.labels

    @included.setter
    def included(self, labels):
        self.labels = labels

    @property  # pending deprecation
    def final_included(self):
        """
        Pending deprecation! Document inclusion markers.

        Returns
        -------

        numpy.ndarray
            Pending deprecation! Document inclusion markers.
        """
        return self.labels

    @final_included.setter  # pending deprecation
    def final_included(self, labels):
        self.labels = labels

    @property
    def labels(self):
        """
        Alias for `included`.

        Returns
        -------

        numpy.ndarray
            Alias for `included`.
        """
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
    def n_records(self):
        """The number of records.

        Returns
        -------
        int:
            The number of records.
        """
        return len(self)

    @property
    def n_relevant(self):
        """The number of relevant records.

        Returns
        -------
        int:
            The number of relevant records.
        """
        if self.labels is not None:
            return len(np.where(self.labels == 1)[0])
        return None

    @property
    def n_irrelevant(self):
        """The number of irrelevant records.

        Returns
        -------
        int:
            The number of irrelevant records.
        """
        if self.labels is None:
            return None
        return len(np.where(self.labels == 0)[0])

    @property
    def n_unlabeled(self):
        """The number of unlabeled records.

        Returns
        -------
        int:
            The number of unlabeled records.
        """
        if self.labels is None:
            return None
        return len(self.labels) - self.n_relevant - self.n_irrelevant

    @property
    def n_missing_title(self):
        """The number of records with missing titles.

        Returns
        -------
        int:
            The number of records with missing titles.
        """
        n_missing = 0
        if self.title is None:
            return None, None
        if self.labels is None:
            n_missing_included = None
        else:
            n_missing_included = 0
        for i in range(len(self.title)):
            if len(self.title[i]) == 0:
                n_missing += 1
                if self.labels is not None and self.labels[i] == 1:
                    n_missing_included += 1
        return n_missing, n_missing_included

    @property
    def n_missing_abstract(self):
        """The number of records with missing abstracts.

        Returns
        -------
        int:
            The number of records with missing abstracts.
        """
        n_missing = 0
        if self.abstract is None:
            return None, None
        if self.labels is None:
            n_missing_included = None
        else:
            n_missing_included = 0

        for i in range(len(self.abstract)):
            if len(self.abstract[i]) == 0:
                n_missing += 1
                if self.labels is not None and self.labels[i] == 1:
                    n_missing_included += 1

        return n_missing, n_missing_included

    @property
    def title_length(self):
        """The average length of the titles.

        Returns
        -------
        int:
            The average length of the titles.
        """
        if self.title is None:
            return None
        avg_len = 0
        for i in range(len(self.title)):
            avg_len += len(self.title[i])
        return avg_len / len(self.title)

    @property
    def abstract_length(self):
        """The average length of the abstracts.

        Returns
        -------
        int:
            The average length of the abstracts.
        """
        if self.abstract is None:
            return None
        avg_len = 0
        for i in range(len(self.abstract)):
            avg_len += len(self.abstract[i])
        return avg_len / len(self.abstract)

    @property
    def n_keywords(self):
        """The number of keywords.

        Returns
        -------
        int:
            The number of keywords.
        """
        if self.keywords is None:
            return None
        return np.average([len(keywords) for keywords in self.keywords])

    @property
    def n_duplicates(self, pid='doi'):
        """The number of duplicates.

        Arguments
        ---------
        pid: string
            Which persistent identifier (PID) to use for deduplication.
            Default is 'doi'.

        Returns
        -------
        int:
            The number of duplicates
        """
        return int(self.duplicated(pid).sum())

    def prior_labels(self, state, by_index=True):
        """Get the labels that are marked as 'prior'.

        state: BaseState
            Open state that contains the label information.
        by_index: bool
            If True, return internal indexing.
            If False, return record_ids for indexing.

        Returns
        -------
        numpy.ndarray
            Array of indices that have the 'prior' property.
        """
        prior_indices = state.get_priors()["record_id"].to_list()

        if by_index:
            return np.array(prior_indices, dtype=int)
        else:
            return self.df.index.values[prior_indices]

    def to_file(self, fp, labels=None, ranking=None, writer=None):
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
        """
        df = self.to_dataframe(labels=labels, ranking=ranking)

        if writer is not None:
            writer.write_data(df, fp, labels=labels, ranking=ranking)
        else:
            entry_points = get_entry_points(entry_name="asreview.writers")

            best_suffix = None

            for suffix, entry in entry_points.items():
                if Path(fp).suffix == suffix:
                    if best_suffix is None or len(suffix) > len(best_suffix):
                        best_suffix = suffix

            if best_suffix is None:
                raise BadFileFormatError(f"Error exporting file {fp}, no capabilities "
                                         "for exporting such a file.")

            writer = entry_points[best_suffix].load()
            writer.write_data(df, fp, labels=labels, ranking=ranking)

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

    def duplicated(self, pid='doi'):
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
            if is_string_dtype(self.df[pid]):
                s_pid = self.df[pid].str.strip().replace("", None)
            else:
                s_pid = self.df[pid]

            # save boolean series for duplicates based on persistent identifiers
            s_dups_pid = ((s_pid.duplicated()) & (s_pid.notnull()))
        else:
            s_dups_pid = None

        # get the texts, clean them and replace empty strings with None
        s = pd.Series(self.texts) \
            .str.replace("[^A-Za-z0-9]", "", regex=True) \
            .str.lower().str.strip().replace("", None)

        # save boolean series for duplicates based on titles/abstracts
        s_dups_text = ((s.duplicated()) & (s.notnull()))

        # final boolean series for all duplicates
        if s_dups_pid is not None:
            s_dups = s_dups_pid | s_dups_text
        else:
            s_dups = s_dups_text

        return s_dups

    def drop_duplicates(self, pid='doi', inplace=False, reset_index=True):
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
        return df
