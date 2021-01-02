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

from abc import abstractmethod

import numpy as np
from scipy.sparse import issparse, hstack
from asreview.models.base import BaseModel


class BaseFeatureExtraction(BaseModel):
    """Base class for feature extraction methods."""
    name = "base-feature"

    def __init__(self, split_ta=0, use_keywords=0):
        self.split_ta = split_ta
        self.use_keywords = use_keywords

    def fit_transform(self, texts, titles=None, abstracts=None, keywords=None):
        """Fit and transform a list of texts.

        Arguments
        ---------
        texts: numpy.ndarray
            A sequence of texts to be transformed. They are not yet tokenized.

        Returns
        -------
        numpy.ndarray
            Feature matrix representing the texts.
        """
        self.fit(texts)
        if self.split_ta > 0:
            if titles is None or abstracts is None:
                raise ValueError("Error: if splitting titles and abstracts,"
                                 " supply them!")
            X_titles = self.transform(titles)
            X_abstracts = self.transform(abstracts)
            if issparse(X_titles) and issparse(X_abstracts):
                X = hstack([X_titles, X_abstracts]).tocsr()
            else:
                X = np.concatenate((X_titles, X_abstracts), axis=1)
        else:
            X = self.transform(texts)

        if self.use_keywords and keywords is not None:
            join_keys = np.array([" ".join(key) for key in keywords])
            X_keywords = self.transform(join_keys)
            if issparse(X_keywords):
                X = hstack([X, X_keywords]).tocsr()
            else:
                X = np.concatenate((X, X_keywords), axis=1)

        return X

    def fit(self, texts):
        """Fit the model to the texts.

        It is not always necessary to implement this if there's not real
        fitting being done.

        Arguments
        ---------
        texts: numpy.ndarray
            Texts to be fitted.
        """
        pass

    @abstractmethod
    def transform(self, texts):
        """Transform a list of texts.

        Arguments
        ---------
        texts: numpy.ndarray
            A sequence of texts to be transformed. They are not yet tokenized.

        Returns
        -------
        numpy.ndarray
            Feature matrix representing the texts.
        """
        raise NotImplementedError

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "fex_split_ta": hp.randint("fex_split_ta", 2),
            "fex_use_keywords": hp.randint("fex_use_keywords", 2),
        }
        return hyper_space, hyper_choices
