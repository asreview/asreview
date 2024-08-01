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
    "n_records",
    "n_relevant",
    "n_irrelevant",
    "n_unlabeled",
    "n_missing_title",
    "n_missing_abstract",
    "title_length",
    "abstract_length",
    "n_keywords",
    "n_duplicates",
]

import numpy as np


def n_records(data):
    """Return the number of records.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    return len(data)


def n_relevant(data):
    """Return the number of relevant records.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    if "included" in data:
        return len(np.where(data["included"] == 1)[0])


def n_irrelevant(data):
    """Return the number of irrelevant records.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    if "included" in data:
        return len(np.where(data["included"] == 0)[0])


def n_unlabeled(data):
    """Return the number of unlabeled records.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    if "included" in data:
        return len(data) - n_relevant(data) - n_irrelevant(data)


def n_missing_title(data):
    """Return the number of records with missing titles.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    try:
        titles = data["title"]
    except KeyError:
        return None, None
    try:
        included = data["included"]
    except KeyError:
        included = [None for _ in range(len(titles))]

    n_missing = 0
    n_missing_included = 0
    for i in range(len(data)):
        if len(titles[i]) == 0:
            n_missing += 1
            if included[i] == 1:
                n_missing_included += 1

    if "included" not in data:
        n_missing_included = None

    return n_missing, n_missing_included


def n_missing_abstract(data):
    """Return the number of records with missing abstracts.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    try:
        abstracts = data["abstract"]
    except KeyError:
        return None, None
    try:
        included = data["included"]
    except KeyError:
        included = [None for _ in range(len(abstracts))]

    n_missing = 0
    n_missing_included = 0
    for i in range(len(data)):
        if len(abstracts[i]) == 0:
            n_missing += 1
            if included[i] == 1:
                n_missing_included += 1

    if "included" not in data:
        n_missing_included = None

    return n_missing, n_missing_included


def title_length(data):
    """Return the average length of the titles.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    try:
        titles = data["title"]
    except KeyError:
        return None
    return np.char.str_len(titles).mean()


def abstract_length(data):
    """Return the average length of the abstracts.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    try:
        abstracts = data["abstract"]
    except KeyError:
        return None
    return np.char.str_len(abstracts).mean()


def n_keywords(data):
    """Return the number of keywords.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.

    Return
    ------
    int:
        The statistic
    """
    # Before the Dataset class cleaned the keywords before returning them.
    # I'll do this in the reader pipeline later, for now I'll just import the
    # cleaning code here.
    from asreview.data.base import _convert_keywords

    try:
        keywords = data["keywords"]
    except KeyError:
        return None
    keywords = keywords.apply(_convert_keywords)
    return np.average([len(keywords) for keywords in keywords])


def n_duplicates(data, pid="doi"):
    """Number of duplicates.

    Duplicate detection can be a very challenging task. Multiple
    algorithms can be used and results can be vary.

    Arguments
    ---------
    data: asreview.Dataset
        An Dataset object with the records.
    pid: string
        Which persistent identifier (PID) to use for deduplication.
        Default is 'doi'.

    Return
    ------
    int:
        Number of duplicates
    """
    return int(data.duplicated(pid).sum())
