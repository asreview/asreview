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
    for type_name, type_list in COLUMN_DEFINITIONS.items():
        wanted_columns.extend(type_list)

    for sheet_name in dfs:
        col_names = set([col.lower() for col in list(dfs[sheet_name])])
        obj_val = len(col_names & set(wanted_columns))
        if obj_val > sheet_obj_val:
            sheet_obj_val = obj_val
            best_sheet = sheet_name

    return standardize_dataframe(dfs[best_sheet])
