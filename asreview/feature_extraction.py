# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from asreview.models.deprecated import _moved_warning

from asreview.models.feature_extraction.tfidf import Tfidf as _Tfidf
from asreview.models.feature_extraction.doc2vec import Doc2Vec as _Doc2Vec
from asreview.models.feature_extraction.embedding_idf \
    import EmbeddingIdf as _EmbeddingIdf
from asreview.models.feature_extraction.embedding_lstm \
    import EmbeddingLSTM as _EmbeddingLSTM
from asreview.models.feature_extraction.sbert import SBERT as _SBERT
from asreview.models.feature_extraction.utils \
    import get_feature_model as _get_feature_model
from asreview.models.feature_extraction.utils \
    import get_feature_class as _get_feature_class
from asreview.models.feature_extraction.utils \
    import list_feature_extraction as _list_feature_extraction

"""Deprecated, will be removed in version 1.0"""

Tfidf = _moved_warning(
    _Tfidf, "asreview.models.feature_extraction.Tfidf",
    "asreview.feature_extraction.Tfidf")
Doc2Vec = _moved_warning(
    _Doc2Vec, "asreview.models.feature_extraction.Doc2Vec",
    "asreview.feature_extraction.Doc2Vec")
EmbeddingIdf = _moved_warning(
    _EmbeddingIdf, "asreview.models.feature_extraction.EmbeddingIdf",
    "asreview.feature_extraction.EmbeddingIdf")
EmbeddingLSTM = _moved_warning(
    _EmbeddingLSTM, "asreview.models.feature_extraction.EmbeddingLSTM",
    "asreview.feature_extraction.EmbeddingLSTM")
SBERT = _moved_warning(
    _SBERT, "asreview.models.feature_extraction.SBERT",
    "asreview.feature_extraction.SBERT")
get_feature_model = _moved_warning(
    _get_feature_model, "asreview.models.feature_extraction.get_feature_model",
    "asreview.feature_extraction.get_feature_model")
get_feature_class = _moved_warning(
    _get_feature_class, "asreview.models.feature_extraction.get_feature_class",
    "asreview.feature_extraction.get_feature_class")
list_feature_extraction = _moved_warning(
    _list_feature_extraction,
    "asreview.models.feature_extraction.list_feature_extraction",
    "asreview.feature_extraction.list_feature_extraction")
