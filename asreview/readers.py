# Cpython dependencies

from pathlib import Path

# external dependencies
from RISparser import TAG_KEY_MAPPING, readris
import pandas as pd
import numpy as np


RIS_KEY_LABEL_INCLUDED = "LI"
NAME_LABEL_INCLUDED = "label_included"
LABEL_INCLUDED_VALUES = [
    "label_included",
    "included_label",
    "included_final",
    "included",
    "included_flag"
]


class ASReviewData:
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
            article_id = np.arange(len(raw_df.index))

    @classmethod
    def from_data_frame(cls, raw_df):
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
        print(raw_df)
        if len(column_labels) > 0:
            data_kwargs['labels'] = raw_df[column_labels[0]].values
            data_kwargs['label_col'] = column_labels[0]

        try:
            data_kwargs['title'] = raw_df['title'].fillna('').values
        except KeyError:
            pass

        try:
            data_kwargs['abstract'] = raw_df['abstract'].fillna('').values
        except KeyError:
            pass

        try:
            data_kwargs['keywords'] = raw_df['keywords'].fillna('').values
        except KeyError:
            pass

        try:
            data_kwargs['authors'] = raw_df['authors'].fillna('').values
        except KeyError:
            pass

        return cls(**data_kwargs)

    @classmethod
    def from_csv(cls, fp):
        return cls.from_data_frame(pd.DataFrame(read_csv(fp)))

    @classmethod
    def from_ris(cls, fp):
        return cls.from_data_frame(pd.DataFrame(read_ris(fp)))

    @classmethod
    def from_file(cls, fp):
        if Path(fp).suffix in [".csv", ".CSV"]:
            return cls.from_csv(fp)
        elif Path(fp).suffix in [".ris", ".RIS"]:
            return cls.from_ris(fp)
        else:
            raise ValueError(f"Unknown file extension: {Path(fp).suffix}.\n"
                             f"from file {fp}")

    def format_record(self, i, use_cli_colors=True):
        if self.title is not None:
            title = self.title[i]
        else:
            title = ""

        if use_cli_colors:
            title = "\033[95m" + title + "\033[0m"

        if self.authors is not None:
            authors = self.authors[i]
        else:
            authors = ""

        if self.abstract is not None:
            abstract = self.abstract[i]
        else:
            abstract = ""

        return f"\n{title}\n{authors}\n\n{abstract}\n"

    def print_record(self, *args, **kwargs):
        print(self.format_record(*args, **kwargs))

    def _classify_paper(self, index):
        # CLI paper format
        _gui_paper = self._format_paper(
            title=self.data.iloc[index]["title"],
            abstract=self.data.iloc[index]["abstract"],
            authors=self.data.iloc[index]["authors"])
        print(_gui_paper)

    def get_data(self):
        texts = []
        for i in range(len(self.title)):
            texts.append(self.title[i] + " " + self.abstract[i])
        return self.raw_df, np.array(texts), self.labels

    def to_csv(self, csv_fp, labels=None):
        if labels is not None:
            self.raw_df[self.label_col] = labels
        self.raw_df.to_csv(csv_fp)


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
    labels = df[column_labels[0]]
    return df, texts.values, labels.values


def read_csv(fp, labels=None):
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


def read_ris(fp, labels=None):
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

    # build a map of the tags
    mapping = TAG_KEY_MAPPING

    if labels:
        mapping[RIS_KEY_LABEL_INCLUDED] = NAME_LABEL_INCLUDED

    with open(fp, 'r') as bibliography_file:
        entries = list(readris(bibliography_file, mapping=mapping))

    return entries
