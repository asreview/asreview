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
    """

    name = "tfidf"
    label = "TF-IDF"

    def __init__(
        self,
        columns=["title", "abstract"],
        sep=" ",
        input="content",
        encoding="utf-8",
        decode_error="strict",
        strip_accents=None,
        lowercase=True,
        preprocessor=None,
        tokenizer=None,
        analyzer="word",
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
        self.input = input
        self.encoding = encoding
        self.decode_error = decode_error
        self.strip_accents = strip_accents
        self.lowercase = lowercase
        self.preprocessor = preprocessor
        self.tokenizer = tokenizer
        self.analyzer = analyzer
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
                        input=self.input,
                        encoding=self.encoding,
                        decode_error=self.decode_error,
                        strip_accents=self.strip_accents,
                        lowercase=self.lowercase,
                        preprocessor=self.preprocessor,
                        tokenizer=self.tokenizer,
                        analyzer=self.analyzer,
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
    """

    name = "onehot"
    label = "OneHot"

    def __init__(
        self,
        columns=["title", "abstract"],
        sep=" ",
        input="content",
        encoding="utf-8",
        decode_error="strict",
        strip_accents=None,
        lowercase=True,
        preprocessor=None,
        tokenizer=None,
        stop_words=None,
        token_pattern=r"(?u)\b\w\w+\b",
        ngram_range=(1, 1),
        analyzer="word",
        max_df=1.0,
        min_df=1,
        max_features=None,
        vocabulary=None,
        binary=True,
        **kwargs,
    ):
        self.columns = columns
        self.sep = sep

        self.input = input
        self.encoding = encoding
        self.decode_error = decode_error
        self.strip_accents = strip_accents
        self.preprocessor = preprocessor
        self.tokenizer = tokenizer
        self.analyzer = analyzer
        self.lowercase = lowercase
        self.token_pattern = token_pattern
        self.stop_words = stop_words
        self.max_df = max_df
        self.min_df = min_df
        self.max_features = max_features
        self.ngram_range = tuple(ngram_range)
        self.vocabulary = vocabulary
        self.binary = binary
        super().__init__(
            [
                ("text_merger", TextMerger(columns=self.columns, sep=self.sep)),
                (
                    "onehot",
                    CountVectorizer(
                        input=self.input,
                        encoding=self.encoding,
                        decode_error=self.decode_error,
                        strip_accents=self.strip_accents,
                        preprocessor=self.preprocessor,
                        tokenizer=self.tokenizer,
                        analyzer=self.analyzer,
                        lowercase=self.lowercase,
                        token_pattern=self.token_pattern,
                        stop_words=self.stop_words,
                        max_df=self.max_df,
                        min_df=self.min_df,
                        max_features=self.max_features,
                        ngram_range=self.ngram_range,
                        vocabulary=self.vocabulary,
                        binary=self.binary,
                        **kwargs,
                    ),
                ),
            ]
        )
