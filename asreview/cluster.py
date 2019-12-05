#!/usr/bin/env python

from math import log

import numpy as np

from asreview import ASReviewData, load_embedding
from keras_preprocessing.text import text_to_word_sequence


def get_freq_dict(all_text):
    text_dicts = []
    for text in all_text:
        cur_dict = {}
        word_sequence = text_to_word_sequence(text)
        for word in word_sequence:
            if word in cur_dict:
                cur_dict[word] += 1
            else:
                cur_dict[word] = 1
        text_dicts.append(cur_dict)
    return text_dicts


def get_idf(text_dicts):
    all_count = {}
    for text in text_dicts:
        for word in text:
            if word in all_count:
                all_count[word] += 1
            else:
                all_count[word] = 1

    idf = {}
    for word in all_count:
        idf[word] = log(len(text_dicts)/all_count[word])
    return idf


def get_X_from_dict(text_dicts, idf, embedding):
    n_vec = len(embedding[list(embedding.keys())[0]])
    X = np.zeros((len(text_dicts), n_vec))
    for i, text in enumerate(text_dicts):
        text_vec = None
        for word in text:
            cur_count = text[word]
            cur_idf = idf[word]
            cur_vec = embedding.get(word, None)
            if cur_vec is None:
                continue
            if text_vec is None:
                text_vec = cur_vec*cur_idf*cur_count
            else:
                text_vec += cur_vec*cur_idf*cur_count
        if text_vec is None:
            text_vec = np.random.random(n_vec)
        text_vec /= np.linalg.norm(text_vec)
        X[i] = text_vec
    return X


def get_Xy(data_fp, embedding_fp):
    embedding = load_embedding(embedding_fp, n_jobs=-1)
    as_data = ASReviewData.from_file(data_fp)
    _, text, labels = as_data.get_data()
    text_counts = get_freq_dict(text)
    idf = get_idf(text_counts)
    X = get_X_from_dict(text_counts, idf, embedding)
    y = labels
    return X, y


def get_X(texts, embedding_fp):
    embedding = load_embedding(embedding_fp)
#     as_data = ASReviewData.from_file(data_fp)
#     _, text, _ = as_data.get_data()
    text_counts = get_freq_dict(texts)
    idf = get_idf(text_counts)
    X = get_X_from_dict(text_counts, idf, embedding)
    return X


def get_cluster_X(texts, embedding_fp):
    if texts is None or embedding_fp is None:
        return None
    X = get_X(texts, embedding_fp)
    if not isinstance(X, np.ndarray):
        X = X.toarray()
    return X
