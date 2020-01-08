import sys

import numpy as np

from asreview.unsupervised.base import BaseUnsupervised
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


class Doc2Vec(BaseUnsupervised):
    name = "doc2vec"

    def __init__(self, param={}):
        super(Doc2Vec, self).__init__(param)
        self.param = {key: int(value) for key, value in self.param.items()}
        self.model = None
        self.model_dm = None
        self.model_dbow = None

    def default_param(self):
        return {
            "vector_size": 40,
            "epochs": 33,
            "min_count": 1,
            "workers": 4,
            "window": 7,
            "dm_concat": 0,
            "dm": 2,
            "dbow_words": 0,
            # "alpha": ??
        }

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
