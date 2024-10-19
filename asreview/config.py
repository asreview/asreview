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

__all__ = [
    "COLUMN_DEFINITIONS",
    "DEFAULT_BALANCE_STRATEGY",
    "DEFAULT_FEATURE_EXTRACTION",
    "DEFAULT_CLASSIFIER",
    "DEFAULT_N_QUERY",
    "DEFAULT_N_PRIOR_IRRELEVANT",
    "DEFAULT_N_PRIOR_RELEVANT",
    "DEFAULT_QUERY_STRATEGY",
    "LABEL_NA",
]

LABEL_NA = -1

# CLI defaults
DEFAULT_CLASSIFIER = "nb"
DEFAULT_QUERY_STRATEGY = "max"
DEFAULT_BALANCE_STRATEGY = "double"
DEFAULT_FEATURE_EXTRACTION = "tfidf"
DEFAULT_N_QUERY = 1
DEFAULT_N_PRIOR_RELEVANT = 0
DEFAULT_N_PRIOR_IRRELEVANT = 0

COLUMN_DEFINITIONS = {
    "included": [
        "final_included",
        "label",
        "label_included",
        "included_label",
        "included_final",
        "included",
        "included_flag",
        "include",
    ],
    "title": ["title", "primary_title"],
    "authors": ["authors", "author names", "first_authors"],
    "abstract": ["abstract", "abstract note", "notes_abstract"],
    "notes": ["notes"],
    "keywords": ["keywords"],
    "doi": ["doi"],
    "tags": [
        "tags",
    ],
    "is_prior": ["asreview_prior", "is_prior"],
}
