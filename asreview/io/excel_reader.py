from asreview.io.utils import standardize_dataframe

import pandas as pd
from asreview.config import COLUMN_DEFINITIONS


def read_excel(fp):
    """Excel file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the Excel file (.xlsx).

    Returns
    -------
    list:
        List with entries.

    """
    try:
        dfs = pd.read_excel(fp, sheet_name=None)
    except UnicodeDecodeError:
        dfs = pd.read_excel(fp, sheet_name=None, encoding="ISO-8859-1")

    best_sheet = None
    sheet_obj_val = -1
    wanted_columns = []
    for type_list in COLUMN_DEFINITIONS:
        wanted_columns.extend(type_list)

    for sheet_name in dfs:
        col_names = set([col.lower() for col in list(dfs[sheet_name])])
        obj_val = len(col_names & set(wanted_columns))
        if obj_val > sheet_obj_val:
            sheet_obj_val = obj_val
            best_sheet = sheet_name

    return standardize_dataframe(dfs[best_sheet])
