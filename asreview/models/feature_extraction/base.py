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

__all__ = ["BaseFeatureExtraction"]

from abc import abstractmethod
from pathlib import Path

import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse import hstack
from scipy.sparse import issparse
from scipy.sparse import load_npz
from scipy.sparse import save_npz

from asreview.models.base import BaseModel


class BaseFeatureExtraction(BaseModel):
    """Base class for feature extraction methods.

    Attributes
    ----------
    name : str
        Name of the feature extraction method.
    file_extension : str
        File extension that should be used when writing the feature matrix to a file.
    """

    name = "base-feature"
    file_extension = "npz"

    def __init__(self, split_ta=False, use_keywords=False):
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
        if self.split_ta:
            if titles is None or abstracts is None:
                raise ValueError(
                    "Error: if splitting titles and abstracts," " supply them!"
                )
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

    @staticmethod
    def read(fp):
        """Read a feature matrix from a filepath.

        Converts a feature matrix to sparse format and saves it at the given location.
        Feature extraction classes that need to save the feature matrix in a different
        format should override this method.

        Parameters
        ----------
        fp : str, Path
            Location where to save the feature matrix.
        feature_matrix : convertible to `scipy.sparse.csr_matrix`
            Feature matrix to save.

        Raises
        ------
        ValueError
            If the feature matrix is not convertible to `scipy.sparse.csr_matrix`
        """
        return load_npz(fp)

    @staticmethod
    def write(fp, feature_matrix):
        """Write a feature matrix to a filepath.

        Assumes the feature matrix is stored in scipy sparse format. Feature extraction
        methods that need to load different format matrices should override
        this method.

        Parameters
        ----------
        fp : str, Path
            Location from where to load the feature matrix.

        Returns
        -------
        scipy.sparse.csr_matrix
            Feature matrix in sparse format.
        """
        try:
            feature_matrix = csr_matrix(feature_matrix)
        except Exception as e:
            raise ValueError(
                "The feature matrix should be convertible to type "
                "scipy.sparse.csr.csr_matrix."
            ) from e
        save_npz(Path(fp), feature_matrix)
