from sklearn.feature_extraction.text import TfidfVectorizer

from asreview.feature_extraction.base import BaseFeatureExtraction


class Tfidf(BaseFeatureExtraction):
    """Class to apply SKLearn Tf-idf to texts."""
    name = "tfidf"

    def __init__(self, *args, ngram_max=1, stop_words="english", **kwargs):
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
        if stop_words is None or stop_words.lower() == "none":
            sklearn_stop_words = None
        else:
            sklearn_stop_words = self.stop_words
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
        hyper_choices.update({
            "fex_stop_words": ["english", "none"]
        })
        hyper_space.update({
            "fex_ngram_max": hp.uniformint("fex_ngram_max", 1, 3),
            "fex_stop_words": hp.choice('fex_stop_words',
                                        hyper_choices["fex_stop_words"]),
        })
        return hyper_space, hyper_choices
