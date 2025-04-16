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
from collections import defaultdict

__all__ = ["Tfidf", "OneHot"]


def _generate_param_to_step_map(pipeline: Pipeline):
    param_map = defaultdict(set)
    for full_key in pipeline.get_params(deep=True).keys():
        if "__" in full_key:
            step, param = full_key.split("__", 1)
            param_map[param].add(step)
    return {
        param: list(steps)[0] if len(steps) == 1 else list(steps)
        for param, steps in param_map.items()
    }


def _normalize_kwargs(kwargs: dict, param_map: dict):
    normalized_kwargs = {}
    for k, v in kwargs.items():
        if "__" in k:
            normalized_kwargs[k] = v
        elif k in param_map:
            step = param_map[k]
            normalized_kwargs[f"{step}__{k}"] = v
        else:
            normalized_kwargs[k] = v
    return normalized_kwargs


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
        super().__init__(
            [
                ("text_merger", TextMerger(columns=["title", "abstract"])),
                ("tfidf", TfidfVectorizer()),
            ]
        )
        param_map = _generate_param_to_step_map(self)
        self.set_params(**_normalize_kwargs(kwargs, param_map))


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
                ("onehot", CountVectorizer(binary=True)),
            ]
        )
        param_map = _generate_param_to_step_map(self)
        self.set_params(**_normalize_kwargs(kwargs, param_map))
