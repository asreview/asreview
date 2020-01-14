# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

"Statistical functions for finding several different measures."
import numpy as np


def _find_inclusions(logger, labels, remove_initial=True):
    "Find the number of inclusions found at each step."
    inclusions = []
    n_initial_inc = 0
    cur_inclusions = 0
    n_initial = 0
    n_queries = logger.n_queries()
    for query_i in range(n_queries):
        label_methods = logger.get("label_methods", query_i)
        label_idx = logger.get("label_idx", query_i)
        for i in range(len(label_idx)):
            if label_methods[i] == "initial" and remove_initial:
                n_initial_inc += labels[label_idx[i]]
                n_initial += 1
            else:
                cur_inclusions += labels[label_idx[i]]
                inclusions.append(cur_inclusions)

    inclusions_after_init = sum(labels)
    if remove_initial:
        inclusions_after_init -= n_initial_inc
    return inclusions, inclusions_after_init, n_initial


def _get_labeled_order(logger):
    "Get the order in which papers were labeled."
    label_order = []
    n_initial = 0
    n_queries = logger.n_queries()
    for query_i in range(n_queries):
        try:
            label_methods = logger.get("label_methods", query_i)
        except KeyError:
            continue
        label_idx = logger.get("label_idx", query_i)
        for i in range(len(label_idx)):
            if label_methods[i] == "initial":
                n_initial += 1
        label_order.extend(label_idx)
    return label_order, n_initial


def _get_last_proba_order(logger):
    "Get the ranking of papers in the last query."
    n_queries = logger.n_queries()
    pool_idx = None
    for query_i in reversed(range(n_queries)):
        try:
            pool_idx = logger.get("pool_idx", query_i)
        except KeyError:
            continue
        if pool_idx is not None:
            proba = logger.get("proba", query_i)
            break

    if pool_idx is None:
        return []
    return pool_idx[np.argsort(-proba[pool_idx])]


def _get_proba_order(logger, query_i):
    "Get the ranking of papers in query_i."
    try:
        pool_idx = logger.get("pool_idx", query_i)
    except KeyError:
        pool_idx = None

    if pool_idx is None:
        return None

    proba = logger.get("proba", query_i)[pool_idx]
    return pool_idx[np.argsort(proba)]


def _n_false_neg(logger, query_i, labels):
    "Find the number of false negatives after reading x papers."
    proba_order = _get_proba_order(logger, query_i)
    if proba_order is None:
        return None
    res = np.zeros(len(proba_order))

    n_one = 0
    for i in range(len(res)):
        if labels[proba_order[i]] == 1:
            n_one += 1
        res[i] = n_one
    return np.array(list(reversed(res)))


def _get_limits(loggers, query_i, labels, proba_allow_miss=[]):
    "Get the number of papers to be read, with a criterium."
    num_left = None

    for logger in loggers.values():
        new_num_left = _n_false_neg(logger, query_i, labels)
        if new_num_left is None:
            return None

        if num_left is None:
            num_left = new_num_left
        else:
            num_left += new_num_left
    num_left /= len(loggers)
    limits = [len(num_left)]*len(proba_allow_miss)
    allow_miss = {i: proba for i, proba in enumerate(proba_allow_miss)}
    for i in range(len(num_left)):
        for i_prob, prob in list(allow_miss.items()):
            if num_left[i] < prob:
                limits[i_prob] = i
                del allow_miss[i_prob]
        if len(allow_miss) == 0:
            break
    return limits


def _random_ttd(loggers, query_i, labels):
    all_ttd = []
    for logger in loggers.values():
        try:
            pool_idx = logger.get("pool_idx", query_i)
        except KeyError:
            continue

        pool_labels = labels[pool_idx]
        n_included = np.sum(pool_labels)

        if n_included == 0:
            continue
        ttd = 0
        p_only_zero = 1
        for i in range(len(pool_labels) - n_included):
            p_first = n_included/(len(pool_labels)-i)
            ttd += p_only_zero*p_first*i
            p_only_zero *= (1-p_first)
        all_ttd.append(ttd)

    if len(all_ttd) == 0:
        ttd_avg = 0
    else:
        ttd_avg = np.average(all_ttd)
    return ttd_avg


def _max_ttd(loggers, query_i, labels):
    all_ttd = []
    for logger in loggers.values():
        proba_order = _get_proba_order(logger, query_i)
        if proba_order is None:
            all_ttd.append(0)
            continue
        if len(proba_order) == 0:
            continue

        x = np.where(labels[proba_order] == 1)[0]
        if len(x) == 0:
            ttd = 0
        else:
            ttd = (len(proba_order)-1) - x[-1]
        all_ttd.append(ttd)

    if len(all_ttd) == 0:
        ttd_avg = 0
    else:
        ttd_avg = np.average(all_ttd)
    return ttd_avg


def _cluster_order(all_dict, power=0):
    scores = []
    for clust_id in all_dict:
        for i in range(all_dict[clust_id]):
            new_score = (i+1) * pow(all_dict[clust_id], -power)
            scores.append((clust_id, new_score))
    scores = sorted(scores, key=lambda x: x[1])
    return [x[0] for x in scores]


def _get_clustering(all_prediction, pool_idx, labels):
    pool_prediction = all_prediction[pool_idx]
    one_idx = np.where(labels[pool_idx] == 1)[0]
    unique, counts = np.unique(pool_prediction, return_counts=True)
    all_dict = {unique[i]: counts[i] for i in range(len(unique))}
    all_counts = [all_dict.get(i, 0) for i in range(np.max(unique)+1)]

    prediction = pool_prediction[one_idx, ]
    unique, counts = np.unique(prediction, return_counts=True)
    one_dict = {unique[i]: counts[i] for i in range(len(unique))}
    one_counts = [one_dict.get(i, 0) for i in range(len(all_counts))]
    return all_dict, all_counts, one_dict, one_counts


def _cluster_ttd(loggers, query_i, labels, all_prediction):
    all_ttd = []
    for logger in loggers.values():
        try:
            pool_idx = logger.get("pool_idx", query_i)
        except KeyError:
            all_ttd.append(0)
            continue

        all_dict, all_counts, _one_dict, one_counts = _get_clustering(
            all_prediction, pool_idx, labels)
        cluster_order = _cluster_order(all_dict)

        p_only_zero = 1
        ttd = 0
        if np.sum(one_counts) == 0:
            continue
        for i, i_clust in enumerate(cluster_order):
            try:
                p_first = one_counts[i_clust]/all_counts[i_clust]
            except IndexError:
                print(
                    i_clust, list(all_dict), len(all_counts), len(one_counts))
            ttd += p_only_zero*p_first*i
            p_only_zero *= 1-p_first
            all_counts[i_clust] -= 1
            if p_only_zero < 1e-6:
                break
        all_ttd.append(ttd)

    if len(all_ttd) == 0:
        ttd_avg = 0
    else:
        ttd_avg = np.average(all_ttd)
    return ttd_avg
