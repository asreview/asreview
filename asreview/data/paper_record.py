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

__all__ = ["PaperRecord"]


from dataclasses import dataclass


@dataclass
class PaperRecord:
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
    included: int
        Current label of the paper. No label is indicated by
        asreview.config.LABEL_NA (== -1).
    kwargs: dict
        Any extra keyword arguments will be put in self.extra_fields.
    """

    # def __init__(self, record_id, column_spec=None, **kwargs):
    #     if column_spec is None:
    #         column_spec = {}
    #     for attr in [
    #         "title",
    #         "abstract",
    #         "authors",
    #         "notes",
    #         "keywords",
    #         "doi",
    #         "url",
    #         "included",
    #     ]:
    #         if attr in column_spec:
    #             col = column_spec[attr]
    #         elif attr in kwargs:
    #             col = attr
    #         else:
    #             col = None

    #         attr_val = kwargs.pop(col, None)
    #         if attr_val is not None and pd.isna(attr_val):
    #             attr_val = None
    #         setattr(self, attr, attr_val)

    #     self.record_id = record_id
    #     if self.included is None:
    #         self.included = LABEL_NA
    #     else:
    #         self.included = int(self.included)

    #     self.extra_fields = kwargs

    #     for attr, val in self.extra_fields.items():
    #         if not isinstance(val, list) and pd.isna(val):
    #             self.extra_fields[attr] = None

    # def __str__(self):
    #     return format_record(self)

    # @property
    # def text(self):
    #     """Create a single string from title + abstract.

    #     Returns
    #     -------
    #     str:
    #         Concatenated string from title + abstract.
    #     """
    #     title = self.title
    #     abstract = self.abstract
    #     if title is None:
    #         title = ""
    #     if abstract is None:
    #         abstract = ""
    #     return title + " " + abstract

    # @property
    # def heading(self):
    #     """Return the title of the paper."""
    #     if self.title is None:
    #         return ""
    #     return self.title

    # @property
    # def body(self):
    #     """Return the abstract of the paper."""
    #     if self.abstract is None:
    #         return ""
    #     return self.abstract
