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

import logging
from math import log

import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing.text import text_to_word_sequence
except ImportError:
    TF_AVAILABLE = False
else:
    TF_AVAILABLE = True
    try:
        tf.logging.set_verbosity(tf.logging.ERROR)
    except AttributeError:
        logging.getLogger("tensorflow").setLevel(logging.ERROR)


from asreview.models.feature_extraction.embedding_lstm import load_embedding
from asreview.models.feature_extraction.base import BaseFeatureExtraction
from asreview.utils import get_random_state


def _check_tensorflow():
    if not TF_AVAILABLE:
        raise ImportError(
            "Install tensorflow package to use"
            " Embedding IDF.")


class EmbeddingIdf(BaseFeatureExtraction):
    """Embedding IDF feature extraction technique.

    This model averages the weighted word vectors of all the words in the
    text, in order to get a single feature vector for each text. The weights
    are provided by the inverse document frequencies.

    .. note::

        This feature extraction technique requires ``tensorflow`` to be
        installed. Use ``pip install tensorflow`` or install all optional
        ASReview dependencies with ``pip install asreview[all]``

    Arguments
    ---------
    embedding_fp: str
        Path to embedding.

    """

    name = "embedding-idf"
    label = "Embedding IDF"

    def __init__(self, *args, embedding_fp=None, random_state=None, **kwargs):
        """Initialize the Embedding-Idf model."""
        super(EmbeddingIdf, self).__init__(*args, **kwargs)
        self.embedding_fp = embedding_fp
        self.embedding = None
        self._random_state = get_random_state(random_state)

    def transform(self, texts):

        # check is tensorflow is available
        _check_tensorflow()

        if self.embedding is None:
            if self.embedding_fp is None:
                raise ValueError(
                    "Error: need embedding to train Embeddingdf model.")
            self.embedding = load_embedding(self.embedding_fp, n_jobs=-1)

        text_counts = _get_freq_dict(texts)
        idf = _get_idf(text_counts)
        X = _get_X_from_dict(text_counts, idf, self.embedding,
                             self._random_state)
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
        idf[word] = log(len(text_dicts) / all_count[word])
    return idf


def _get_X_from_dict(text_dicts, idf, embedding, random_state):
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
                text_vec = cur_vec * cur_idf * cur_count
            else:
                text_vec += cur_vec * cur_idf * cur_count
        if text_vec is None:
            text_vec = random_state.random(n_vec)

        text_norm = np.linalg.norm(text_vec)
        if abs(text_norm) > 1e-7:
            text_vec /= np.linalg.norm(text_vec)
        X[i] = text_vec
    return X
