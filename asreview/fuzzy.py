from copy import deepcopy
from difflib import SequenceMatcher
from math import log
import re

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import normalize
import scipy

from asreview.data import create_inverted_index


class FuzzyMatcher():
    def __init__(self, as_data, token_threshold=0.75, match_threshold=0.8):
        self.as_data = as_data
        self.token_threshold = token_threshold
        self.match_threshold = match_threshold
        self.match_str = as_data.match_string
        self.index = create_inverted_index(self.match_str)
        self.words = list(self.index)
        self.words_array = np.array(self.words)
        self.vectorizer = CountVectorizer(self.words, analyzer="char",
                                          ngram_range=(2, 2))

        self.X = normalize(self.vectorizer.fit_transform(self.words))
        self.re_word = re.compile("['\w]+")

    def match(self, keywords, max_match=10):
        n_match = len(self.match_str)
        key_list = self.re_word.findall(keywords.lower())

        if len(key_list) == 0:
            return np.arange(n_match).tolist()

        match_tokens = []
        token_lists = get_tokens(key_list, self.vectorizer, self.X,
                                 self.words_array)
        for i_key, key in enumerate(key_list):
            token_list = token_lists[i_key]
            if len(key) == 1 and key in self.index:
                token_list = [key]

            s = SequenceMatcher()
            s.set_seq2(key)
            cur_matches = {}
            for token in token_list:
                if token == key:
                    ratio = 1.0
                else:
                    s.set_seq1(token)
                    ratio = s.real_quick_ratio()
                    if ratio < self.token_threshold:
                        continue
                    ratio = 0.999*s.quick_ratio()
                if ratio < self.token_threshold:
                    continue
                cur_matches[token] = (ratio, len(self.index[token]))

            if len(cur_matches) == 0:
                continue
            best_value = max([x[0] for x in cur_matches.values()])
            good_tokens = {x: val for x, val in cur_matches.items()
                           if val[0]+0.1 >= best_value}
            match_tokens.append(good_tokens)

        if len(match_tokens) == 0:
            return [np.random.randint(n_match)]

        match_tokens.sort(key=lambda x: sum(y[1] for y in x.values()))
        weights = []
        occurrences = []
        for res in match_tokens:
            n_occ = sum(x[1] for x in res.values())
            w = log((n_match+20)/(n_occ+20))
            weights.append(max(0, w))
            occurrences.append(n_occ)
        if sum(weights) == 0:
            weights[0] = 1
        weights = np.array(weights)/sum(weights)
        current_matches = {}
        current_bar = 0.0
        for i_key in range(len(weights)):
            weight_left = sum(weights[i_key:])
            current_bar = filter_current_matches(current_matches, weight_left,
                                                 max_match)
            if current_bar > 0:
                cur_match_work = per_match_work(match_tokens[i_key:],
                                                len(current_matches))
                if occurrences[i_key] > cur_match_work:
                    match_final_keys(current_matches, match_tokens[i_key:],
                                     self.match_str,
                                     weights[i_key:], in_place=True)
                    break
            new_matches = {}
            for token, val in match_tokens[i_key].items():
                ratio = val[0] * weights[i_key]
                for idx in self.index[token]:
                    cur_val = current_matches.get(idx, 0)
                    if cur_val >= current_bar:
                        if idx in new_matches:
                            new_matches[idx] = max(ratio, new_matches[idx])
                        else:
                            new_matches[idx] = ratio
            for idx, ratio in new_matches.items():
                if idx not in current_matches:
                    current_matches[idx] = ratio
                else:
                    current_matches[idx] += ratio

        filter_current_matches(current_matches, max_match=max_match,
                               weight_left=0)
        return_matches = {key: value for key, value in current_matches.items()
                          if value >= self.match_threshold}
        if len(return_matches) == 0:
            return list(sorted(current_matches,
                               key=lambda x: -current_matches[x]))[0:max_match]

        return list(sorted(return_matches,
                           key=lambda x: -return_matches[x]))[:max_match]


def get_tokens(keyword, vectorizer, X, words):
    try:
        y = normalize(vectorizer.transform(keyword))
    except ValueError:
        y = vectorizer.transform(keyword)
        print(keyword, y.data, y.indptr, y.indices)
        return [[] for _ in range(len(keyword))]
    cor = X*y.T
    cor_bool = cor.T >= 0.49
    tokens = []
    for i in range(len(keyword)):
        _, cols, _ = scipy.sparse.find(cor_bool[i])
        tokens.append(words[cols])
    return tokens


def filter_current_matches(current_matches, weight_left, max_match,
                           max_diff=0.2):
    try:
        current_best = max(current_matches.values())
    except ValueError:
        current_best = 0
    try:
        current_nth_best = sorted(current_matches.values())[-max_match]
    except IndexError:
        current_nth_best = 0

    current_bar = max(0, current_best - weight_left - max_diff,
                      current_nth_best - weight_left)
    del_key = [key for key, value in current_matches.items()
               if value+1e-7 < current_bar]
    for key in del_key:
        del current_matches[key]
    return current_bar


def per_match_work(tokens_left, n_matches):
    if not n_matches or len(tokens_left) == 0:
        return 0
    n_keywords = sum(len(tokens) for tokens in tokens_left)
    return n_keywords*n_matches


def match_final_keys(current_matches, tokens_left, match_str, weights_left,
                     in_place=False):
    if len(tokens_left) == 0:
        return current_matches
    if not in_place:
        current_matches = deepcopy(current_matches)
    WORD = re.compile("['\w]+")

    for idx in current_matches:
        key_set = set(WORD.findall(match_str[idx].lower()))
        for i, token in enumerate(tokens_left):
            key_set_found = set(token)
            matches = key_set & key_set_found
            if not len(matches):
                continue
            match_ratio = max(token[x][0] for x in matches)
            current_matches[idx] += match_ratio * weights_left[i]
    return current_matches
