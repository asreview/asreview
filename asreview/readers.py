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

import numpy as np
import pandas as pd

from asreview.exceptions import BadFileFormatError
from asreview.io.ris_reader import write_ris
from asreview.config import LABEL_NA

with warnings.catch_warnings():
    warnings.filterwarnings("ignore")
    from fuzzywuzzy import fuzz

RIS_KEY_LABEL_INCLUDED = "LI"
NAME_LABEL_INCLUDED = "label_included"
LABEL_INCLUDED_VALUES = [
    "label_included", "included_label", "included_final", "included",
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


def get_fuzzy_ranking(keywords, str_list):
    rank_list = np.zeros(len(str_list), dtype=np.float)
    for i, my_str in enumerate(str_list):
        rank_list[i] = fuzz.token_set_ratio(keywords, my_str)
    return rank_list


def merge_arrays(array_a, array_b, n_paper_a, n_paper_b, fill="",
                 type_=object):
    if array_a is None and array_b is not None:
        array_a = np.full(n_paper_a, fill).astype(type_)
    if array_a is not None and array_b is None:
        array_b = np.full(n_paper_b, fill).astype(type_)
    if array_a is not None:
        array_a = np.append(array_a, array_b)
    return array_a


class ASReviewData(object):
    """Data object to store csv/ris file.

    Extracts relevant properties of papers."""

    def __init__(self, records):
        self.records = records

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
        self.article_id = np.append(self.article_id,
                                    as_data.article_id + self.n_paper)
        self.keywords = merge_arrays(self.keywords, as_data.keywords,
                                     self.n_paper, as_data.n_paper, "", object)
        self.authors = merge_arrays(self.authors, as_data.authors,
                                    self.n_paper, as_data.n_paper, "", object)
        self.final_labels = merge_arrays(
            self.final_labels, as_data.final_labels, self.n_paper,
            as_data.n_paper, NOT_AVAILABLE, np.int)

        self.raw_df = pd.concat([self.raw_df, as_data.raw_df], join='outer',
                                sort=False, ignore_index=True)
        self.n_paper += as_data.n_paper

    @classmethod
    def from_file(cls, fp, read_fn=None):
        "Create instance from csv/ris/excel file."
        if read_fn is not None:
            return cls([x for x in read_fn(fp)])

        entry_points = {
            entry.name: entry
            for entry in pkg_resources.iter_entry_points('asreview.readers')
        }
        best_suffix = None
        for suffix, entry in entry_points.items():
            if fp.endswith(suffix):
                if best_suffix is None or len(suffix) > len(best_suffix):
                    best_suffix = suffix

        if best_suffix is None:
            raise ValueError(f"Error reading file {fp}, no capabilities for "
                             "reading such a file.")

        read_fn = entry_points[best_suffix].load()
        return cls([x for x in read_fn(fp)])

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
        return [record.text for record in self.records]

    @property
    def headings(self):
        return [record.heading for record in self.records]

    @property
    def bodies(self):
        return [record.body for record in self.records]

    def get_priors(self):
        "Get prior_included, prior_excluded from dataset."
        zero_idx = np.where(self.labels == 0)[0]
        one_idx = np.where(self.labels == 1)[0]
        return one_idx, zero_idx

    @property
    def labels(self):
        return np.array([record.label for record in self.records], dtype=int)

    @labels.setter
    def labels(self, labels):
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
            raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                             f"from file {fp}")

    def to_dataframe(self, labels=None, df_order=None):
        if df_order is not None:
            df_order = np.arange(len(self.records))

        df_dict = {}
#         print(df_order)
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



# 
# def _df_from_file(fp):
#     if Path(fp).suffix.lower() == ".csv":
#         data = read_csv(fp)
#     elif Path(fp).suffix.lower() in [".ris", ".txt"]:
#         data = read_ris(fp)
#     elif Path(fp).suffix.lower() == ".xlsx":
#         data = read_excel(fp)
#     elif Path(fp).suffix.lower() == ".xml":
#         data = read_pubmed_xml(fp)
#     else:
#         raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
#                          f"from file {fp}")
# 
#     # parse data in pandas dataframe
#     df = pd.DataFrame(data)
#     return df
# 
# # 
# def read_data(fp):
#     """Load papers and their labels.
# 
#     Arguments
#     ---------
#     fp: str
#         File path to the data.
# 
#     Returns
#     -------
#     np.ndarray, np.array
#         The title and abstract merged into a single string for each paper.
#         The labels for each paper. 1 is included, 0 is excluded. If this column
#         is not available, this column is not returned.
#     """
#     df = _df_from_file(fp)
#     # make texts
#     texts = (df['title'].fillna('') + ' ' + df['abstract'].fillna(''))
# 
#     # extract the label column
#     column_labels = [
#         label for label in list(df) if label in LABEL_INCLUDED_VALUES
#     ]
# 
#     if len(column_labels) > 1:
#         print('\x1b[0;30;41m Warning multiple valid label inclusion '
#               'columns detected. \x1b[0m')
#         print(f'Possible values: {column_labels}.')
#         print(f'Choosing the one with the highest priority: '
#               f'{column_labels[0]}')
#     elif len(column_labels) == 0:
#         return df, texts.values, None
#     labels = df[column_labels[0]].fillna(NOT_AVAILABLE)
#     return df, texts.values, labels.values




# def read_excel(fp):
#     """Excel file reader.
# 
#     Parameters
#     ----------
#     fp: str, pathlib.Path
#         File path to the Excel file (.xlsx).
# 
#     Returns
#     -------
#     list:
#         List with entries.
# 
#     """
#     try:
#         dfs = pd.read_excel(fp, sheet_name=None)
#     except UnicodeDecodeError:
#         dfs = pd.read_excel(fp, sheet_name=None, encoding="ISO-8859-1")
# 
#     best_sheet = None
#     sheet_obj_val = -1
#     wanted_columns = [
#         'title', 'primary_title', 'authors', 'author names', 'first_authors',
#         'abstract', 'keywords'
#     ]
#     wanted_columns.extend(LABEL_INCLUDED_VALUES)
#     for sheet_name in dfs:
#         col_names = set([col.lower() for col in list(dfs[sheet_name])])
#         obj_val = len(col_names & set(wanted_columns))
#         if obj_val > sheet_obj_val:
#             sheet_obj_val = obj_val
#             best_sheet = sheet_name
# 
#     return dfs[best_sheet].to_dict('records')
# 
# 
# def read_pubmed_xml(fp):
#     """PubMed XML file reader.
# 
#     Parameters
#     ----------
#     fp: str, pathlib.Path
#         File path to the XML file (.xml).
# 
#     Returns
#     -------
#     list:
#         List with entries.
#     """
#     tree = ET.parse(fp)
#     root = tree.getroot()
# 
#     records = []
#     for child in root:
#         parts = []
#         elem = child.find('MedlineCitation/Article/ArticleTitle')
#         title = elem.text.replace('[', '').replace(']', '')
# 
#         for elem in child.iter('AbstractText'):
#             parts.append(elem.text)
#         authors = []
#         for author in child.iter('Author'):
#             author_elems = []
#             for elem in author.iter('ForeName'):
#                 author_elems.append(elem.text)
#             for elem in author.iter('LastName'):
#                 author_elems.append(elem.text)
#             authors.append(" ".join(author_elems))
# 
#         author_str = ", ".join(authors)
#         abstract = " ".join(parts)
# 
#         keyword_list = [keyword.text for keyword in child.iter('Keyword')]
#         keywords = ", ".join(keyword_list)
# 
#         new_record = {
#             "abstract": abstract,
#             "title": title,
#             "authors": author_str,
#             "keywords": keywords,
#         }
#         records.append(new_record)
#     return records
# 
# 
# def read_ris(fp):
#     """RIS file reader.
# 
#     Parameters
#     ----------
#     fp: str, pathlib.Path
#         File path to the RIS file.
#     label: bool
#         Check for label. If None, this is automatic.
# 
#     Returns
#     -------
#     list:
#         List with entries.
# 
#     """
# 
#     encodings = ['ISO-8859-1', 'utf-8', 'utf-8-sig']
#     entries = None
#     for encoding in encodings:
#         try:
#             with open(fp, 'r', encoding=encoding) as bibliography_file:
#                 mapping = _tag_key_mapping(reverse=False)
#                 entries = list(readris(bibliography_file, mapping=mapping))
#                 break
#         except (UnicodeDecodeError, IOError):
#             pass
# 
#     if entries is None:
#         raise ValueError("Cannot find proper encoding for data file.")
#     return entries
