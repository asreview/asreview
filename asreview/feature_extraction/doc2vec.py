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

import sys

import numpy as np

from asreview.feature_extraction.base import BaseFeatureExtraction
from copy import deepcopy


def train_model(corpus, param, dm=None):
    import gensim
    train_param = deepcopy(param)
    if dm is not None:
        train_param["dm"] = dm
        train_param["vector_size"] = int(train_param["vector_size"]/2)

    model = gensim.models.doc2vec.Doc2Vec(**train_param)
    model.build_vocab(corpus)
    model.train(corpus, total_examples=model.corpus_count,
                epochs=model.epochs)
    return model


def transform_text(model, corpus):
    X = []
    for doc_id in range(len(corpus)):
        doc_vec = model.infer_vector(corpus[doc_id].words)
        X.append(doc_vec)
    return np.array(X)


class Doc2Vec(BaseFeatureExtraction):
    name = "doc2vec"

    def __init__(self, vector_size=40, epochs=33, min_count=1, workers=1,
                 window=7, dm_concat=0, dm=2, dbow_words=0):
        super(Doc2Vec, self).__init__()
        self.vector_size = int(vector_size)
        self.epochs = int(epochs)
        self.min_count = int(min_count)
        self.workers = int(workers)
        self.window = int(window)
        self.dm_concat = dm_concat
        self.dm = dm
        self.dbow_words = dbow_words
        self.param = {key: int(value) for key, value in self.param.items()}
        self.model = None
        self.model_dm = None
        self.model_dbow = None

    def fit_transform(self, texts):
        try:
            from gensim.utils import simple_preprocess
            from gensim.models.doc2vec import TaggedDocument
        except ImportError:
            print("Error: install gensim package (`pip install gensim`) to use"
                  " doc2vec.")
            sys.exit(192)

        corpus = [TaggedDocument(simple_preprocess(text), [i])
                  for i, text in enumerate(texts)]

        model_type = self.param.get("dm", 1)
        X = []
        if model_type == 2:
            param = deepcopy(self.param)
            param["vector_size"] = int(self.param["vector_size"]/2)
            param["dm"] = 1
            model_dm = train_model(corpus, param)
            param["dm"] = 0
            model_dbow = train_model(corpus, param)
            for doc_id in range(len(corpus)):
                doc_vec_dm = model_dm.infer_vector(corpus[doc_id].words)
                doc_vec_dbow = model_dbow.infer_vector(corpus[doc_id].words)
                doc_vec = np.append(doc_vec_dm, doc_vec_dbow)
                X.append(doc_vec)

        else:
            model = train_model(corpus, self.param)
            for doc_id in range(len(corpus)):
                doc_vec = model.infer_vector(corpus[doc_id].words)
                X.append(doc_vec)
        return np.array(X)

    def fit(self, texts):
        try:
            from gensim.utils import simple_preprocess
            from gensim.models.doc2vec import TaggedDocument
        except ImportError:
            print("Error: install gensim package (`pip install gensim`) to use"
                  " doc2vec.")
            sys.exit(192)
        corpus = [TaggedDocument(simple_preprocess(text), [i])
                  for i, text in enumerate(texts)]

        model_type = self.param.get("dm", 1)
        if model_type == 2:
            self.model_dm = train_model(corpus, self.param, dm=1)
            self.model_dbow = train_model(corpus, self.param, dm=0)
        else:
            self.model = train_model(corpus, self.param)

    def transform(self, texts):
        try:
            from gensim.utils import simple_preprocess
            from gensim.models.doc2vec import TaggedDocument
        except ImportError:
            print("Error: install gensim package (`pip install gensim`) to use"
                  " doc2vec.")
            sys.exit(192)
        corpus = [TaggedDocument(simple_preprocess(text), [i])
                  for i, text in enumerate(texts)]
        model_type = self.param.get("dm", 1)
        if model_type == 2:
            X_dm = transform_text(self.model_dm, corpus)
            X_dbow = transform_text(self.model_dbow, corpus)
            X = np.concatenate((X_dm, X_dbow), axis=1)
        else:
            X = transform_text(self.model, corpus)
        return X

    def full_hyper_space(self):
        from hyperopt import hp
        eps = 1e-7
        hyper_choices = {}
        hyper_space = {
            "usp_vector_size": hp.quniform("usp_vector_size", 31.5, 127.5-eps, 8),
            "usp_epochs": hp.quniform("usp_epochs", 20, 50, 1),
            "usp_min_count": hp.quniform("usp_min_count", 0.5, 2.499999, 1),
            "usp_window": hp.quniform("usp_window", 4.5, 9.4999999, 1),
            "usp_dm_concat": hp.randint("usp_dm_concat", 2),
            "usp_dm": hp.randint("usp_dm", 3),
            "usp_dbow_words": hp.randint("usp_dbow_words", 2),
        }
        return hyper_space, hyper_choices
