from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer

from asreview.unsupervised.base import BaseUnsupervised


class Tfidf(BaseUnsupervised):
    name = "tf-idf"

    def fit_transform(self, texts):
        text_clf = Pipeline([
            ('vect', CountVectorizer(ngram_range=(1, self.param["ngram_max"]))),
            ('tfidf', TfidfTransformer())]
        )

        X = text_clf.fit_transform(texts)
        return X

    def default_param(self):
        return {
            "ngram_max": 1
        }

    def full_hyper_space(self):
        from hyperopt import hp

        hyper_space = {
            "usp_ngram_max": 1 + hp.randint("usp_ngram_max", 2)
        }
        return hyper_space, {}
