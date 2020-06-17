import os

import pandas as pd

from asreview.config import LABEL_NA
from asreview.utils import format_to_str


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
    keywords: str, list
        Keywords of the paper.
    label: int
        Current label of the paper. No label is indicated by
        asreview.config.LABEL_NA (== -1).
    kwargs: dict
        Any extra keyword arguments will be put in self.extra_fields.
    """
    def __init__(self, record_id, column_spec={}, **kwargs):

        for attr in ["title", "abstract", "authors", "keywords",
                     "final_included"]:
            if attr in column_spec:
                col = column_spec[attr]
            elif attr in kwargs:
                col = attr
            else:
                col = None
            setattr(self, attr, kwargs.pop(col, None))

        self.record_id = record_id
        if self.final_included is None:
            self.final_included = LABEL_NA
        else:
            self.final_included = int(self.final_included)

        self.extra_fields = kwargs

        for attr, val in self.extra_fields.items():
            if pd.isna(val):
                self.extra_fields[attr] = None

    def preview(self, w_title=80, w_authors=40, automatic_width=False):
        """Return a single line preview string for record i.

        Arguments
        ---------
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
            width_available = term_width-7
            w_title = round((2/3)*width_available)
            w_authors = width_available - w_title
        title_str = ""
        author_str = ""
        heading = self.title
        if heading is None:
            heading = self.abstract
        if heading is not None:
            if len(heading) > w_title:
                title_str = heading[:w_title - 2] + ".."
            else:
                title_str = heading

        if self.authors is not None:
            cur_authors = format_to_str(self.authors)
            if len(cur_authors) > w_authors:
                author_str = cur_authors[:w_authors - 2] + ".."
            else:
                author_str = cur_authors
        format_str = "{0: <" + str(w_title) + "}   " + "{1: <" + str(w_authors)
        format_str += "}"
        prev_str = format_str.format(title_str, author_str)
        return prev_str

    def format(self, use_cli_colors=True):
        """Format one record for displaying in the CLI.

        Arguments
        ---------
        use_cli_colors: bool
            Some terminals support colors, set to True to use them.

        Returns
        -------
        str:
            A string including title, abstracts and authors.
        """
        if self.title is not None:
            title = self.title
            if use_cli_colors:
                title = "\033[95m" + title + "\033[0m"
            title += "\n"
        else:
            title = ""

        if self.authors is not None and len(self.authors) > 0:
            authors = format_to_str(self.authors) + "\n"
        else:
            authors = ""

        if self.abstract is not None and len(self.abstract) > 0:
            abstract = self.abstract
            abstract = "\n" + abstract + "\n"
        else:
            abstract = ""

        return ("\n\n----------------------------------"
                f"\n{title}{authors}{abstract}"
                "----------------------------------\n\n")

    def print(self, *args, **kwargs):
        "Print a record to the console."
        print(self.format(*args, **kwargs))

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

    def todict(self):
        """Create dictionary from the record."""
        label = self.label
        if self.label is LABEL_NA:
            label = None
        paper_dict = {
            "title": self.title,
            "abstract": self.abstract,
            "authors": self.authors,
            "keywords": self.keywords,
            "record_id": self.record_id,
            "label": label,
        }
        paper_dict.update(self.extra_fields)
        return paper_dict
