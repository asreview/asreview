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

__all__ = ["CSVReader"]


import pandas as pd

from asreview.config import COLUMN_DEFINITIONS
from asreview.data.base import Dataset


class CSVReader:
    """CVS file reader."""

    read_format = [".csv", ".tab", ".tsv"]
    write_format = [".csv", ".tsv", ".xlsx"]

    @classmethod
    def read_data(cls, fp):
        """Import dataset.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path to the CSV file.

        Returns
        -------
        list:
            List with entries.
        """
        for encoding in ["utf-8", "ISO-8859-1"]:
            try:
                df = pd.read_csv(fp, sep=None, encoding=encoding, engine="python")
                return Dataset(df)
            except UnicodeDecodeError:
                # if unicode error, go to next encoding
                continue

        raise UnicodeDecodeError("The encoding of the file is not supported.")


class CSVWriter:
    """CSV file writer."""

    name = "csv"
    label = "CSV (UTF-8)"
    write_format = ".csv"

    @classmethod
    def write_data(cls, df, fp, sep=","):
        """Export dataset.

        Arguments
        ---------
        df: pandas.Dataframe
            Dataframe of all available record data.
        fp: str, NoneType
            Filepath or None for buffer.
        sep: str
            Seperator of the file.

        Returns
        -------
        CSV file
            Dataframe of all available record data.
        """
        return df.to_csv(fp, sep=sep, index=True)


class ExcelReader:
    """Excel file reader."""

    read_format = [".xlsx"]
    write_format = [".csv", ".tsv", ".xlsx"]

    @classmethod
    def read_data(cls, fp):
        """Import dataset.

        Arguments
        ---------
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
        for _type_name, type_list in COLUMN_DEFINITIONS.items():
            wanted_columns.extend(type_list)

        for sheet_name in dfs:
            col_names = set([col.lower() for col in list(dfs[sheet_name])])
            obj_val = len(col_names & set(wanted_columns))
            if obj_val > sheet_obj_val:
                sheet_obj_val = obj_val
                best_sheet = sheet_name

        return Dataset(dfs[best_sheet])


class ExcelWriter:
    """Excel file writer."""

    name = "xlsx"
    label = "Excel"
    write_format = ".xlsx"

    @classmethod
    def write_data(cls, df, fp):
        """Export dataset.

        Arguments
        ---------
        df: pandas.Dataframe
            Dataframe of all available record data.
        fp: str, NoneType
            Filepath or None for buffer.

        Returns
        -------
        Excel file
            Dataframe of all available record data.
        """
        return df.to_excel(fp, index=True, engine="xlsxwriter")


class TSVWriter:
    """TSV file writer."""

    name = "tsv"
    label = "TSV (UTF-8)"
    write_format = ".tsv"

    @classmethod
    def write_data(cls, df, fp, sep="\t"):
        """Export dataset.

        Arguments
        ---------
        df: pandas.Dataframe
            Dataframe of all available record data.
        fp: str, NoneType
            Filepath or None for buffer.
        sep: str
            Seperator of the file.

        Returns
        -------
        TSV file
            Dataframe of all available record data.
        """
        return df.to_csv(fp, sep=sep, index=True)
