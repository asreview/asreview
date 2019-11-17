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

import logging
from pathlib import Path
import warnings

import numpy as np
import pandas as pd
from RISparser import readris
from RISparser import TAG_KEY_MAPPING

from asreview.config import NOT_AVAILABLE

with warnings.catch_warnings():
    warnings.filterwarnings("ignore")
    from fuzzywuzzy import fuzz

RIS_KEY_LABEL_INCLUDED = "LI"
NAME_LABEL_INCLUDED = "label_included"
LABEL_INCLUDED_VALUES = [
    "label_included",
    "included_label",
    "included_final",
    "included",
    "included_flag"
]


def _tag_key_mapping(reverse=False):
    # Add label_included into the specification and create reverse mapping.
    TAG_KEY_MAPPING[RIS_KEY_LABEL_INCLUDED] = NAME_LABEL_INCLUDED
    KEY_TAG_MAPPING = {TAG_KEY_MAPPING[key]: key for key in TAG_KEY_MAPPING}
    for label in LABEL_INCLUDED_VALUES:
        KEY_TAG_MAPPING[label] = "LI"
    if reverse:
        return KEY_TAG_MAPPING
    else:
        return TAG_KEY_MAPPING


def get_fuzzy_ranking(keywords, str_list):
    rank_list = np.zeros(len(str_list), dtype=np.float)
    for i, my_str in enumerate(str_list):
        rank_list[i] = fuzz.token_set_ratio(keywords, my_str)
    return rank_list


class ASReviewData(object):
    """ Data object to store csv/ris file. Extracts relevant properties
        of papers. """
    def __init__(self, raw_df, labels=None, title=None, abstract=None,
                 keywords=None, article_id=None, authors=None,
                 label_col=LABEL_INCLUDED_VALUES[0], final_labels=None):
        self.raw_df = raw_df
        self.labels = labels
        self.title = title
        self.abstract = abstract
        self.label_col = label_col
        self.keywords = keywords
        self.article_id = article_id
        self.authors = authors
        self.final_labels = final_labels

        if authors is None:
            print("Warning: could not locate authors in data.")
        if title is None:
            print("Warning could not locate titles in data.")
        if abstract is None:
            print("Warning could not locate abstracts in data.")

        if article_id is None:
            self.article_id = np.arange(len(raw_df.index))

    @classmethod
    def from_data_frame(cls, raw_df, abstract_only=False):
        """ Get a review data object from a pandas dataframe. """
        # extract the label column
        column_labels = [label for label in list(raw_df)
                         if label in LABEL_INCLUDED_VALUES]

        if len(column_labels) > 1:
            print('\x1b[0;30;41m Warning multiple valid label inclusion '
                  'columns detected. \x1b[0m')
            print(f'Possible values: {column_labels}.')
            print(f'Choosing the one with the highest priority: '
                  f'{column_labels[0]}')
        data_kwargs = {"raw_df": raw_df}

        if len(column_labels) > 0:
            data_kwargs['labels'] = np.array(raw_df[column_labels[0]].fillna(
                NOT_AVAILABLE).values, dtype=np.int)
            data_kwargs['label_col'] = column_labels[0]

        if 'inclusion_code' in raw_df.columns and abstract_only:
            inclusion_codes = raw_df['inclusion_code'].fillna(
                NOT_AVAILABLE).values
            inclusion_codes = np.array(inclusion_codes, dtype=np.int)
            data_kwargs['final_labels'] = data_kwargs['labels']
            data_kwargs['labels'] = inclusion_codes > 0

        def fill_column(dst_dict, keys):
            if not isinstance(keys, list):
                keys = [keys]
            dst_key = keys[0]
            df_columns = {col_name.lower(): col_name
                          for col_name in list(raw_df)}
            for key in keys:
                try:
                    dst_dict[dst_key] = raw_df[df_columns[key]].fillna('').values
                except KeyError:
                    pass

        for key in [['title', 'primary_title'],
                    ['authors', 'author names'],
                    'abstract', 'keywords']:
            fill_column(data_kwargs, key)

        return cls(**data_kwargs)

    @classmethod
    def from_csv(cls, fp, *args, **kwargs):
        return cls.from_data_frame(pd.DataFrame(read_csv(fp)), *args, **kwargs)

    @classmethod
    def from_ris(cls, fp, *args, **kwargs):
        return cls.from_data_frame(pd.DataFrame(read_ris(fp)), *args, **kwargs)

    @classmethod
    def from_file(cls, fp, *args, **kwargs):
        "Create instance from csv/ris file."
        if Path(fp).suffix in [".csv", ".CSV"]:
            return cls.from_csv(fp, *args, **kwargs)
        if Path(fp).suffix in [".ris", ".RIS"]:
            return cls.from_ris(fp, *args, **kwargs)
        raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                         f"from file {fp}")

    def preview_record(self, i, w_title=80, w_authors=40):
        "Return a preview string for record i."
        title_str = ""
        author_str = ""
        if self.title is not None:
            if len(self.title[i]) > w_title:
                title_str = self.title[i][:w_title-2] + ".."
            else:
                title_str = self.title[i]
        if self.authors is not None:
            if len(self.authors[i]) > w_authors:
                author_str = self.authors[i][:w_authors-2] + ".."
            else:
                author_str = self.authors[i]
        format_str = "{0: <" + str(w_title) + "}   " + "{1: <" + str(w_authors)
        format_str += "}"
        prev_str = format_str.format(title_str, author_str)
        return prev_str

    def format_record(self, i, use_cli_colors=True):
        " Format one record for displaying in the CLI. "
        if self.title is not None and len(self.title[0]) > 0:
            title = self.title[i]
            if use_cli_colors:
                title = "\033[95m" + title + "\033[0m"
            title += "\n"
        else:
            title = ""

        if self.authors is not None and len(self.authors[i]) > 0:
            authors = self.authors[i] + "\n"
        else:
            authors = ""

        if self.abstract is not None and len(self.abstract[i]) > 0:
            abstract = self.abstract[i]
            abstract = "\n" + abstract + "\n"
        else:
            abstract = ""

        return ("\n\n----------------------------------"
                f"\n{title}{authors}{abstract}"
                "----------------------------------\n\n")

    def print_record(self, *args, **kwargs):
        "Print a record to the CLI."
        print(self.format_record(*args, **kwargs))

    def fuzzy_find(self, keywords, threshold=50, max_return=10,
                   exclude=None):
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
        match_str = ""
        if self.title is not None:
            match_str += self.title + " "
        if self.authors is not None:
            match_str += self.authors + " "
        if self.keywords is not None:
            if isinstance(self.keywords[0], list):
                new_keywords = np.array([" ".join(x) for x in self.keywords])
                print(match_str.shape, self.title.shape, new_keywords.shape)
            else:
                new_keywords = self.keywords
            match_str += new_keywords

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

    def get_data(self):
        "Equivalent of 'read_data'; get texts, labels from data object."
        texts = []
        for i in range(len(self.title)):
            texts.append(self.title[i] + " " + self.abstract[i])
        return self.raw_df, np.array(texts), self.labels

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
            raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                             f"from file {fp}")

    def to_csv(self, csv_fp, labels=None, df_order=None):
        new_df = self.raw_df.copy()
        if labels is not None:
            new_df[self.label_col] = labels

        if df_order is not None:
            new_df = self.raw_df.reindex(df_order)
        new_df.to_csv(csv_fp)

    def to_ris(self, ris_fp, labels=None, df_order=None):
        new_df = self.raw_df.copy()
        if labels is not None:
            new_df[self.label_col] = labels

        if df_order is not None:
            new_df = self.raw_df.reindex(df_order)
        write_ris(new_df, ris_fp)


def write_ris(df, ris_fp):
    """Write dataframe to RIS file.

    Arguments
    ---------
    df: pandas.Dataframe
        Dataframe to export.
    ris_fp: str
        RIS file to export to.
    """
    column_names = list(df)
    column_key = []
    for col in column_names:
        try:
            rev_mapping = _tag_key_mapping(reverse=True)
            column_key.append(rev_mapping[col])
        except KeyError:
            column_key.append('UK')
            logging.info(f"Cannot find column {col} in specification.")

    n_row = df.shape[0]

    # According to RIS specifications, a record should begin with TY.
    # Thus, the column id is inserted before all the other.
    col_order = []
    for i, key in enumerate(column_key):
        if key == 'TY':
            col_order.insert(0, i)
        else:
            col_order.append(i)

    with open(ris_fp, "w") as fp:
        for i_row in range(n_row):
            for i_col in col_order:
                value = df.iloc[i_row, i_col]
                if isinstance(value, list):
                    for val in value:
                        fp.write(f"{column_key[i_col]}  - {val}\n")
                else:
                    fp.write(f"{column_key[i_col]}  - {value}\n")
            fp.write("ER  - \n\n")


def read_data(fp):
    """Load papers and their labels.

    Arguments
    ---------
    fp: str
        File path to the data.

    Returns
    -------
    np.ndarray, np.array
        The title and abstract merged into a single string for each paper.
        The labels for each paper. 1 is included, 0 is excluded. If this column
        is not available, this column is not returned.
    """

    if Path(fp).suffix in [".csv", ".CSV"]:
        data = read_csv(fp)
    elif Path(fp).suffix in [".ris", ".RIS"]:
        data = read_ris(fp)
    else:
        raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                         f"from file {fp}")

    # parse data in pandas dataframe
    df = pd.DataFrame(data)

    # make texts
    texts = (df['title'].fillna('') + ' ' + df['abstract'].fillna(''))

    # extract the label column
    column_labels = [label for label in list(df)
                     if label in LABEL_INCLUDED_VALUES]

    if len(column_labels) > 1:
        print('\x1b[0;30;41m Warning multiple valid label inclusion '
              'columns detected. \x1b[0m')
        print(f'Possible values: {column_labels}.')
        print(f'Choosing the one with the highest priority: '
              f'{column_labels[0]}')
    elif len(column_labels) == 0:
        return df, texts.values, None
    labels = df[column_labels[0]].fillna(NOT_AVAILABLE)
    return df, texts.values, labels.values


def read_csv(fp):
    """CVS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the CSV file.

    Returns
    -------
    list:
        List with entries.

    """

    try:
        df = pd.read_csv(fp)
    except UnicodeDecodeError:
        df = pd.read_csv(fp, encoding="ISO-8859-1")

    return df.to_dict('records')


def read_ris(fp):
    """RIS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the RIS file.
    label: bool
        Check for label. If None, this is automatic.

    Returns
    -------
    list:
        List with entries.

    """

    try:
        with open(fp, 'r', encoding='utf-8') as bibliography_file:
            mapping = _tag_key_mapping(reverse=False)
            entries = list(readris(bibliography_file, mapping=mapping))
    except IOError:
        with open(fp, 'r', encoding='utf-8-sig') as bibliography_file:
            mapping = _tag_key_mapping(reverse=False)
            entries = list(readris(bibliography_file, mapping=mapping))

    return entries
