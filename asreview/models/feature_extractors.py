# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

from sklearn.base import BaseEstimator
from sklearn.base import TransformerMixin
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline

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
        return X[self.columns].fillna("").apply(lambda x: self.sep.join(x), axis=1)


class Tfidf(Pipeline):
    """TF-IDF feature extraction.

    Based on the sklearn implementation of the TF-IDF feature extraction
    sklearn.feature_extraction.text.TfidfVectorizer.

    Parameters
    ----------
    columns: list, default=["title", "abstract"]
        See TextMerger
    sep: str, default=" "
        See TextMerger
    lowercase: bool, default=True
        See ScikitLearn CountVectorizer
    stop_words: {'english'} or list or None, default=None
        See ScikitLearn CountVectorizer
    token_pattern: str or None, default=r"(?u)\\b\\w\\w+\\b"
        See ScikitLearn CountVectorizer
    ngram_range: tuple (min_n, max_n), default=(1,1)
        See ScikitLearn CountVectorizer
    max_df: float in range [0.0, 1.0] or int, default=1.0
        See ScikitLearn CountVectorizer
    min_df: float in range [0.0, 1.0] or int, default=1
        See ScikitLearn CountVectorizer
    max_features: int, default=None
        See ScikitLearn CountVectorizer
    vocabulary: Mapping or iterable, default=None
        See ScikitLearn CountVectorizer
    binary: bool, default=False
        See ScikitLearn CountVectorizer
    norm: {"l1", "l2"} or None, default="l2"
        See ScikitLearn CountVectorizer
    use_idf: bool, default=True
        See ScikitLearn CountVectorizer
    smooth_idf: bool, default=True
        See ScikitLearn CountVectorizer
    sublinear_tf: bool, default=False
        See ScikitLearn CountVectorizer
    **kwargs: dict
        See ScikitLearn CountVectorizer for additional parameters
    """

    name = "tfidf"
    label = "TF-IDF"

    def __init__(
        self,
        columns=["title", "abstract"],
        sep=" ",
        lowercase=True,
        stop_words=None,
        token_pattern=r"(?u)\b\w\w+\b",
        ngram_range=(1, 1),
        max_df=1.0,
        min_df=1,
        max_features=None,
        vocabulary=None,
        binary=False,
        norm="l2",
        use_idf=True,
        smooth_idf=True,
        sublinear_tf=False,
        **kwargs,
    ):
        self.columns = columns
        self.sep = sep
        self.lowercase = lowercase
        self.stop_words = stop_words
        self.token_pattern = token_pattern
        self.ngram_range = tuple(ngram_range)
        self.max_df = max_df
        self.min_df = min_df
        self.max_features = max_features
        self.vocabulary = vocabulary
        self.binary = binary
        self.norm = norm
        self.use_idf = use_idf
        self.smooth_idf = smooth_idf
        self.sublinear_tf = sublinear_tf
        super().__init__(
            [
                ("text_merger", TextMerger(columns=self.columns, sep=self.sep)),
                (
                    "tfidf",
                    TfidfVectorizer(
                        lowercase=self.lowercase,
                        stop_words=self.stop_words,
                        token_pattern=self.token_pattern,
                        ngram_range=self.ngram_range,
                        max_df=self.max_df,
                        min_df=self.min_df,
                        max_features=self.max_features,
                        vocabulary=self.vocabulary,
                        binary=self.binary,
                        norm=self.norm,
                        use_idf=self.use_idf,
                        smooth_idf=self.smooth_idf,
                        sublinear_tf=self.sublinear_tf,
                        **kwargs,
                    ),
                ),
            ]
        )


class OneHot(Pipeline):
    """One-hot feature extraction.

    Based on the sklearn implementation of the one-hot feature extraction
    sklearn.feature_extraction.text.CountVectorizer with binary=True.

    Parameters
    ----------
    columns: list, default=["title", "abstract"]
        See TextMerger
    sep: str, default=" "
        See TextMerger
    lowercase: bool, default=True
        See ScikitLearn CountVectorizer
    stop_words: {'english'} or list or None, default=None
        See ScikitLearn CountVectorizer
    token_pattern: str or None, default=r"(?u)\\b\\w\\w+\\b"
        See ScikitLearn CountVectorizer
    ngram_range: tuple (min_n, max_n), default=(1,1)
        See ScikitLearn CountVectorizer
    max_df: float in range [0.0, 1.0] or int, default=1.0
        See ScikitLearn CountVectorizer
    min_df: float in range [0.0, 1.0] or int, default=1
        See ScikitLearn CountVectorizer
    max_features: int, default=None
        See ScikitLearn CountVectorizer
    vocabulary: Mapping or iterable, default=None
        See ScikitLearn CountVectorizer
    **kwargs: dict
        See ScikitLearn CountVectorizer for additional parameters
    """

    name = "onehot"
    label = "OneHot"

    def __init__(
        self,
        columns=["title", "abstract"],
        sep=" ",
        lowercase=True,
        stop_words=None,
        token_pattern=r"(?u)\b\w\w+\b",
        ngram_range=(1, 1),
        max_df=1.0,
        min_df=1,
        max_features=None,
        vocabulary=None,
        **kwargs,
    ):
        self.columns = columns
        self.sep = sep
        self.lowercase = lowercase
        self.token_pattern = token_pattern
        self.stop_words = stop_words
        self.max_df = max_df
        self.min_df = min_df
        self.max_features = max_features
        self.ngram_range = tuple(ngram_range)
        self.vocabulary = vocabulary
        super().__init__(
            [
                ("text_merger", TextMerger(columns=self.columns, sep=self.sep)),
                (
                    "onehot",
                    CountVectorizer(
                        lowercase=self.lowercase,
                        token_pattern=self.token_pattern,
                        stop_words=self.stop_words,
                        max_df=self.max_df,
                        min_df=self.min_df,
                        max_features=self.max_features,
                        ngram_range=self.ngram_range,
                        vocabulary=self.vocabulary,
                        binary=True,
                        **kwargs,
                    ),
                ),
            ]
        )
