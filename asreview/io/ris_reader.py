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

import logging

import pandas as pd
import rispy

from asreview.io.utils import standardize_dataframe

# Converter function for manipulating the internal "included" column
# ASReview: "included" column is to represent a record's label
# RIS standard: "included" column not supported
# ASReview: import from "notes" to "included", export from "included" to "notes"
def _label_parser(note_list):
    # print(note)
    # try:
    #     # Convert this note to a list (again)
    #     note_list = eval(note)
    #     print(note_list)
    # except Exception:
    #     return None

    # Check the list for the label
    if "ASReview_relevant" in note_list: return 1
    elif "ASReview_irrelevant" in note_list: return 0
    else: return None


def read_ris(fp):
    """RIS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the RIS file.
    label: bool
        Check for label. If None, this is automatic.

    Returns
    -------
    pandas.DataFrame:
        Dataframe with entries.

    """

    encodings = ['ISO-8859-1', 'utf-8', 'utf-8-sig']
    entries = None
    for encoding in encodings:
        try:
            with open(fp, 'r', encoding=encoding) as bibliography_file:
                mapping = _tag_key_mapping(reverse=False)
                entries = list(rispy.load(bibliography_file, mapping=mapping))
                break
        except UnicodeDecodeError:
            pass
        except IOError as e:
            logging.warning(e)

    if entries is None:
        raise ValueError("Cannot find proper encoding for data file.")

    df = pd.DataFrame(entries)

    # def converter(x):
    #     try:
    #         return ", ".join(x)
    #     except TypeError:
    #         return ""

    # for tag in LIST_TYPE_TAGS:
    #     key = TAG_KEY_MAPPING[tag]
    #     if key in df:
    #         df[key] = df[key].apply(converter)
    return standardize_dataframe(df)
