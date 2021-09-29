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
import re

import pandas
import rispy

from asreview.io.utils import standardize_dataframe


# Converter function for manipulating the internal "included" column
def _label_parser(note_list):
    # Check the list for the label and return the proper value
    if "ASReview_relevant" in note_list:
        return 1
    elif "ASReview_irrelevant" in note_list:
        return 0
    else:
        return None

# Converter function for removing the XHTML <p></p> tags from Zotero export
def _strip_zotero_p_tags(note_list):
    if isinstance(note_list,list):
        for v in note_list:

            new_notes = []
            try:
                new_notes.append(re.sub(r'^<p>|<\/p>$', '', v))
            except Exception:
                new_notes.append(v)
        return new_notes
    else:
        return note_list
            

def read_ris(fp):
    """RIS file reader.

    Parameters
    ----------
    fp: str, pathlib.Path
        File path to the RIS file.

    Returns
    -------
    pandas.DataFrame:
        Dataframe with entries.

    Raises
    ------
    ValueError
        File with unrecognized encoding is used as input.
    """

    encodings = ['utf-8', 'utf-8-sig', 'ISO-8859-1']
    entries = None
    for encoding in encodings:
        try:
            with open(fp, 'r', encoding=encoding) as bibliography_file:
                entries = list(rispy.load(bibliography_file))
                break
        except UnicodeDecodeError:
            pass
        except IOError as e:
            logging.warning(e)

    if entries is None:
        raise ValueError("Cannot find proper encoding for data file.")

    # Turn the entries dictionary into a Pandas dataframe
    df = pandas.DataFrame(entries)

    # Check if "notes" column is present
    if "notes" in df:
        # Strip Zotero XHTML <p> tags on "notes"
        df["notes"] = df["notes"].apply(_strip_zotero_p_tags)
        # Convert from "notes" to "included" field for internal representation
        df["included"] = df["notes"].apply(_label_parser)
        # Return the standardised dataframe with label
        return standardize_dataframe(df)
    else:
        # Return the standardised dataframe
        return standardize_dataframe(df)
