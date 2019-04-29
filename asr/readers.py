# Cpython dependencies

from pathlib import Path

# external dependencies
from RISparser import TAG_KEY_MAPPING, readris
import pandas as pd


RIS_KEY_LABEL_INCLUDED = "LI"
NAME_LABEL_INCLUDED = "label_included"
LABEL_INCLUDED_VALUES = [
    "label_included",
    "included_label",
    "included_final",
    "included",
    "included_flag"
]


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
        return texts.values
    labels = df[column_labels[0]]
    return texts.values, labels.values


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
