from abc import ABC, abstractmethod

from asreview.utils import _unsafe_dict_update


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
