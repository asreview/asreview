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


class VectorizerPipeline(Pipeline):
    """Base class for TF-IDF and OneHot feature extraction.

    This class provides a common structure for TF-IDF and OneHot extraction
    with support for text merging and vectorization.
    """

    name = None
    label = None

    def __init__(self, vectorizer_class, **kwargs):
        text_merger_params = {"columns": ["title", "abstract"]}
        vectorizer_params = {}

        for key, value in kwargs.items():
            if key.startswith("text_merger__"):
                text_merger_params[key.split("__", 1)[1]] = value
            elif key.startswith("vectorizer__"):
                vectorizer_params[key.split("__", 1)[1]] = value
            else:
                vectorizer_params[key] = value

        if "ngram_range" in vectorizer_params:
            vectorizer_params["ngram_range"] = tuple(vectorizer_params["ngram_range"])

        super().__init__(
            [
                ("text_merger", TextMerger(**text_merger_params)),
                ("vectorizer", vectorizer_class(**vectorizer_params)),
            ]
        )

    def get_params(self, deep=True, instances=False):
        """Get parameters for this pipeline.
        Parameters
        ----------
        deep: bool, default=True
            If True, will return the parameters for this pipeline and
            contained subobjects that are estimators.
        instances: bool, default=False
            If True, will return the instances of the estimators in the pipeline.
        """
        params = super().get_params(deep=deep)
        if not instances:
            params.pop("text_merger", None)
            params.pop("vectorizer", None)
            params.pop("vectorizer__dtype", None)
        return params


class Tfidf(VectorizerPipeline):
    """TF-IDF feature extraction.

    Based on the sklearn implementation of the TF-IDF feature extraction
    sklearn.feature_extraction.text.TfidfVectorizer.
    """

    name = "tfidf"
    label = "TF-IDF"

    def __init__(self, **kwargs):
        super().__init__(TfidfVectorizer, **kwargs)


class OneHot(VectorizerPipeline):
    """One-hot feature extraction.

    Based on the sklearn implementation of the one-hot feature extraction
    sklearn.feature_extraction.text.CountVectorizer with binary=True.
    """

    name = "onehot"
    label = "OneHot"

    def __init__(self, **kwargs):
        # Explicitly set binary=True for one-hot encoding
        if "vectorizer__binary" not in kwargs and "binary" not in kwargs:
            kwargs["binary"] = True
        super().__init__(CountVectorizer, **kwargs)
