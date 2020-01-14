#!/usr/bin/env python

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

from math import sqrt

import numpy as np


def simulate_score(one_dict, all_dict, n_run=10000):
    total_one = np.sum([x for x in one_dict.values()])
    total = np.sum([x for x in all_dict.values()])
    sim_scores = []
    for _ in range(n_run):
        one_idx = np.random.choice(range(total), total_one, replace=False)
        one_idx = np.sort(one_idx)
        new_one_dict = {}
        cur_all_idx = 0
        cur_one_idx = 0
        for key in all_dict:
            cur_all_idx += all_dict[key]
            while cur_one_idx < len(one_idx) and one_idx[cur_one_idx] < cur_all_idx:
                if key in new_one_dict:
                    new_one_dict[key] += 1
                else:
                    new_one_dict[key] = 1
                cur_one_idx += 1
        try:
            sim_scores.append(cluster_score(new_one_dict, all_dict))
        except ZeroDivisionError:
            print(new_one_dict, all_dict)
            raise

    return np.average(sim_scores), np.std(sim_scores)


def cluster_score(one_dict, all_dict):
    tp = 0
    fn = 0
    fp = 0
    total = np.sum(list(one_dict.values()))
    for key, n_total in all_dict.items():
        n_one = one_dict.get(key, 0)
        n_zero = n_total-n_one
        tp += n_one*(n_one - 1)/2
        fn += n_zero*n_one
        fp += n_one*(total-n_one)
    return tp/sqrt(1+(tp+fn)*(tp+fp))


def normalized_cluster_score(prediction, labels):
    one_dict, all_dict = get_one_all_dict(prediction, labels)
    score = cluster_score(one_dict, all_dict)
    avg, sigma = simulate_score(one_dict, all_dict)
    return (score-avg)/sigma


def get_one_all_dict(prediction, labels):
    one_idx = np.where(labels == 1)[0]
    unique, counts = np.unique(prediction, return_counts=True)
    all_dict = {unique[i]: counts[i] for i in range(len(unique))}
    all_counts = [all_dict.get(i, 0) for i in range(len(unique))]

    one_prediction = prediction[one_idx, ]
    unique, counts = np.unique(one_prediction, return_counts=True)
    one_dict = {unique[i]: counts[i] for i in range(len(unique))}
    one_counts = [one_dict.get(i, 0) for i in range(len(all_counts))]
    return one_dict, all_dict
