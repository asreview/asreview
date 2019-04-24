# Cpython dependencies


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

    df = pd.read_csv(fp)

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
