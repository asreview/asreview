import logging

import pandas as pd
import numpy as np

from asreview.io.paper_record import PaperRecord
from asreview.config import COLUMN_DEFINITIONS, LABEL_NA
from asreview.exceptions import BadFileFormatError


def type_from_column(col_name, col_definitions):
    for definition in col_definitions:
        if col_name.lower() in definition:
            return definition[0]
    return None


def record_from_row(row, conversion_table, record_id):
    kwargs = {}
    for column, dest_key in conversion_table.items():
        value = row[column]
        if not isinstance(value, list) and pd.isnull(value):
            value = None

        if dest_key is None:
            kwargs[column] = value
        else:
            kwargs[dest_key] = value

    if "record_id" not in kwargs:
        kwargs["record_id"] = record_id
    return PaperRecord(**kwargs)


def paper_frame_reader(df):
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
        df[col].fillna(LABEL_NA, inplace=True)

    if "record_id" not in df:
        df["record_id"] = np.arange(len(df.index))

    df.set_index('record_id')
    return df
