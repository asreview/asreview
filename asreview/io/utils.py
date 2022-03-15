# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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
from urllib.parse import urlparse

import logging
import numpy as np
import pandas as pd
import pkg_resources

from asreview.config import COLUMN_DEFINITIONS
from asreview.config import LABEL_NA
from asreview.exceptions import BadFileFormatError
from asreview.utils import is_url


def type_from_column(col_name, col_definitions):
    """Transform a column name to its standardized form."""
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


def _standardize_dataframe(df, column_spec={}):
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
    for col in ["title", "abstract", "authors", "keywords", "notes"]:
        try:
            df[all_column_spec[col]] = np.where(
                pd.isnull(df[all_column_spec[col]]),
                "", df[all_column_spec[col]].astype(str))
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
            logging.warning("Failed to parse label column name, no labels will"
                            " be present.")
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
    df["record_id"] = np.arange(len(df.index))

    # set the index
    df.set_index('record_id', inplace=True)

    return df, all_column_spec


def get_reader_class(fp):
    """Load data reader class

    Arguments
    ---------
    fp: str, pathlib.Path
        Load the data reader from this file.

    Returns
    -------
    class:
        Data reader class.
    """

    if is_url(fp):
        path = urlparse(fp).path
    else:
        path = str(Path(fp).resolve())

    entry_points = {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points('asreview.readers')
    }
    best_suffix = None
    for suffix, entry in entry_points.items():
        if path.endswith(suffix):
            if best_suffix is None or len(suffix) > len(best_suffix):
                best_suffix = suffix

    if best_suffix is None:
        raise ValueError(f"Error reading file {fp}, no capabilities for "
                         "reading such a file.")

    reader = entry_points[best_suffix].load()

    return reader


def list_writers(fp):
    """Find available writer from data reader.

    Arguments
    ---------
    fp: str, pathlib.Path
        Find data reader and corresponding writer from the file.

    Returns
    -------
    list:
        List of name and label of available data writer.
    """
    reader = get_reader_class(fp)

    if hasattr(reader, "write_format"):
        write_format = reader.write_format
    else:
        raise ValueError("No write format specified for the reader.")

    entry_points = {
        entry.name: entry
        for entry in pkg_resources.iter_entry_points('asreview.writers')
    }

    writers = []

    for suffix, entry in entry_points.items():
        if suffix in write_format:
            writer = entry.load()
            writers.append({
                "name": writer.name,
                "label": writer.label,
            })

    if not writers:
        raise ValueError(
            f"No data writer available for {' '.join(write_format)} file."
        )

    return writers
