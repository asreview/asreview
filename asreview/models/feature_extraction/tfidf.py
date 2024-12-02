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

__all__ = ["Tfidf"]

from sklearn.feature_extraction.text import TfidfVectorizer

from asreview.models.feature_extraction.sklearn_adapter import SKLearnAdapter


class Tfidf(SKLearnAdapter):
    """TF-IDF feature extraction technique (``tfidf``).

    Use the standard TF-IDF (Term Frequency-Inverse Document Frequency) feature
    extraction technique from `SKLearn <https://scikit-learn.org/stable/modules/
    generated/sklearn.feature_extraction.text.TfidfVectorizer.html>`__. Gives a
    sparse matrix as output. Works well in combination with
    :class:`asreview.models.classifiers.NaiveBayesClassifier` and other fast
    training models (given that the features vectors are relatively wide).

    Parameters
    ----------
    ngram_max: int
        Can use up to ngrams up to ngram_max. For example in the case of
        ngram_max=2, monograms and bigrams could be used.
    stop_words: str
        When set to 'english', use stopwords. If set to None or 'none',
        do not use stop words.
    """

    name = "tfidf"
    label = "TF-IDF"

    def __init__(self, stop_words="english", **kwargs):
        super().__init__(
            sklearn_model=TfidfVectorizer,
            stop_words=stop_words,
            **kwargs,
        )
