# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

import numpy as np


def n_records(data):
    """Return the number of records.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

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
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.labels is not None:
        return len(np.where(data.labels == 1)[0])
    return None


def n_irrelevant(data):
    """Return the number of irrelevant records.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.labels is None:
        return None
    return len(np.where(data.labels == 0)[0])


def n_unlabeled(data):
    """Return the number of unlabeled records.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.labels is None:
        return None
    return len(data.labels) - n_relevant(data) - n_irrelevant(data)


def n_missing_title(data):
    """Return the number of records with missing titles.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    n_missing = 0
    if data.title is None:
        return None, None
    if data.labels is None:
        n_missing_included = None
    else:
        n_missing_included = 0
    for i in range(len(data.title)):
        if len(data.title[i]) == 0:
            n_missing += 1
            if (data.labels is not None and data.labels[i] == 1):
                n_missing_included += 1
    return n_missing, n_missing_included


def n_missing_abstract(data):
    """Return the number of records with missing abstracts.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    n_missing = 0
    if data.abstract is None:
        return None, None
    if data.labels is None:
        n_missing_included = None
    else:
        n_missing_included = 0

    for i in range(len(data.abstract)):
        if len(data.abstract[i]) == 0:
            n_missing += 1
            if (data.labels is not None and data.labels[i] == 1):
                n_missing_included += 1

    return n_missing, n_missing_included


def title_length(data):
    """Return the average length of the titles.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.title is None:
        return None
    avg_len = 0
    for i in range(len(data.title)):
        avg_len += len(data.title[i])
    return avg_len / len(data.title)


def abstract_length(data):
    """Return the average length of the abstracts.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.abstract is None:
        return None
    avg_len = 0
    for i in range(len(data.abstract)):
        avg_len += len(data.abstract[i])
    return avg_len / len(data.abstract)


def n_keywords(data):
    """Return the number of keywords.

    Arguments
    ---------
    data: asreview.data.ASReviewData
        An ASReviewData object with the records.

    Return
    ------
    int:
        The statistic
    """
    if data.keywords is None:
        return None
    return np.average([len(keywords) for keywords in data.keywords])
