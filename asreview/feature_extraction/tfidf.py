from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import CountVectorizer

from asreview.feature_extraction.base import BaseFeatureExtraction


class Tfidf(BaseFeatureExtraction):
    """Class to apply TF-IDF to texts.

    Use the standard TF-IDF (Term Frequency-Inverse Document Frequency)
    feature extraction from `SKLearn <https://scikit-learn.org/stable/modules/
    generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`__. Gives
    a sparse matrix as output. Works well in combination with
    :class:`asreview.models.NBModel` and other fast training models (given
    that the features vectors are relatively wide).

    Arguments
    ---------
    ngram_max: int
        Can use up to ngrams up to ngram_max. For example in the case of
        ngram_max=2, monograms and bigrams could be used.
    """
    name = "tfidf"

    def __init__(self, *args, ngram_max=1, **kwargs):
        """Initialize tfidf class."""
        super(Tfidf, self).__init__(*args, **kwargs)
        self.ngram_max = ngram_max
        self._model = Pipeline([('vect',
                                 CountVectorizer(ngram_range=(1, ngram_max))),
                                ('tfidf', TfidfTransformer())])

    def fit(self, texts):
        self._model.fit(texts)

    def transform(self, texts):
        X = self._model.transform(texts).tocsr()
        return X

    def full_hyper_space(self):
        from hyperopt import hp

        hyper_space, hyper_choices = super(Tfidf, self).full_hyper_space()
        hyper_space.update(
            {"fex_ngram_max": hp.uniformint("fex_ngram_max", 1, 3)})
        return hyper_space, hyper_choices
