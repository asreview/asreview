import logging

from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from abc import ABC, abstractmethod
from asreview.utils import _unsafe_dict_update


def create_nb_model():
    """Return callable NaiveBayes model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """

    model = MultinomialNB()
    logging.debug(model)

    return model


def create_svc_model(*args, gamma="scale", class_weight=None, **kwargs):
    """Return callable SVM model.

    Arguments
    ---------

    Returns
    -------
    callable:
        A function that return the Sklearn model when
        called.

    """
    if class_weight is not None:
        class_weight = {
            0: 1,
            1: class_weight,
        }

    model = SVC(*args, gamma=gamma, class_weight=class_weight, probability=True, **kwargs)
    logging.debug(model)

    return model


class BaseModel(ABC):
    def __init__(self, model_kwargs):
        self.name = "base"
        self.model_kwargs = self.default_kwargs()
        self.model_kwargs = _unsafe_dict_update(self.model_kwargs, model_kwargs)

    def model_kwargs(self):
        return self.model(), self.model_kwargs

    @abstractmethod
    def model(self):
        raise NotImplementedError

    def default_kwargs(self):
        return {}

    def full_hyper_space(self):
        return {}, {}

    def hyper_space(self, exclude=[], **kwargs):
        from hyperopt import hp
        hyper_space, hyper_choices = self.full_hyper_space()

        for hyper_par in exclude:
            hyper_space.pop(self._full(hyper_par), None)
            hyper_choices.pop(self._full(hyper_par), None)

        for hyper_par in kwargs:
            full_hyper = self._full(hyper_par)
            hyper_val = kwargs[hyper_par]
            hyper_space[full_hyper] = hp.choice(full_hyper, [hyper_val])
            hyper_choices[full_hyper] = [hyper_val]
        return hyper_space, hyper_choices

    def _full(self, par):
        return "mdl_" + par

    def _small(self, par):
        return par[4:]


class SVCModel(BaseModel):
    def __init__(self, model_kwargs={}):
        super(SVCModel, self).__init__(model_kwargs)
        self.name = "svm"

    def model(self, *args, **kwargs):
        model = create_svc_model(*args, **self.model_kwargs, **kwargs)
        return model

    def default_kwargs(self):
        kwargs = {
            "gamma": "auto",
            "class_weight": 0.249,
            "C": 15.4,
            "kernel": "sigmoid",
        }
        return kwargs

    def full_hyper_space(self):
        from hyperopt import hp
        hyper_choices = {
            "mdl_gamma": ["auto", "scale"],
            "mdl_kernel": ["linear", "sigmoid", "rbf", "poly"]
        }

        hyper_space = {
            "mdl_gamma": hp.choice('mdl_gamma', hyper_choices["mdl_gamma"]),
            "mdl_kernel": hp.choice('mdl_kernel', hyper_choices["mdl_kernel"]),
            "mdl_C": hp.lognormal('mdl_C', 0, 2),
            "mdl_class_weight": hp.lognormal('mdl_class_weight', 0, 1)
        }
        return hyper_space, hyper_choices
