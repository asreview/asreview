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

__all__ = ["OneHot"]

from sklearn.feature_extraction.text import CountVectorizer

from asreview.models.feature_extraction.sklearn_adapter import SKLearnAdapter


class OneHot(SKLearnAdapter):
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
        lowercase=True,
        max_df=0.9,
        min_df=5,
        ngram_range=(1, 3),
        **kwargs,
    ):
        super().__init__(
            sklearn_model=CountVectorizer,
            lowercase=lowercase,
            max_df=max_df,
            min_df=min_df,
            ngram_range=ngram_range,
            **kwargs,
        )
