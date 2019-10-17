from abc import ABC, abstractmethod

from asreview.utils import _unsafe_dict_update


class BaseModel(ABC):
    def __init__(self, param):
        self.name = "base"
        self.param = _unsafe_dict_update(self.default_param(), param)

    def fit_param(self):
        fit_param = {x: self.param[x] for x in self.fit_param_names()}
        return fit_param

    def model_param(self):
        model_param = {x: self.param[x] for x in self.model_param_names()}
        return model_param

    def fit_kwargs(self):
        return self.fit_param()

    @abstractmethod
    def model(self):
        raise NotImplementedError

    def default_param(self):
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

    def model_param_names(self):
        return list(self.param.keys())

    def fit_param_names(self):
        return []
