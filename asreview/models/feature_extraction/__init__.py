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

"""Feature extraction converts texts into features.

Feature extraction is the process of converting a list of texts into some kind
of feature matrix.

There are several feature extraction algorithms available. In configuration
files, parameters are found under the section ``[feature_param]``.

"""

from . import base
from . import embedding_lstm
from . import tfidf
from .utils import get_feature_model
from .utils import list_feature_extraction
from .doc2vec import Doc2Vec
from .embedding_idf import EmbeddingIdf
from .embedding_lstm import EmbeddingLSTM
from .sbert import SBERT
from .tfidf import Tfidf
from .utils import get_feature_class
from .utils import get_feature_model
from .utils import list_feature_extraction


__all__ = [
    "base",
    "embedding_lstm",
    "get_feature_model",
    "list_feature_extraction",
    "tfidf",
    "Doc2Vec",
    "EmbeddingIdf",
    "EmbeddingLSTM",
    "SBERT",
    "Tfidf",
    "get_feature_class",
    "get_feature_model",
    "list_feature_extraction",
    "utils",
    "doc2vec",
    "embedding_idf",
    "sbert"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
del _item
