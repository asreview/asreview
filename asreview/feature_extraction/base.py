from abc import ABC, abstractmethod
import inspect

import numpy as np
from scipy.sparse import issparse, hstack


class BaseFeatureExtraction(ABC):
    """Base class for feature extraction methods."""
    name = "base"

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
                return hstack([X_titles, X_abstracts])
            return np.concatenate((X_titles, X_abstracts), axis=1)
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
        return {}, {}

    def hyper_space(self):
        hyper_space, hyper_choices = self.full_hyper_space()
        ex_hyper_space, ex_hyper_choices = self.extra_hyper_space()
        hyper_space.update(ex_hyper_space)
        hyper_choices.update(ex_hyper_choices)

        for par_name in self.const_param:
            hyper_space.pop(self._full(par_name), None)
            hyper_choices.pop(self._full(par_name), None)
        return hyper_space, hyper_choices

    def extra_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {}
        hyper_space = {
            "fex_split_ta": hp.randint("fex_split_ta", 2),
        }
        return hyper_space, hyper_choices

    def _full(self, par_name):
        return "fex_" + par_name

    @property
    def default_param(self):
        """Get the default parameters of the feature extraction.

        Returns
        -------
        dict:
            Dictionary with parameter: default_value
        """
        signature = inspect.signature(self.__init__)
        return {
            k: v.default
            for k, v in signature.parameters.items()
            if v.default is not inspect.Parameter.empty
        }
