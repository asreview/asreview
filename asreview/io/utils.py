# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

__all__ = ["list_readers", "list_writers", "get_reader_class", "get_writer_class"]

import logging

import numpy as np
import pandas as pd

from asreview.config import COLUMN_DEFINITIONS
from asreview.config import LABEL_NA
from asreview.exceptions import BadFileFormatError
from asreview.utils import _entry_points


def type_from_column(col_name, col_definitions):
    """Transform a column name to its standardized form.

    Arguments
    ---------
    col_name: str
        Name of the column in the dataframe.
    col_definitions: dict
        Dictionary of {standardized_name: [list of possible names]}.
        Ex. {"title": ["title", "primary_title"],
            "authors": ["authors", "author names", "first_authors"]}

    Returns
    -------
    str:
        The standardized name. If it wasn't found, return None.
    """
    for name, definition in col_definitions.items():
        if col_name.lower() in definition:
            return name
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


def _is_record_id_unique(s):
    if len(pd.unique(s)) != len(s.index):
        raise ValueError("Column 'record_id' contains duplicate values.")


def _is_record_id_notnull(s):
    if s.isnull().any():
        raise ValueError("Column 'record_id' contains missing values.")


def _is_record_id_int(s):
    try:
        pd.to_numeric(s).astype(int)
    except Exception:
        raise ValueError("Column 'record_id' should contain integer values.")


def _standardize_dataframe(df, column_def={}):
    """Create a ASReview readable dataframe.

    The main purpose is to rename columns with slightly different names;
    'authors' vs 'first_authors', etc. This greatly widens the compatibility
    with different datasets.

    Arguments
    ---------
    df: pandas.DataFrame
        Unclean dataframe to be cleaned up.

    Returns
    -------
    pd.DataFrame:
        Cleaned dataframe with proper column names.
    """
    all_column_spec = {}

    # remove whitespace from colnames
    df.columns = df.columns.str.strip()

    # map columns on column specification
    col_names = list(df)
    for column_name in col_names:
        # First try the custom column definitions if supplied.
        data_type = type_from_column(column_name, column_def)
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
        raise BadFileFormatError(
            "File supplied without 'abstract' or 'title'" " fields."
        )
    if "abstract" not in col_names:
        logging.warning("Unable to detect abstracts in dataset.")
    if "title" not in col_names:
        logging.warning("Unable to detect titles in dataset.")

    # Replace NA values with empty strings.
    for col in ["title", "abstract", "authors", "keywords", "notes"]:
        try:
            df[all_column_spec[col]] = np.where(
                pd.isnull(df[all_column_spec[col]]),
                "",
                df[all_column_spec[col]].astype(str),
            )
        except KeyError:
            pass

    # Convert labels to integers.
    if "included" in col_names:
        try:
            col = all_column_spec["included"]
            df[col].fillna(LABEL_NA, inplace=True)
            df[col] = pd.to_numeric(df[col])
        except KeyError:
            pass
        except ValueError:
            logging.warning(
                "Failed to parse label column name, no labels will" " be present."
            )
            df.rename(columns={"label": "included"})
            all_column_spec.pop("included")

    # TODO: Make sure 'record_id' column in original dataset does not get overwritten.
    # # If the we have a record_id (for example from an ASReview export) use it.
    # if "record_id" in list(df):
    #
    #     # validate record_id column
    #     _is_record_id_notnull(df["record_id"])
    #     _is_record_id_unique(df["record_id"])
    #     _is_record_id_int(df["record_id"])
    #
    # # Create a new index if we haven't found it in the data.
    # else:
    #     df["record_id"] = np.arange(len(df.index))
    df["record_id"] = np.arange(len(df.index)).astype('int64')

    # set the index
    df.set_index("record_id", inplace=True)

    return df, all_column_spec


def list_readers():
    """List available dataset reader classes.

    Returns
    -------
    list:
        Classes of available dataset readers in alphabetical order.
    """
    return [e.load() for e in _entry_points(group="asreview.readers")]


def list_writers():
    """List available dataset writer classes.

    Returns
    -------
    list:
        Classes of available dataset writers in alphabetical order.
    """
    return [e.load() for e in _entry_points(group="asreview.writers")]


def get_reader_class(name):
    """Get class of dataset reader from string.

    Arguments
    ---------
    name: str
        Name of the dataset reader, e.g. '.csv', '.tsv' or '.xlsx'.

    Returns
    -------
    class:
        Class corresponding to the name.
    """
    return _entry_points(group="asreview.readers")[name].load()


def get_writer_class(name):
    """Get class of dataset writer from string.

    Arguments
    ---------
    name: str
        Name of the dataset writer, e.g. '.csv', '.tsv' or '.xlsx'.

    Returns
    -------
    class:
        Class corresponding to the name.
    """

    return _entry_points(group="asreview.writers")[name].load()
