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

    The feature extractor takes in texts, and outputs a feature matrix. This class has
    a number of methods for doing that. Internally ASReview will always call
    `from_data_store`, which takes as input the data store containing cleaned records.
    It will get a sequence of texts from the data store by using the method `get_texts`,
    which will by default concatenate the `title` and `abstract` of each record. These
    texts are then passed to `fit_transform`, which will create the actual feature
    matrix.

    Attributes
    ----------
    name : str
        Name of the feature extraction method. This is the name that you can use in the
        CLI to call this feature extractor. Every custom feature extractor should
        overwrite it's value by a new, unique value.
    """

    name = "base"

    # The file extension that should be used when saving the feature matrix.
    __file_extension__ = "npz"

    # The columns from which feature data should be extracted.
    __default_columns__ = ["title", "abstract"]

    def get_texts(self, data_store, columns=None, join_char=" "):
        """Get a list of texts from a data store.

        Gets the texts from multiple columns and the columns using a join character.

        Parameters
        ----------
        data_store : asreview.data.DataStore
            Data store from which to get the record data.
        columns : list[str], optional
            Columns from which to use the text. If None, it will use the columns in
            `self.__default_columns__`. By default None.
        join_char : str, optional
            Character used to join texts from multiple columns into a single text.
            By default " ".

        Returns
        -------
        Iterable[str]
            For each record in the data store, the values at each of the columns,
            concatenated using the join character. So the default behavior is to
            concatenate the title and abstract of each record.
        """
        if columns is None:
            columns = self.__default_columns__
        current_texts = data_store[columns[0]]
        for column in columns[1:]:
            current_texts = current_texts + join_char + data_store[column]
        return current_texts

    def from_data_store(self, data_store):
        """Get a feature matrix from the data in the data store.

        Internally, ASReview will only call this method of the feature extractor. So if
        you want to create a custom feature extractor and plug it into ASReview, it is
        enough to override this method. However, `get_texts` and `fit_transform` provide
        some useful functionality that you may want to keep. In this case it could be
        better to override the `fit` and `transform` methods of the feature extractor.

        Parameters
        ----------
        data_store : asreview.data.DataStore
            Data store from which to get the record data.

        Returns
        -------
        numpy.ndarray or scipy.sparse.csr_matrix
            Feature matrix.
        """
        return self.fit_transform(self.get_texts(data_store))

    def fit_transform(self, *texts):
        """Fit the feature extractor and create a feature matrix.

        Parameters
        ----------
        texts: Iterable[str]
            One or more sequences of texts to be transformed into a single feature
            matrix.

        Returns
        -------
        numpy.ndarray or scipy.sparse.csr_matrix.
            Feature matrix. If multiple sequences of texts are provided as input, the
            feature extractor will be fit on the first sequence, then it will transform
            each individual sequence into a feature matrix, and finally these matrices
            are concatenated into a single output feature matrix.
        """
        if not texts:
            raise ValueError(
                "the arguments should contain at least one sequence of texts"
            )
        self.fit(texts[0])
        transformed_texts = [self.transform(text_list) for text_list in texts]
        if issparse(transformed_texts[0]):
            return hstack(transformed_texts).tocsr()
        else:
            return np.concatenate(transformed_texts, axis=1)

    def fit(self, texts):
        """Fit the feature extractor to a sequence of texts.

        If you  provide multiple sequences of texts as input to `fit_transform`, it will
        only run `fit` once on the first input sequence. It is not necessary to
        implement this method if the feature extractor requires no fitting.

        Parameters
        ----------
        texts: Iterable[str]
            Sequence of texts on which to fit the feature extractor.
        """
        pass

    @abstractmethod
    def transform(self, texts):
        """Create a feature matrix from a sequence of texts.

        Parameters
        ----------
        texts: Iterable[str]
            A sequence of texts to be transformed into a feature matrix.

        Returns
        -------
        numpy.ndarray or scipy.sparse.csr_matrix
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
