import logging

import pandas as pd
import numpy as np

from asreview.config import COLUMN_DEFINITIONS, LABEL_NA
from asreview.exceptions import BadFileFormatError


def type_from_column(col_name, col_definitions):
    """Transform a column name to its standardized form."""
    for definition in col_definitions:
        if col_name.lower() in definition:
            return definition[0]
    return None


def standardize_dataframe(df):
    """Creates a ASReview readable dataframe.

    The main purpose is to rename columns with slightly different names;
    'authors' vs 'first_authors', etc. This greatly widens the compatibility
    with different datasets.

    Arguments
    ---------
    df: pd.DataFrame
        Unclean dataframe to be cleaned up.

    Returns
    -------
    pd.DataFrame:
        Cleaned dataframe with proper column names.
    """
    col_names = list(df)
    for column_name in col_names:
        data_type = type_from_column(column_name, COLUMN_DEFINITIONS)
        if data_type is not None:
            df.rename(columns={column_name: data_type}, inplace=True)

    col_names = list(df)
    if "abstract" not in col_names and "title" not in col_names:
        raise BadFileFormatError("File supplied without 'abstract' or 'title'"
                                 " fields.")
    if "abstract" not in col_names:
        logging.warning("Unable to detect abstracts in dataset.")
    if "title" not in col_names:
        logging.warning("Unable to detect titles in dataset.")

    for col in ["title", "abstract", "authors", "keywords"]:
        try:
            df[col].fillna("", inplace=True)
        except KeyError:
            pass

    if "label" in col_names:
        df["label"].fillna(LABEL_NA, inplace=True)
        df["label"] = pd.to_numeric(df["label"])

    if "record_id" in list(df):
        df.set_index('record_id', inplace=True)
    if df.index.name != "record_id":
        df["record_id"] = np.arange(len(df.index))
        df.set_index('record_id', inplace=True)
    df.sort_index(inplace=True)
    return df
