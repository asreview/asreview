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

__all__ = ["SBERT"]

try:
    from sentence_transformers import models
    from sentence_transformers.SentenceTransformer import SentenceTransformer
except ImportError:
    ST_AVAILABLE = False
else:
    ST_AVAILABLE = True

from asreview.models.feature_extraction.base import BaseFeatureExtraction


def _check_st():
    if not ST_AVAILABLE:
        raise ImportError("Install sentence-transformers package to use Sentence BERT.")


class SBERT(BaseFeatureExtraction):
    """Sentence BERT feature extraction technique (``sbert``).

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
        to be installed. Use ``pip install asreview[sentence_transformers]`` or install
        all optional ASReview dependencies with ``pip install asreview[all]``
        to install the package.

    Parameters
    ----------
    transformer_model : str, optional
        The transformer model to use.
        Default: 'all-mpnet-base-v2'
    is_pretrained_SBERT: boolean, optional
        Default: True
    pooling_mode: str, optional
        Pooling mode to get sentence embeddings from word embeddings
        Default: 'mean'
        Other options available are 'mean', 'max' and 'cls'.
        Only used if is_pretrained_SBERT=False
        mean: Uses mean pooling of word embeddings
        max: Uses max pooling of word embeddings
        cls: Uses embeddings of [CLS] token as sentence embeddings
    """

    name = "sbert"
    label = "Sentence BERT"

    def __init__(
        self,
        *args,
        transformer_model="all-mpnet-base-v2",
        is_pretrained_sbert=True,
        pooling_mode="mean",
        **kwargs
    ):
        super(SBERT, self).__init__(*args, **kwargs)
        self.transformer_model = transformer_model
        self.is_pretrained_sbert = is_pretrained_sbert
        self.pooling_mode = pooling_mode

    def transform(self, texts):
        _check_st()

        if self.is_pretrained_sbert:
            model = SentenceTransformer(self.transformer_model)
        else:
            # If transformer_model is not a pretrained sentence transformer model,
            # add a pooling layer to get the pooled sentence embeddings from the
            # word embeddings
            word_embedding_model = models.Transformer(self.transformer_model)
            pooling_layer = models.Pooling(
                word_embedding_model.get_word_embedding_dimension(),
                pooling_mode=self.pooling_mode,
            )
            model = SentenceTransformer(modules=[word_embedding_model, pooling_layer])
        print("Encoding texts using sbert, this may take a while...")
        X = model.encode(texts, show_progress_bar=True)

        return X
