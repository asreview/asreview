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

import numpy as np

try:
    from sentence_transformers.SentenceTransformer import SentenceTransformer  # noqa
except ImportError:
    ST_AVAILABLE = False
else:
    ST_AVAILABLE = True

from asreview.models.feature_extraction.base import BaseFeatureExtraction


def _check_st():
    if not ST_AVAILABLE:
        raise ImportError(
            "Install sentence_transformers package (`pip install "
            "sentence_transformers`) to use 'SBERT' model.")


class SBERT(BaseFeatureExtraction):
    """Sentence BERT class for feature extraction.

    Feature extraction method based on Sentence BERT. Implementation based on
    the `sentence_transformers <https://github.com/UKPLab/sentence-
    transformers>`__ package. It is relatively slow.

    .. note::

        This feature extraction algorithm requires ``sentence_transformers``
        to be installed. Use ``pip install sentence_transformers`` or install
        all optional ASReview dependencies with ``pip install asreview[all]``

    """

    name = "sbert"

    def transform(self, texts):

        _check_st()

        model = SentenceTransformer('bert-base-nli-mean-tokens')
        X = np.array(model.encode(texts))
        return X
