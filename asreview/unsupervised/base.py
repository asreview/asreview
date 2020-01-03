from abc import ABC, abstractmethod


class BaseUnsupervised(ABC):
    name = "base"

    def __init__(self, param={}):
        self.param = self.default_param()
        self.param.update(param)
        self.const_param = list(param)

    @abstractmethod
    def fit_transform(self, texts):
        raise NotImplementedError

    def default_param(self):
        return {}

    def full_hyper_space(self):
        return {}, {}

    def hyper_space(self):
        hyper_space, hyper_choices = self.full_hyper_space()
        for par_name in self.const_param:
            hyper_space.pop(self._full(par_name), None)
            hyper_choices.pop(self._full(par_name), None)
        return hyper_space, hyper_choices

    def _full(self, par_name):
        return "usp_" + par_name
