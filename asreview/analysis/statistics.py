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
"""Statistical functions for finding several different measures."""
import numpy as np


def _find_inclusions(state, labels, remove_initial=True):
    """Find the number of inclusions found at each step."""
    inclusions = []
    n_initial_inc = 0
    cur_inclusions = 0
    n_initial = 0
    n_queries = state.n_queries()
    for query_i in range(n_queries):
        try:
            label_methods = state.get("label_methods", query_i)
            label_idx = state.get("label_idx", query_i)
        except KeyError:
            continue
        for i in range(len(label_idx)):
            if label_methods[i] == "initial" and remove_initial:
                n_initial_inc += labels[label_idx[i]]
                n_initial += 1
            else:
                cur_inclusions += labels[label_idx[i]]
                inclusions.append(cur_inclusions)

    inclusions_after_init = sum(labels == 1)
    if remove_initial:
        inclusions_after_init -= n_initial_inc
    return inclusions, inclusions_after_init, n_initial


def _get_labeled_order(state):
    """Get the order in which papers were labeled."""
    label_order = []
    n_initial = 0
    n_queries = state.n_queries()
    for query_i in range(n_queries):
        try:
            label_methods = state.get("label_methods", query_i)
        except KeyError:
            continue
        label_idx = state.get("label_idx", query_i)
        for i in range(len(label_idx)):
            if label_methods[i] == "initial":
                n_initial += 1
        label_order.extend(label_idx)
    return label_order, n_initial


def _get_last_proba_order(state):
    """Get the ranking of papers in the last query."""
    n_queries = state.n_queries()
    pool_idx = None
    for query_i in reversed(range(n_queries)):
        try:
            pool_idx = state.get("pool_idx", query_i)
        except KeyError:
            continue
        if pool_idx is not None:
            proba = state.get("proba", query_i)
            break

    if pool_idx is None:
        return []
    return pool_idx[np.argsort(-proba[pool_idx])]


def _get_proba_order(state, query_i):
    """Get the ranking of papers in query_i."""
    try:
        pool_idx = state.get("pool_idx", query_i)
    except KeyError:
        pool_idx = None

    if pool_idx is None:
        return None

    proba = state.get("proba", query_i)[pool_idx]
    return pool_idx[np.argsort(proba)]


def _n_false_neg(state, query_i, labels):
    """Find the number of false negatives after reading x papers."""
    proba_order = _get_proba_order(state, query_i)
    if proba_order is None:
        return None
    res = np.zeros(len(proba_order))

    n_one = 0
    for i in range(len(res)):
        if labels[proba_order[i]] == 1:
            n_one += 1
        res[i] = n_one
    return np.array(list(reversed(res)))


def _get_limits(states, query_i, labels, proba_allow_miss=[]):
    """Get the number of papers to be read, with a criterium."""
    num_left = None

    for state in states.values():
        new_num_left = _n_false_neg(state, query_i, labels)
        if new_num_left is None:
            return None

        if num_left is None:
            num_left = new_num_left
        else:
            num_left += new_num_left
    num_left /= len(states)
    limits = [len(num_left)] * len(proba_allow_miss)
    allow_miss = {i: proba for i, proba in enumerate(proba_allow_miss)}
    for i in range(len(num_left)):
        for i_prob, prob in list(allow_miss.items()):
            if num_left[i] < prob:
                limits[i_prob] = i
                del allow_miss[i_prob]
        if len(allow_miss) == 0:
            break
    return limits
