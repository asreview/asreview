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

import re
from difflib import SequenceMatcher

import numpy as np

from asreview.utils import format_to_str


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


def _match_best(keywords, index, match_strings, threshold=0.75):
    n_match = len(match_strings)
    word = re.compile(r"['\w]+")
    key_list = word.findall(keywords.lower())

    ratios = np.zeros(n_match)
    for key in key_list:
        cur_ratios = {}
        s = SequenceMatcher()
        s.set_seq2(key)
        for token in index:
            s.set_seq1(token)
            ratio = s.quick_ratio()
            if ratio < threshold:
                continue
            for idx in index[token]:
                if ratio > cur_ratios.get(idx, 0.0):
                    cur_ratios[idx] = ratio

        for idx, rat in cur_ratios.items():
            ratios[idx] += rat

    return (100 * ratios) / len(key_list)


def _get_fuzzy_scores(keywords, match_strings):
    """Rank a list of strings, depending on a set of keywords.

    Arguments
    ---------
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
    return _match_best(keywords, inv_index, match_strings)


def _match_string(as_data):
    match_str = np.full(len(as_data), "x", dtype=object)

    all_titles = as_data.title
    all_authors = as_data.authors
    all_keywords = as_data.keywords
    for i in range(len(as_data)):
        match_list = []
        if all_authors is not None:
            match_list.append(format_to_str(all_authors[i]))
        match_list.append(all_titles[i])
        if all_keywords is not None:
            match_list.append(format_to_str(all_keywords[i]))
        match_str[i, ] = " ".join(match_list)
    return match_str


def fuzzy_find(as_data,
               keywords,
               threshold=60,
               max_return=10,
               exclude=None,
               by_index=True):
    """Find a record using keywords.

    It looks for keywords in the title/authors/keywords
    (for as much is available). Using the diflib package it creates
    a ranking based on token set matching.

    Arguments
    ---------
    as_data: asreview.data.ASReviewData
        ASReview data object to search
    keywords: str
        A string of keywords together, can be a combination.
    threshold: float
        Don't return records below this threshold.
    max_return: int
        Maximum number of records to return.
    exclude: list, numpy.ndarray
        List of indices that should be excluded in the search. You would
        put papers that were already labeled here for example.
    by_index: bool
        If True, use internal indexing.
        If False, use record ids for indexing.

    Returns
    -------
    list
        Sorted list of indexes that match best the keywords.
    """
    new_ranking = _get_fuzzy_scores(keywords, _match_string(as_data))
    sorted_idx = np.argsort(-new_ranking)
    best_idx = []
    if exclude is None:
        exclude = np.array([], dtype=int)
    for idx in sorted_idx:
        if ((not by_index and as_data.df.index.values[idx] in exclude) or
                by_index and idx in exclude):
            continue
        if len(best_idx) >= max_return:
            break
        if len(best_idx) > 0 and new_ranking[idx] < threshold:
            break
        best_idx.append(idx)
    fuzz_idx = np.array(best_idx, dtype=int)
    if not by_index:
        fuzz_idx = as_data.df.index.values[fuzz_idx]
    return fuzz_idx.tolist()
