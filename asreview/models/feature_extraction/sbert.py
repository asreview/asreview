# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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
            "Install sentence-transformers package"
            " to use Sentence BERT.")


class SBERT(BaseFeatureExtraction):
    """Sentence BERT feature extraction technique.

    By setting the ``transformer_model`` parameter, you can use other
    transformer models. For example, ``transformer_model='bert-base-nli-stsb-
    large'``. For a list of available models, see the `Sentence BERT
    documentation <https://huggingface.co/sentence-transformers>`__.

    Sentence BERT is a sentence embedding model that is trained on a large
    corpus of human written text. It is a fast and accurate model that can
    be used for many tasks.

    The huggingface library includes multilingual text classification models. If
    your dataset contains records with multiple languages, you can use the
    ``transformer_model`` parameter to select the model that is most suitable
    for your data.

    .. note::

        This feature extraction technique requires ``sentence_transformers``
        to be installed. Use ``pip install sentence_transformers`` or install
        all optional ASReview dependencies with ``pip install asreview[all]``
        to install the package.

    Parameters
    ----------
    transformer_model : str, optional
        The transformer model to use.
        Default: 'all-mpnet-base-v2'

    """

    name = "sbert"
    label = "Sentence BERT"

    def __init__(self, *args, transformer_model='all-mpnet-base-v2', **kwargs):
        super(SBERT, self).__init__(*args, **kwargs)
        self.transformer_model = transformer_model

    def transform(self, texts):

        _check_st()

        model = SentenceTransformer(self.transformer_model)
        X = np.array(model.encode(texts))
        return X
