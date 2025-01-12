# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer

__all__ = ["Tfidf", "OneHot"]


class TextMerger(TransformerMixin, BaseEstimator):
    """Merge text columns into a single column.

    Merge multiple columns into a single column. This can be useful when
    multiple columns contain text information that should be combined.

    Parameters
    ----------
    columns: list
        List of columns to merge.
    sep: str
        Separator to use when merging the columns.
    """

    def __init__(self, columns, sep=" "):
        self.columns = columns
        self.sep = sep

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[self.columns].apply(lambda x: self.sep.join(x), axis=1)


class Tfidf(Pipeline):
    """TF-IDF feature extraction technique (``tfidf``).

    Use the standard TF-IDF (Term Frequency-Inverse Document Frequency) feature
    extraction technique from `SKLearn <https://scikit-learn.org/stable/modules/
    generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`__. Gives a
    sparse matrix as output. Works well in combination with
    :class:`asreview.models.classifiers.NaiveBayesClassifier` and other fast
    training models (given that the features vectors are relatively wide).

    Parameters
    ----------
    stop_words: str
        When set to 'english', use stopwords. If set to None or 'none',
        do not use stop words.
    """

    name = "tfidf"
    label = "TF-IDF"

    def __init__(self, stop_words="english", **kwargs):
        self.stop_words = stop_words
        super().__init__(
            [
                ("text_merger", TextMerger(columns=["title", "abstract"])),
                ("tfidf", TfidfVectorizer(stop_words=stop_words, **kwargs)),
            ]
        )


class OneHot(Pipeline):
    """OneHot feature extraction technique (``onehot``).

    Use the standard OneHot feature extraction technique from `SKLearn
    <https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html>`__.

    Parameters
    ----------
    lowercase: bool
        Convert all characters to lowercase before tokenizing.
    max_df: float
        When building the vocabulary ignore terms that have a document
        frequency strictly higher than the given threshold.
    min_df: int
        When building the vocabulary ignore terms that have a document
        frequency strictly lower than the given threshold.
        If float, the parameter represents a proportion of documents, integer
        absolute counts.
    """

    name = "onehot"
    label = "OneHot"

    def __init__(
        self,
        max_df=0.9,
        min_df=0.05,
        ngram_range=(1, 3),
        **kwargs,
    ):
        self.max_df = max_df
        self.min_df = min_df
        self.ngram_range = ngram_range

        super().__init__(
            [
                ("text_merger", TextMerger(columns=["title", "abstract"])),
                (
                    "onehot",
                    CountVectorizer(
                        max_df=max_df,
                        min_df=min_df,
                        ngram_range=ngram_range,
                        **kwargs,
                    ),
                ),
            ]
        )
