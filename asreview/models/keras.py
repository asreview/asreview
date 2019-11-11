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

import logging
import time
from pathlib import Path

from tensorflow.keras import optimizers

from asreview.models.base import BaseModel
from asreview.models.embedding import download_embedding
from asreview.models.embedding import EMBEDDING_EN
from asreview.models.embedding import load_embedding
from asreview.models.embedding import sample_embedding
from asreview.utils import get_data_home
from asreview.utils import text_to_features
from asreview.utils import _set_class_weight


def _get_optimizer(optimizer, lr_mult=1.0):
    "Get optimizer with correct learning rate."
    if optimizer == "sgd":
        return optimizers.SGD(lr=0.01*lr_mult)
    elif optimizer == "rmsprop":
        return optimizers.RMSprop(lr=0.001*lr_mult)
    elif optimizer == "adagrad":
        return optimizers.Adagrad(lr=0.01*lr_mult)
    elif optimizer == "adam":
        return optimizers.Adam(lr=0.001*lr_mult)
    elif optimizer == "nadam":
        return optimizers.Nadam(lr=0.002*lr_mult)
    raise NotImplementedError


class KerasModel(BaseModel):
    "Base Keras model."
    def __init__(self, param={}, embedding_fp=None, **kwargs):
        super(KerasModel, self).__init__(param)
        self.name = "keras"

        self.embedding_fp = embedding_fp
        self.embedding_matrix = None
        self.word_index = None

    def get_Xy(self, texts, labels):
        self.X, self.word_index = text_to_features(texts)
        self.y = labels
        return self.X, self.y

    def fit_kwargs(self):
        fit_kwargs = self.fit_param()
        class_weight_inc = fit_kwargs.pop('class_weight_inc', None)
        if class_weight_inc is not None:
            fit_kwargs['class_weight'] = _set_class_weight(class_weight_inc)
        return fit_kwargs

    def get_embedding_matrix(self):
        if self.embedding_matrix is not None:
            return self.embedding_matrix

        if self.word_index is None:
            self.get_Xy()

        if self.embedding_fp is None:
            self.embedding_fp = Path(
                get_data_home(),
                EMBEDDING_EN["name"]
            ).expanduser()

            if not self.embedding_fp.exists():
                print("Warning: will start to download large "
                      "embedding file in 10 seconds.")
                time.sleep(10)
                download_embedding()

        # create features and labels
        logging.info("Loading embedding matrix. "
                     "This can take several minutes.")
        embedding = load_embedding(self.embedding_fp,
                                   word_index=self.word_index)
        self.embedding_matrix = sample_embedding(embedding, self.word_index)
        return self.embedding_matrix
