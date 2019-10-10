import logging
from pathlib import Path

import numpy as np
import pandas as pd
from RISparser import readris
from RISparser import TAG_KEY_MAPPING

from asreview.config import NOT_AVAILABLE

RIS_KEY_LABEL_INCLUDED = "LI"
NAME_LABEL_INCLUDED = "label_included"
LABEL_INCLUDED_VALUES = [
    "label_included",
    "included_label",
    "included_final",
    "included",
    "included_flag"
]

# Add label_included into the specification and create reverse mapping.
TAG_KEY_MAPPING[RIS_KEY_LABEL_INCLUDED] = NAME_LABEL_INCLUDED
KEY_TAG_MAPPING = {TAG_KEY_MAPPING[key]: key for key in TAG_KEY_MAPPING}
for label in LABEL_INCLUDED_VALUES:
    KEY_TAG_MAPPING[label] = "LI"


class ASReviewData(object):
    """ Data object to store csv/ris file. Extracts relevant properties
        of papers. """
    def __init__(self, raw_df, labels=None, title=None, abstract=None,
                 keywords=None, article_id=None, authors=None,
                 label_col=LABEL_INCLUDED_VALUES[0]):
        self.raw_df = raw_df
        self.labels = labels
        self.title = title
        self.abstract = abstract
        self.label_col = label_col
        self.keywords = keywords
        self.article_id = article_id
        self.authors = authors

        if article_id is None:
            self.article_id = np.arange(len(raw_df.index))

    @classmethod
    def from_data_frame(cls, raw_df):
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

        def fill_column(dst_dict, key):
            try:
                dst_dict[key] = raw_df[key.lower()].fillna('').values
            except KeyError:
                pass

        for key in ['title', 'abstract', 'keywords', 'authors']:
            fill_column(data_kwargs, key)

        return cls(**data_kwargs)

    @classmethod
    def from_csv(cls, fp):
        return cls.from_data_frame(pd.DataFrame(read_csv(fp)))

    @classmethod
    def from_ris(cls, fp):
        return cls.from_data_frame(pd.DataFrame(read_ris(fp)))

    @classmethod
    def from_file(cls, fp):
        "Create instance from csv/ris file."
        if Path(fp).suffix in [".csv", ".CSV"]:
            return cls.from_csv(fp)
        if Path(fp).suffix in [".ris", ".RIS"]:
            return cls.from_ris(fp)
        raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                         f"from file {fp}")

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
            column_key.append(KEY_TAG_MAPPING[col])
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

    with open(fp, 'r') as bibliography_file:
        entries = list(readris(bibliography_file, mapping=TAG_KEY_MAPPING))

    return entries
