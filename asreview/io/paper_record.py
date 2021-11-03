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

import os

import pandas as pd

from asreview.config import LABEL_NA
from asreview.utils import format_to_str


def preview_record(record, w_title=80, w_authors=40, automatic_width=False):
    """Return a single line preview string for record i.

    Arguments
    ---------
    record: PaperRecord
        The paperRecord to preview.
    w_title: int
        Width to be allocated for the title of the paper.
    w_authors: int
        Width to be allocated for the authors of the paper.
    automatic_width: bool
        If true, compute w_title, w_authors from the console width.

    Returns
    -------
    str:
        A string that previews a paper record.
    """
    if automatic_width:
        term_width = os.get_terminal_size().columns
        width_available = term_width - 7
        w_title = round((2 / 3) * width_available)
        w_authors = width_available - w_title
    title_str = ""
    author_str = ""
    heading = record.title
    if heading is None:
        heading = record.abstract
    if heading is not None:
        if len(heading) > w_title:
            title_str = heading[:w_title - 2] + ".."
        else:
            title_str = heading

    if record.authors is not None:
        cur_authors = format_to_str(record.authors)
        if len(cur_authors) > w_authors:
            author_str = cur_authors[:w_authors - 2] + ".."
        else:
            author_str = cur_authors
    format_str = "{0: <" + str(w_title) + "}   " + "{1: <" + str(w_authors)
    format_str += "}"
    prev_str = format_str.format(title_str, author_str)
    return prev_str


def format_record(record, use_cli_colors=True):
    """Format one record for displaying in the CLI.

    Arguments
    ---------
    record: PaperRecord
        The paperRecord to format.
    use_cli_colors: bool
        Some terminals support colors, set to True to use them.

    Returns
    -------
    str:
        A string including title, abstracts and authors.
    """
    if record.title is not None:
        title = record.title
        if use_cli_colors:
            title = "\033[95m" + title + "\033[0m"
        title += "\n"
    else:
        title = ""

    if record.authors is not None and len(record.authors) > 0:
        authors = format_to_str(record.authors) + "\n"
    else:
        authors = ""

    if record.abstract is not None and len(record.abstract) > 0:
        abstract = record.abstract
        abstract = "\n" + abstract + "\n"
    else:
        abstract = ""

    return ("\n\n----------------------------------"
            f"\n{title}{authors}{abstract}"
            "----------------------------------\n\n")


class PaperRecord():
    """A single record from a paper in a systematic review.

    Arguments
    ---------
    record_id: int
        Some identifier for this record.
    title: str
        Paper title.
    abstract: str
        Paper abstract.
    authors: str, list
        Authors of the paper.
    notes: str, list
        Notes of the paper.
    keywords: str, list
        Keywords of the paper.
    label: int
        Current label of the paper. No label is indicated by
        asreview.config.LABEL_NA (== -1).
    kwargs: dict
        Any extra keyword arguments will be put in self.extra_fields.
    """

    def __init__(self, record_id, column_spec={}, **kwargs):

        for attr in [
                "title", "abstract", "authors", "notes", "keywords", "doi", "included"
        ]:
            if attr in column_spec:
                col = column_spec[attr]
            elif attr in kwargs:
                col = attr
            else:
                col = None

            attr_val = kwargs.pop(col, None)
            if attr_val is not None and pd.isna(attr_val):
                attr_val = None
            setattr(self, attr, attr_val)

        self.record_id = record_id
        if self.included is None:
            self.included = LABEL_NA
        else:
            self.included = int(self.included)

        self.extra_fields = kwargs

        for attr, val in self.extra_fields.items():
            if not isinstance(val, list) and pd.isna(val):
                self.extra_fields[attr] = None

    def __str__(self):
        return format_record(self)

    @property
    def text(self):
        """Create a single string from title + abstract.

        Returns
        -------
        str:
            Concatenated string from title + abstract.
        """
        title = self.title
        abstract = self.abstract
        if title is None:
            title = ""
        if abstract is None:
            abstract = ""
        return title + " " + abstract

    @property
    def heading(self):
        """Return the title of the paper."""
        if self.title is None:
            return ""
        return self.title

    @property
    def body(self):
        """Return the abstract of the paper."""
        if self.abstract is None:
            return ""
        return self.abstract
