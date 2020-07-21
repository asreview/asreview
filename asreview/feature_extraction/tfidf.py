from sklearn.feature_extraction.text import TfidfVectorizer

from asreview.feature_extraction.base import BaseFeatureExtraction


class Tfidf(BaseFeatureExtraction):
    """Class to apply SKLearn Tf-idf to texts."""
    name = "tfidf"

    def __init__(self, *args, ngram_max=1, stop_words=0, **kwargs):
        """Initialize tfidf class.

        Arguments
        ---------
        ngram_max: int
            Can use up to ngrams up to ngram_max. For example in the case of
            ngram_max=2, monograms and bigrams could be used.
        stop_words: int
            Use *ENGLISH* stop words.
        """
        super(Tfidf, self).__init__(*args, **kwargs)
        self.ngram_max = ngram_max
        self.stop_words = stop_words
        if stop_words == 1:
            sklearn_stop_words = 'english'
        else:
            sklearn_stop_words = None
        self._model = TfidfVectorizer(ngram_range=(1, ngram_max),
                                      stop_words=sklearn_stop_words)

    def fit(self, texts):
        self._model.fit(texts)

    def transform(self, texts):
        X = self._model.transform(texts).tocsr()
        return X

    def full_hyper_space(self):
        from hyperopt import hp

        hyper_space, hyper_choices = super(Tfidf, self).full_hyper_space()
        hyper_space.update({
            "fex_ngram_max": hp.uniformint("fex_ngram_max", 1, 3),
            "fex_stop_words": hp.randint("fex_stop_words", 2),
        })
        return hyper_space, hyper_choices
