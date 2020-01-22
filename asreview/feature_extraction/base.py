from abc import abstractmethod

import numpy as np
from scipy.sparse import issparse, hstack
from asreview.base_model import BaseModel


class BaseFeatureExtraction(BaseModel):
    """Base class for feature extraction methods."""
    name = "base-feature"

    def __init__(self, split_ta=0):
        self.split_ta = split_ta

    def fit_transform(self, texts, titles=None, abstracts=None):
        """Fit and transform a list of texts.

        Arguments
        ---------
        texts: np.array
            A sequence of texts to be transformed. They are not yet tokenized.

        Returns
        -------
        np.array:
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
                X_merge = hstack([X_titles, X_abstracts]).tocsr()
            else:
                X_merge = np.concatenate((X_titles, X_abstracts), axis=1)
            return X_merge
        return self.transform(texts)

    def fit(self, texts):
        """Fit the model to the texts.


        It is not always necessary to implement this if there's not real
        fitting being done.

        Arguments
        ---------
        texts: np.array
            Texts to be fitted.
        """
        pass

    @abstractmethod
    def transform(self, texts):
        """Transform a list of texts.

        Arguments
        ---------
        texts: np.array
            A sequence of texts to be transformed. They are not yet tokenized.

        Returns
        -------
        np.array:
            Feature matrix representing the texts.
        """
        raise NotImplementedError

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "fex_split_ta": hp.randint("fex_split_ta", 2),
        }
        return hyper_space, hyper_choices
