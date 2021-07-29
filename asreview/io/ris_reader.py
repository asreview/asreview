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

    def converter(x):
        try:
            return ", ".join(x)
        except TypeError:
            return ""

    for tag in LIST_TYPE_TAGS:
        key = TAG_KEY_MAPPING[tag]
        if key in df:
            df[key] = df[key].apply(converter)
    return standardize_dataframe(df)
