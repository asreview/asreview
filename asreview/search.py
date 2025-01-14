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

__all__ = ["fuzzy_find"]

import re
from difflib import SequenceMatcher

import numpy as np

from asreview.utils import _format_to_str


def _create_inverted_index(match_strings):
    index = {}
    word = re.compile(r"['\w]+")
    for i, match in enumerate(match_strings):
        tokens = word.findall(match.lower())
        for token in tokens:
            if token in index:
                if index[token][-1] != i:
                    index[token].append(i)
            else:
                index[token] = [i]
    return index


def _get_fuzzy_scores(keywords, match_strings, threshold=0.9):
    """Rank a list of strings, depending on a set of keywords.

    Parameters
    ----------
    keywords: str
        Keywords that we are trying to find in the string list.
    str_list: list
        List of strings that should be scored according to the keywords.

    Returns
    -------
    numpy.ndarray
        Array of scores ordered in the same way as the str_list input.
    """
    inv_index = _create_inverted_index(match_strings)

    n_match = len(match_strings)
    word = re.compile(r"['\w]+")
    key_list = word.findall(keywords.lower())

    ratios = np.zeros(n_match)
    for key in key_list:
        cur_ratios = {}
        s = SequenceMatcher()
        s.set_seq2(key)
        for token in inv_index:
            s.set_seq1(token)
            ratio = s.quick_ratio()
            if ratio < threshold:
                continue
            for idx in inv_index[token]:
                if ratio > cur_ratios.get(idx, 0.0):
                    cur_ratios[idx] = ratio

        for idx, rat in cur_ratios.items():
            ratios[idx] += rat

    return (100 * ratios) / len(key_list)


def fuzzy_find(
    data,
    keywords,
    threshold=60,
    max_return=10,
    exclude=None,
):
    """Find a record using keywords.

    It looks for keywords in the title/authors/keywords
    (for as much is available). Using the diflib package it creates
    a ranking based on token set matching.

    Parameters
    ----------
    data: pd.DataFrame or DataStore
        Dataframe containing the column 'title' and optionally 'authors' and 'keywords'.
    keywords: str
        A string of keywords together, can be a combination.
    threshold: float
        Don't return records below this threshold.
    max_return: int
        Maximum number of records to return.
    exclude: list, numpy.ndarray
        List of indices that should be excluded in the search. You would
        put records that were already labeled here for example.

    Returns
    -------
    list
        Sorted list of indexes that match best the keywords.
    """
    if "title" not in data:
        raise ValueError("Cannot search dataset without titles.")

    all_strings = data["title"].fillna("")

    if "authors" in data:
        all_strings += " " + data["authors"].map(_format_to_str).fillna("")

    if "keywords" in data:
        all_strings += " " + data["keywords"].map(_format_to_str).fillna("")

    new_ranking = _get_fuzzy_scores(keywords, all_strings.values)
    sorted_idx = np.argsort(-new_ranking)
    best_idx = []
    if exclude is None:
        exclude = np.array([], dtype=int)
    for idx in sorted_idx:
        if idx in exclude:
            continue
        if len(best_idx) >= max_return:
            break
        if len(best_idx) > 0 and new_ranking[idx] < threshold:
            break
        best_idx.append(idx)
    fuzz_idx = np.array(best_idx, dtype=int)
    return fuzz_idx.tolist()
