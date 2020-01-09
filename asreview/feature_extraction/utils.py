# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

from asreview.feature_extraction.doc2vec import Doc2Vec
from asreview.feature_extraction.tfidf import Tfidf
from asreview.feature_extraction.sbert import SBERT
from asreview.feature_extraction.embedding_idf import EmbeddingIdf


def get_unsupervised_class(method):
    models = {
        "doc2vec": Doc2Vec,
        "tfidf": Tfidf,
        "sbert": SBERT,
        "embedding-idf": EmbeddingIdf
    }
    try:
        return models[method]
    except KeyError:
        raise ValueError(f"Unsupervised method '{method}' does not exist.")


def get_feature_model(method, *args, **kwargs):
    model_class = get_unsupervised_class(method)
    return model_class(*args, **kwargs)
