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


def convert_keywords(keywords):
    """Split keywords separated by commas etc to lists."""
    if not isinstance(keywords, str):
        return keywords

    current_best = [keywords]
    for splitter in [", ", "; ", ": ", ";", ":"]:
        new_split = keywords.split(splitter)
        if len(new_split) > len(current_best):
            current_best = new_split
    return current_best


def type_from_column_spec(col_name, column_spec):
    """Retrieve the standardized name of a column.

    Arguments
    ---------
    col_name: str
        Name of the column in the dataframe.
    column_spec: dict
        Dictionary of {possible name}:{standardized_name}.

    Returns
    -------
    str:
        The standardized name. If it wasn't found, return None.
    """
    for data_type, column_spec_name in column_spec.items():
        if col_name.lower() == column_spec_name.lower():
            return data_type
    return None


def standardize_dataframe(df, column_spec={}):
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
    all_column_spec = {}
    col_names = list(df)
    for column_name in col_names:
        # First try the supplied column specifications if supplied.
        data_type = type_from_column_spec(column_name, column_spec)
        if data_type is not None:
            all_column_spec[data_type] = column_name
            continue
        # Then try the standard specifications in ASReview.
        data_type = type_from_column(column_name, COLUMN_DEFINITIONS)
        if data_type is not None:
            all_column_spec[data_type] = column_name

    # Check if we either have abstracts or titles.
    col_names = list(all_column_spec)
    if "abstract" not in col_names and "title" not in col_names:
        raise BadFileFormatError("File supplied without 'abstract' or 'title'"
                                 " fields.")
    if "abstract" not in col_names:
        logging.warning("Unable to detect abstracts in dataset.")
    if "title" not in col_names:
        logging.warning("Unable to detect titles in dataset.")

    # Replace NA values with empty strings.
    for col in ["title", "abstract", "authors", "keywords"]:
        try:
            df[all_column_spec[col]].fillna("", inplace=True)
        except KeyError:
            pass

    # Convert labels to integers.
    if "final_included" in col_names:
        try:
            col = all_column_spec["final_included"]
            df[col].fillna(LABEL_NA, inplace=True)
            df[col] = pd.to_numeric(df[col])
        except KeyError:
            pass

    # If the we have a record_id (for example from an ASReview export) use it.
    if "record_id" in list(df):
        df.set_index('record_id', inplace=True)
    if df.index.name != "record_id":
        df["record_id"] = np.arange(len(df.index))
        df.set_index('record_id', inplace=True)
    df.sort_index(inplace=True)
    return df, all_column_spec
