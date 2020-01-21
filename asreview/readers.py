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
import xml.etree.ElementTree as ET


import numpy as np
import pandas as pd
from RISparser import readris
from RISparser import TAG_KEY_MAPPING

from asreview.config import NOT_AVAILABLE
from asreview.exceptions import BadFileFormatError

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


def format_to_str(obj):
    res = ""
    if isinstance(obj, list):
        for sub in obj:
            res += str(sub) + " "
    else:
        res = obj
    return res


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


def merge_arrays(array_a, array_b, n_paper_a, n_paper_b, fill="", type_=object):
    if array_a is None and array_b is not None:
        array_a = np.full(n_paper_a, fill).astype(type_)
    if array_a is not None and array_b is None:
        array_b = np.full(n_paper_b, fill).astype(type_)
    if array_a is not None:
        array_a = np.append(array_a, array_b)
    return array_a


class ASReviewData(object):
    """Data object to store csv/ris file.

    Extracts relevant properties of papers. """
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
            logging.warning("Could not locate authors in data.")
        if title is None:
            BadFileFormatError("Could not locate titles in data.")
        if abstract is None:
            BadFileFormatError("Could not locate abstracts in data.")

        self.n_paper_train = len(self.raw_df.index)
        self.n_paper = self.n_paper_train
        if article_id is None:
            self.article_id = np.arange(len(raw_df.index))

    def append(self, as_data):
        """Append another ASReviewData object.

        It puts the training data at the end.

        Arguments
        ---------
        as_data: ASReviewData
            Dataset to append.
        """
        if as_data.labels is None:
            BadFileFormatError("Additional datasets should have labels.")
        if self.labels is None:
            self.labels = np.full(self.n_paper, NOT_AVAILABLE)
        self.labels = np.append(self.labels, as_data.labels)

        self.title = np.append(self.title, as_data.title)
        self.abstract = np.append(self.abstract, as_data.abstract)
        self.article_id = np.append(self.article_id, as_data.article_id + self.n_paper)
        self.keywords = merge_arrays(self.keywords, as_data.keywords, self.n_paper,
                                     as_data.n_paper, "", object)
        self.authors = merge_arrays(self.authors, as_data.authors, self.n_paper,
                                    as_data.n_paper, "", object)
        self.final_labels = merge_arrays(self.final_labels, as_data.final_labels,
                                         self.n_paper, as_data.n_paper, NOT_AVAILABLE,
                                         np.int)
        self.n_paper += as_data.n_paper

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
        else:
            data_kwargs['label_col'] = LABEL_INCLUDED_VALUES[0]

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
            df_columns = {str(col_name).lower(): col_name
                          for col_name in list(raw_df)}
            for key in keys:
                try:
                    dst_dict[dst_key] = raw_df[df_columns[key]].fillna('').values
                except KeyError:
                    pass

        for key in [['title', 'primary_title'],
                    ['authors', 'author names', 'first_authors'],
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
    def from_excel(cls, fp, *args, **kwargs):
        return cls.from_data_frame(
            pd.DataFrame(read_excel(fp)), *args, **kwargs)

    @classmethod
    def from_file(cls, fp, *args, extra_dataset=[], **kwargs):
        "Create instance from csv/ris/excel file."
        as_data = cls.from_data_frame(_df_from_file(fp), *args, **kwargs)

        if len(extra_dataset) == 0:
            return as_data

        for prior_fp in extra_dataset:
            prior_as_data = cls.from_data_frame(
                _df_from_file(prior_fp), *args, **kwargs)
            as_data.append(prior_as_data)
        return as_data

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
            cur_authors = format_to_str(self.authors[i])
            if len(cur_authors) > w_authors:
                author_str = cur_authors[:w_authors-2] + ".."
            else:
                author_str = cur_authors
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
            authors = format_to_str(self.authors[i]) + "\n"
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
        match_str = np.full(self.title.shape, "x", dtype=object)

        if self.title is not None:
            for i, title in enumerate(self.title):
                match_str[i, ] = str(title) + " "
        if self.authors is not None:
            for i in range(len(self.authors)):
                match_str[i] += format_to_str(self.authors[i]) + " "
        if self.keywords is not None:
            if isinstance(self.keywords[0], list):
                new_keywords = np.array([" ".join(x) for x in self.keywords])
            else:
                new_keywords = self.keywords
            for i in range(len(new_keywords)):
                match_str[i] += str(new_keywords[i])

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
        return [self.title[i] + " " + self.abstract[i]
                for i in range(len(self.title))]

    def get_priors(self):
        "Get prior_included, prior_excluded from dataset."
        zero_idx = np.where(self.labels[self.n_paper_train:] == 0)[0]
        one_idx = np.where(self.labels[self.n_paper_train:] == 1)[0]
        return one_idx + self.n_paper_train, zero_idx + self.n_paper_train

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
            new_df = new_df.reindex(df_order)
        new_df.to_csv(csv_fp)

    def to_ris(self, ris_fp, labels=None, df_order=None):
        new_df = self.raw_df.copy()
        if labels is not None:
            new_df[self.label_col] = labels

        if df_order is not None:
            new_df = new_df.reindex(df_order)
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


def _df_from_file(fp):
    if Path(fp).suffix.lower() == ".csv":
        data = read_csv(fp)
    elif Path(fp).suffix.lower() in [".ris", ".txt"]:
        data = read_ris(fp)
    elif Path(fp).suffix.lower() == ".xlsx":
        data = read_excel(fp)
    elif Path(fp).suffix.lower() == ".xml":
        data = read_pubmed_xml(fp)
    else:
        raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                         f"from file {fp}")

    # parse data in pandas dataframe
    df = pd.DataFrame(data)
    return df


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
    df = _df_from_file(fp)
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


def read_excel(fp):
    """Excel file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the Excel file (.xlsx).

    Returns
    -------
    list:
        List with entries.

    """
    try:
        dfs = pd.read_excel(fp, sheet_name=None)
    except UnicodeDecodeError:
        dfs = pd.read_excel(fp, sheet_name=None, encoding="ISO-8859-1")

    best_sheet = None
    sheet_obj_val = -1
    wanted_columns = [
        'title', 'primary_title', 'authors', 'author names', 'first_authors',
        'abstract', 'keywords']
    wanted_columns.extend(LABEL_INCLUDED_VALUES)
    for sheet_name in dfs:
        col_names = set([col.lower() for col in list(dfs[sheet_name])])
        obj_val = len(col_names & set(wanted_columns))
        if obj_val > sheet_obj_val:
            sheet_obj_val = obj_val
            best_sheet = sheet_name

    return dfs[best_sheet].to_dict('records')


def read_pubmed_xml(fp):
    """PubMed XML file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the XML file (.xml).

    Returns
    -------
    list:
        List with entries.
    """
    tree = ET.parse(fp)
    root = tree.getroot()

    records = []
    for child in root:
        parts = []
        elem = child.find('MedlineCitation/Article/ArticleTitle')
        title = elem.text.replace('[', '').replace(']', '')

        for elem in child.iter('AbstractText'):
            parts.append(elem.text)
        authors = []
        for author in child.iter('Author'):
            author_elems = []
            for elem in author.iter('ForeName'):
                author_elems.append(elem.text)
            for elem in author.iter('LastName'):
                author_elems.append(elem.text)
            authors.append(" ".join(author_elems))

        author_str = ", ".join(authors)
        abstract = " ".join(parts)

        keyword_list = [keyword.text for keyword in child.iter('Keyword')]
        keywords = ", ".join(keyword_list)

        new_record = {
            "abstract": abstract,
            "title": title,
            "authors": author_str,
            "keywords": keywords,
        }
        records.append(new_record)
    return records


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

    encodings = ['ISO-8859-1', 'utf-8', 'utf-8-sig']
    entries = None
    for encoding in encodings:
        try:
            with open(fp, 'r', encoding=encoding) as bibliography_file:
                mapping = _tag_key_mapping(reverse=False)
                entries = list(readris(bibliography_file, mapping=mapping))
                break
        except (UnicodeDecodeError, IOError):
            pass

    if entries is None:
        raise ValueError("Cannot find proper encoding for data file.")
    return entries
