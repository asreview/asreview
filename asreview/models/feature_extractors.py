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

    def __init__(self, **kwargs):
        if "ngram_range" in kwargs:
            kwargs["ngram_range"] = tuple(kwargs["ngram_range"])

        super().__init__(
            [
                ("text_merger", TextMerger(columns=["title", "abstract"])),
                ("tfidf", TfidfVectorizer(**kwargs)),
            ]
        )


class OneHot(Pipeline):
    """One-hot feature extraction.

    Based on the sklearn implementation of the one-hot feature extraction
    sklearn.feature_extraction.text.CountVectorizer with binary=True.
    """

    name = "onehot"
    label = "OneHot"

    def __init__(self, **kwargs):
        super().__init__(
            [
                ("text_merger", TextMerger(columns=["title", "abstract"])),
                ("onehot", CountVectorizer(binary=True, **kwargs)),
            ]
        )
