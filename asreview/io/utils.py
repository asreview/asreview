import pandas as pd

from asreview.io.paper_record import PaperRecord
from asreview.config import COLUMN_DEFINITIONS


def type_from_column(col_name, col_definitions):
    for definition in col_definitions:
        if col_name.lower() in definition:
            return definition[0]
    return None


def record_from_row(row, conversion_table, record_id):
    kwargs = {}
    for column, dest_key in conversion_table.items():
        value = row[column]
        if pd.isnull(value):
            value = None

        if dest_key is None:
            kwargs[column] = value
        else:
            kwargs[dest_key] = value

    if "record_id" not in kwargs:
        kwargs["record_id"] = record_id
    return PaperRecord(**kwargs)


def paper_frame_reader(df):
    df = df.where(df.notnull(), None)
    conversion_table = {}
    for column_name in list(df):
        data_type = type_from_column(column_name, COLUMN_DEFINITIONS)
        conversion_table[column_name] = data_type

    record_id = 0
    for _, row in df.iterrows():
        yield record_from_row(row, conversion_table, record_id)
        record_id += 1
