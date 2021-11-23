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


def _strip_zotero_p_tags(note_list):
    """Converter function for removing the XHTML <p></p> tags from Zotero export.

    Parameters
    ----------
    note_list: list
        A list of notes, coming from the Dataframe's "notes" column.

    Returns
    -------
    new_notes: list
        A list of updated notes, where XHTML <p></p> tags have been stripped.
    note_list: list
        The original note_list, when no XHTML <p></p> tags have been found.
    """
    if isinstance(note_list, list):
        new_notes = []
        for v in note_list:
            try:
                new_notes.append(re.sub(r'^<p>|<\/p>$', '', v))
            except Exception:
                new_notes.append(v)
        return new_notes
    else:
        return note_list


def _label_parser(note_list):
    """Converter function for manipulating the internal "included" and "notes" columns.

    Parameters
    ----------
    note_list: list
        A list of notes, coming from the Dataframe's "notes" column.

    Returns
    -------
    asreview_new_notes: list
        A list of updated notes, where internal label has been added.
    note_list: list
        The original note_list, when no labels have been found.
    1,0,-1: int
        Labels in case they are still needed from the internal representation.
    """
    regex = r"ASReview_relevant|ASReview_irrelevant|ASReview_not_seen"

    # Check whether note_list is actually a list and not NaN
    # Return -1 and an empty list
    if not isinstance(note_list, list):
        return -1, []

    # Create lists of lists for ASReview references
    asreview_refs = [re.findall(regex, note) for note in note_list]
    asreview_refs_list = [
        item for sublist in asreview_refs for item in sublist
    ]

    if len(asreview_refs_list) > 0:
        # Create lists of lists for notes without references
        asreview_new_notes = [re.sub(regex, "", note) for note in note_list]
        # Remove empty elements from list
        asreview_new_notes[:] = [
            item for item in asreview_new_notes if item != ""
        ]
        label = asreview_refs_list[-1]

        # Check for the label and return proper values for internal representation
        if label == "ASReview_relevant":
            return 1, asreview_new_notes
        elif label == "ASReview_irrelevant":
            return 0, asreview_new_notes
        elif label == "ASReview_not_seen":
            return -1, asreview_new_notes
    else:
        return -1, note_list


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
                entries = list(
                    rispy.load(bibliography_file, skip_unknown_tags=True))
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
        # Split "included" from "notes"
        df[["included", "notes"
            ]] = pandas.DataFrame(df["notes"].apply(_label_parser).tolist(),
                                  columns=["included", "notes"])
        # Return the standardised dataframe with label and notes separated
        return standardize_dataframe(df)
    else:
        # Return the standardised dataframe
        return standardize_dataframe(df)
