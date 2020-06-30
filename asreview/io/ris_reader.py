import logging

import pandas as pd
from RISparser import readris
from RISparser import TAG_KEY_MAPPING
from RISparser.config import LIST_TYPE_TAGS

from asreview.config import COLUMN_DEFINITIONS
from asreview.io.utils import standardize_dataframe


RIS_KEY_LABEL_INCLUDED = "LI"
LABEL_INCLUDED_VALUES = COLUMN_DEFINITIONS[0]
NAME_LABEL_INCLUDED = LABEL_INCLUDED_VALUES[0]


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

    df = pd.DataFrame(entries)

    def converter(x):
        try:
            return ", ".join(x)
        except TypeError:
            return ""

    for tag in LIST_TYPE_TAGS:
        key = TAG_KEY_MAPPING[tag]
        if key in df:
            df[key] = df[key].apply(converter)
    return standardize_dataframe(df)


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
