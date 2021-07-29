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
from rispy import TAG_KEY_MAPPING
from rispy.config import LIST_TYPE_TAGS

from asreview.config import COLUMN_DEFINITIONS
from asreview.io.utils import standardize_dataframe


RIS_KEY_LABEL_INCLUDED = "LI"


def _tag_key_mapping(reverse=False):
    # Add label_included into the specification and create reverse mapping.
    TAG_KEY_MAPPING[RIS_KEY_LABEL_INCLUDED] = "included"
    KEY_TAG_MAPPING = {TAG_KEY_MAPPING[key]: key for key in TAG_KEY_MAPPING}
    for label in COLUMN_DEFINITIONS["included"]:
        KEY_TAG_MAPPING[label] = "LI"
    if reverse:
        return KEY_TAG_MAPPING
    else:
        return TAG_KEY_MAPPING


def write_ris(df, fp):
    """Write dataframe to RIS file.

    Arguments
    ---------
    df: pandas.Dataframe
        Dataframe to export.
    fp: str
        RIS file to export to.
    """
    column_names = list(df)
    column_key = []
    for col in column_names:
        try:
            rev_mapping = _tag_key_mapping(reverse=True)
            column_key.append(rev_mapping[col])
        except KeyError:
            column_key.append('UK')
            logging.info(f"Cannot find column {col} in specification.")

    n_row = df.shape[0]

    # According to RIS specifications, a record should begin with TY.
    # Thus, the column id is inserted before all the other.
    col_order = []
    for i, key in enumerate(column_key):
        if key == 'TY':
            col_order.insert(0, i)
        else:
            col_order.append(i)

    with open(fp, "w") as fp:
        rispy.dump(df, fp)
