# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

__all__ = ["RISReader", "RISWriter"]

import copy
import io
import json
import re
from urllib.request import urlopen

import pandas as pd
import rispy

from asreview.data.base import BaseReader
from asreview.data.utils import convert_to_list
from asreview.utils import _is_url

RIS_NOTE_LABEL_MAPPING = {
    "ASReview_relevant": 1,
    "ASReview_irrelevant": 0,
    "ASReview_not_seen": None,
}
LABEL_RIS_NOTE_MAPPING = {val: key for key, val in RIS_NOTE_LABEL_MAPPING.items()}


def _parse_label_from_notes(note_list):
    if not isinstance(note_list, list):
        return
    for note in note_list:
        for key, val in RIS_NOTE_LABEL_MAPPING.items():
            if key in note:
                return val


def _remove_asreview_data_from_notes(note_list):
    """Remove ASReview data from notes.

    Parameters
    ----------
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
    return [
        note
        for note in note_list
        if note not in RIS_NOTE_LABEL_MAPPING and not note.startswith("asreview_")
    ]


class RISReader(BaseReader):
    """RIS file reader."""

    read_format = [".ris", ".txt"]
    write_format = [".csv", ".tsv", ".xlsx", ".ris"]

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
                    new_notes.append(re.sub(r"^<p>|<\/p>$", "", v))
                except Exception:
                    new_notes.append(v)
            return new_notes
        else:
            return note_list

    @classmethod
    def _read_from_file(cls, fp, encoding="utf8"):
        with open(fp, encoding=encoding) as bibliography_file:
            return list(rispy.load(bibliography_file, skip_unknown_tags=True))

    @classmethod
    def _read_from_url(cls, fp, encoding="utf8"):
        url_input = urlopen(fp)

        bibliography_file = io.StringIO(url_input.read().decode(encoding))
        entries = list(rispy.load(bibliography_file, skip_unknown_tags=True))
        bibliography_file.close()

        return entries

    @classmethod
    def read_data(cls, fp):
        """Import dataset.

        Parameters
        ----------
        fp: str, pathlib.Path
            File path to the RIS file.

        Returns
        -------
        pd.DataFrame:
            Dataframe with entries. If the notes field contains a note with the text
            `ASReview_relevant`, `ASReview_irrelevant` or `ASReview_not_seen`, the
            data frame will have a column `included` with the value `1`, `0` or `None`.

        Raises
        ------
        ValueError
            File with unrecognized encoding is used as input.
        """
        encodings = ["utf-8", "utf-8-sig", "ISO-8859-1"]
        entries = None
        for encoding in encodings:
            try:
                if _is_url(fp):
                    entries = cls._read_from_url(fp, encoding=encoding)
                    break
                else:
                    entries = cls._read_from_file(fp, encoding=encoding)
                    break
            except UnicodeDecodeError:
                continue
            except Exception as e:
                raise ValueError(f"Error reading RIS file: {e}")

        if entries is None:
            raise ValueError("Cannot find proper encoding for data file")

        # Turn the entries dictionary into a Pandas dataframe
        df = pd.DataFrame(entries)

        # Check if "notes" column is present
        if "notes" in df:
            # Strip Zotero XHTML <p> tags on "notes"
            df["notes"] = df["notes"].apply(cls._strip_zotero_p_tags)
            # Parse the labels from the notes if present.
            labels = df["notes"].apply(_parse_label_from_notes)
            if not labels.isna().all():
                df["included"] = labels
            df["notes"] = df["notes"].apply(_remove_asreview_data_from_notes)

        if "included" in df:
            df["included"] = df["included"].astype("Int64")

        return df

    @classmethod
    def clean_data(cls, df):
        # We drop the 'label' column if it's available. For RIS files ASReview stores
        # and loads the labels from the notes field.
        df.drop("label", axis=1, inplace=True, errors="ignore")

        # We combine the values of 'authors' and 'first_authors' into one list of
        # authors. Internally we only use the authors when searching for a record, so
        # it does not matter too much if combining the two lists leads to the wrong
        # order of authors, or duplicate authors appearing in the list.
        if "authors" not in df:
            df["authors"] = None
        df["authors"] = df["authors"].apply(convert_to_list)
        if "first_authors" not in df:
            df["first_authors"] = None
        df["first_authors"] = df["first_authors"].apply(convert_to_list)
        df["authors"] = df["authors"] + df["first_authors"]

        return super().clean_data(df)


class RISWriter:
    """RIS file writer."""

    name = "ris"
    label = "RIS"
    caution = "Available only if you imported a RIS file when creating the project"
    write_format = ".ris"

    @classmethod
    def write_data(cls, df, fp):
        """Export dataset.

        Parameters
        ----------
        df: pd.Dataframe
            Dataframe of all available record data.
        fp: str, pathlib.Path
            File path to the RIS file, if exists.

        Returns
        -------
        RIS file
            Dataframe of all available record data. Any column from the data frame that
            starts with `asreview_` is added to the RIS file as note in the notes field
            of the form: `asreview_{column_name}: json.dumps({column_value})`. If the
            dataframe contains a column `asreview_label`, also a note is added with the
            value `ASReview_relevant`, `ASReview_irrelevant` or `ASReview_not_seen`
            corresponding to the value `1`, `0` or `None` in that column.
        """
        # Turn pandas DataFrame into records (list of dictionaries) for rispy
        records = copy.deepcopy(df.to_dict("records"))

        # Create an array for storing modified records
        records_new = []

        # Iterate over all available records
        for rec in records:

            def _isnull(v):
                if isinstance(v, list):
                    return v == []

                return pd.isnull(v)

            rec_copy = {}
            rec_copy["notes"] = rec.pop("notes", [])
            for key, val in rec.items():
                if key == "asreview_label":
                    rec_copy["notes"].insert(
                        0, LABEL_RIS_NOTE_MAPPING[rec["asreview_label"]]
                    )
                elif _isnull(val):
                    continue
                elif key.startswith("asreview_"):
                    rec_copy["notes"].append(f"{key}: {json.dumps(val)}")
                else:
                    rec_copy[key] = val
            if rec_copy["notes"] == []:
                rec_copy.pop("notes")

            # Throw away columns that can not be exported to RIS.
            rec_copy = {
                key: val
                for key, val in rec_copy.items()
                if not key == "included" and not key.startswith("asreview_")
            }
            # Append the deepcopied and updated record to a new array
            records_new.append(rec_copy)

        # From buffered dataframe
        if fp is None:
            # Write the whole content to buffer
            return rispy.dumps(records_new)

        # From IO dataframe
        else:
            # Write the whole content to a file
            with open(fp, "w", encoding="utf8") as fp:
                rispy.dump(records_new, fp)
