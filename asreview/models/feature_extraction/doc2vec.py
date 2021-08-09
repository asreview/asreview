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
try:
    from gensim.utils import simple_preprocess
    from gensim.models.doc2vec import TaggedDocument
    from gensim.models.doc2vec import Doc2Vec as GenSimDoc2Vec
    GENSIM_AVAILABLE = True
except ImportError:
    GENSIM_AVAILABLE = False

from asreview.models.feature_extraction.base import BaseFeatureExtraction


def _check_gensim():
    if not GENSIM_AVAILABLE:
        raise ImportError(
            "Install gensim package to use"
            " Doc2Vec.")


def _train_model(corpus, *args, **kwargs):

    model = GenSimDoc2Vec(*args, **kwargs)
    model.build_vocab(corpus)
    model.train(corpus, total_examples=model.corpus_count, epochs=model.epochs)
    return model


def _transform_text(model, corpus):
    X = []
    for doc_id in range(len(corpus)):
        doc_vec = model.infer_vector(corpus[doc_id].words)
        X.append(doc_vec)
    return np.array(X)


class Doc2Vec(BaseFeatureExtraction):
    """Doc2Vec feature extraction technique.

    Feature extraction technique provided by the `gensim
    <https://radimrehurek.com/gensim/>`__ package. It takes relatively long to
    create a feature matrix with this method. However, this only has to be
    done once per simulation/review. The upside of this method is the
    dimension- reduction that generally takes place, which makes the modelling
    quicker.

    .. note::

        This feature extraction technique requires ``gensim`` to be installed.
        Use ``pip install gensim`` or install all optional ASReview
        dependencies with ``pip install asreview[all]``

    Arguments
    ---------
    vector_size: int
        Output size of the vector.
    epochs: int
        Number of epochs to train the doc2vec model.
    min_count: int
        Minimum number of occurences for a word in the corpus for it to
        be included in the model.
    n_jobs: int
        Number of threads to train the model with.
    window: int
        Maximum distance over which word vectors influence each other.
    dm_concat: int
        Whether to concatenate word vectors or not.
        See paper for more detail.
    dm: int
        Model to use.
        0: Use distribute bag of words (DBOW).
        1: Use distributed memory (DM).
        2: Use both of the above with half the vector size and concatenate
        them.
    dbow_words: int
        Whether to train the word vectors using the skipgram method.
    """

    name = "doc2vec"
    label = "Doc2Vec"

    def __init__(self,
                 *args,
                 vector_size=40,
                 epochs=33,
                 min_count=1,
                 n_jobs=1,
                 window=7,
                 dm_concat=0,
                 dm=2,
                 dbow_words=0,
                 **kwargs):
        """Initialize the doc2vec model."""
        super(Doc2Vec, self).__init__(*args, **kwargs)
        self.vector_size = int(vector_size)
        self.epochs = int(epochs)
        self.min_count = int(min_count)
        self.n_jobs = int(n_jobs)
        self.window = int(window)
        self.dm_concat = int(dm_concat)
        self.dm = int(dm)
        self.dbow_words = int(dbow_words)
        self._model = None
        self._model_dm = None
        self._model_dbow = None

    def fit(self, texts):

        # check is gensim is available
        _check_gensim()

        model_param = {
            "vector_size": self.vector_size,
            "epochs": self.epochs,
            "min_count": self.min_count,
            "workers": self.n_jobs,
            "window": self.window,
            "dm_concat": self.dm_concat,
            "dbow_words": self.dbow_words,
        }

        corpus = [
            TaggedDocument(simple_preprocess(text), [i])
            for i, text in enumerate(texts)
        ]

        # If self.dm is 2, train both models and concatenate the feature
        # vectors later. Resulting vector size should be the same.
        if self.dm == 2:
            model_param["vector_size"] = int(model_param["vector_size"] / 2)
            self.model_dm = _train_model(corpus, **model_param, dm=1)
            self.model_dbow = _train_model(corpus, **model_param, dm=0)
        else:
            self.model = _train_model(corpus, **model_param, dm=self.dm)

    def transform(self, texts):

        # check is gensim is available
        _check_gensim()

        corpus = [
            TaggedDocument(simple_preprocess(text), [i])
            for i, text in enumerate(texts)
        ]

        if self.dm == 2:
            X_dm = _transform_text(self.model_dm, corpus)
            X_dbow = _transform_text(self.model_dbow, corpus)
            X = np.concatenate((X_dm, X_dbow), axis=1)
        else:
            X = _transform_text(self.model, corpus)
        return X

    def full_hyper_space(self):
        from hyperopt import hp
        eps = 1e-7

        hyper_space, hyper_choices = super(Doc2Vec, self).full_hyper_space()
        hyper_space.update({
            "fex_vector_size":
            hp.quniform("fex_vector_size", 31.5, 127.5 - eps, 8),
            "fex_epochs":
            hp.quniform("fex_epochs", 20, 50, 1),
            "fex_min_count":
            hp.quniform("fex_min_count", 0.5, 2.499999, 1),
            "fex_window":
            hp.quniform("fex_window", 4.5, 9.4999999, 1),
            "fex_dm_concat":
            hp.randint("fex_dm_concat", 2),
            "fex_dm":
            hp.randint("fex_dm", 3),
            "fex_dbow_words":
            hp.randint("fex_dbow_words", 2),
        })

        return hyper_space, hyper_choices
