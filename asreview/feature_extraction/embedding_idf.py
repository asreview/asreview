from math import log

import numpy as np
from keras_preprocessing.text import text_to_word_sequence

from asreview.models.embedding import load_embedding
from asreview.unsupervised.base import BaseUnsupervised


class EmbeddingIdf(BaseUnsupervised):
    name = "embedding_idf"

    def __init__(self, param={}):
        super(EmbeddingIdf, self).__init__(param)
        self.param = {key: int(value) for key, value in self.param.items()}
        self.embedding = None

    def default_param(self):
        return {
            "embedding_fp": None,
        }

    def fit_transform(self, texts):
        if self.embedding is None:
            embedding_fp = self.param["embedding_fp"]
            if embedding_fp is None:
                raise ValueError(
                    "Error: need embedding to train Embeddingdf model.")
            self.embedding = load_embedding(embedding_fp, n_jobs=-1)

        text_counts = _get_freq_dict(texts)
        idf = _get_idf(text_counts)
        X = _get_X_from_dict(text_counts, idf, self.embedding)
        return X


def _get_freq_dict(all_text):
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


def _get_idf(text_dicts):
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


def _get_X_from_dict(text_dicts, idf, embedding):
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


