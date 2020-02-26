import logging

import pandas as pd
import numpy as np

from asreview.io.paper_record import PaperRecord
from asreview.config import COLUMN_DEFINITIONS
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
#     conversion_table = {}
    col_names = list(df)
    for column_name in col_names:
        data_type = type_from_column(column_name, COLUMN_DEFINITIONS)
        df.rename(columns={data_type: column_name})
#         conversion_table[column_name] = data_type

#     fields = conversion_table.values()
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
            df[col].fillna("")
        except KeyError:
            pass

    if "record_id" not in df:
        df["record_id"] = np.arange(len(df.index))

    df.set_index('record_id')
    return df
#     record_id = 0
#     for _, row in df.iterrows():
#         yield record_from_row(row, conversion_table, record_id)
#         record_id += 1
