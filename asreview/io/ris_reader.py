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

__all__ = ["RISReader"]

import io
import logging
import re
from urllib.request import urlopen

import pandas
import rispy

from asreview.io.utils import _standardize_dataframe
from asreview.utils import is_url

ASREVIEW_PARSE_RE = r"\bASReview_\w+\b"


def _parse_asreview_data_from_notes(note_list):
    parse_dict = {
        "ASReview_relevant": {"included": 1},
        "ASReview_irrelevant": {"included": 0},
        "ASReview_not_seen": {"included": -1},
        "ASReview_prior": {"asreview_prior": 1},
        "ASReview_validate_relevant": {"asreview_label_to_validate": 1},
        "ASReview_validate_irrelevant": {"asreview_label_to_validate": 0},
        "ASReview_validate_not_seen": {"asreview_label_to_validate": -1},
    }

    # Return {} and an empty list
    if not isinstance(note_list, list):
        return {}

    # match all words that start with ASReview and end with a word boundary
    matches = re.findall(ASREVIEW_PARSE_RE, " ".join(note_list))

    if (
        ("ASReview_relevant" in matches and "ASReview_irrelevant" in matches)
        or ("ASReview_relevant" in matches and "ASReview_not_seen" in matches)
        or ("ASReview_irrelevant" in matches and "ASReview_not_seen" in matches)
    ):
        raise ValueError("Cannot have both relevant and irrelevant label.")

    if (
        (
            "ASReview_validate_relevant" in matches
            and "ASReview_validate_irrelevant" in matches
        )
        or (
            "ASReview_validate_relevant" in matches
            and "ASReview_validate_not_seen" in matches
        )
        or (
            "ASReview_validate_irrelevant" in matches
            and "ASReview_validate_not_seen" in matches
        )
    ):
        raise ValueError("Cannot have both relevant and irrelevant label.")

    # get the dictionary for each match
    parsed_values = [parse_dict.get(m, {}) for m in matches]
    parsed_values = {k: v for d in parsed_values for k, v in d.items()}

    return parsed_values


def _remove_asreview_data_from_notes(note_list):
    """Remove ASReview data from notes.

    Arguments
    ---------
    note_list: list
        A list of notes, coming from the Dataframe's "notes" column.

    Returns
    -------
    asreview_new_notes: list
        A list of updated notes, where ASReview data has been removed.
    """

    # Return {} and an empty list
    if not isinstance(note_list, list):
        return []

    asreview_new_notes = [re.sub(ASREVIEW_PARSE_RE, "", note) for note in note_list]
    asreview_new_notes[:] = [item for item in asreview_new_notes if item != ""]

    return asreview_new_notes


class RISReader:
    """RIS file reader."""

    read_format = [".ris", ".txt"]
    write_format = [".csv", ".tsv", ".xlsx", ".ris"]

    def _strip_zotero_p_tags(note_list):
        """Converter function for removing the XHTML <p></p> tags from Zotero export.

        Arguments
        ---------
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
                    new_notes.append(re.sub(r"^<p>|<\/p>$", "", v))
                except Exception:
                    new_notes.append(v)
            return new_notes
        else:
            return note_list

    @classmethod
    def read_data(cls, fp):
        """Import dataset.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path to the RIS file.
        note_list: list
            A list of notes, coming from the Dataframe's "notes" column.

        Returns
        -------
        pandas.DataFrame:
            Dataframe with entries.

        Raises
        ------
        ValueError
            File with unrecognized encoding is used as input.
        """
        encodings = ["utf-8", "utf-8-sig", "ISO-8859-1"]
        entries = None
        if entries is None:
            if is_url(fp):
                url_input = urlopen(fp)
            for encoding in encodings:
                if is_url(fp):
                    try:
                        bibliography_file = io.StringIO(
                            url_input.read().decode(encoding)
                        )

                        entries = list(
                            rispy.load(bibliography_file, skip_unknown_tags=True)
                        )
                        bibliography_file.close()
                        break
                    except UnicodeDecodeError:
                        pass
                else:
                    try:
                        with open(fp, "r", encoding=encoding) as bibliography_file:
                            entries = list(
                                rispy.load(bibliography_file, skip_unknown_tags=True)
                            )
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
            df["notes"] = df["notes"].apply(cls._strip_zotero_p_tags)

            # strip ASReview data from notes
            df = pandas.concat(
                [
                    df,
                    pandas.DataFrame(
                        df["notes"].apply(_parse_asreview_data_from_notes).tolist(),
                    ),
                ],
                axis=1,
            )
            df["notes"] = df["notes"].apply(_remove_asreview_data_from_notes)

            # Return the standardised dataframe with label and notes separated
            return _standardize_dataframe(df)
        else:
            # Return the standardised dataframe
            return _standardize_dataframe(df)
