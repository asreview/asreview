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

from asreview.models.feature_extraction.tfidf import Tfidf
from asreview.models.feature_extraction.doc2vec import Doc2Vec
from asreview.models.feature_extraction.embedding_idf import EmbeddingIdf
from asreview.models.feature_extraction.embedding_lstm import EmbeddingLSTM
from asreview.models.feature_extraction.sbert import SBERT

from asreview.models.feature_extraction.utils import get_feature_model
from asreview.models.feature_extraction.utils import get_feature_class
from asreview.models.feature_extraction.utils import list_feature_extraction

"""Feature extraction converts texts into features.

Feature extraction is the process of converting a list of texts into some kind
of feature matrix.

There are several feature extraction algorithms available. In configuration
files, parameters are found under the section ``[feature_param]``.

"""
