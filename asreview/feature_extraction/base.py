from abc import ABC, abstractmethod
import inspect


class BaseFeatureExtraction(ABC):
    name = "base"

    def fit_transform(self, texts):
        self.fit(texts)
        return self.transform(texts)

    def fit(self, texts):
        pass

    @abstractmethod
    def transform(self, texts):
        raise NotImplementedError

    def full_hyper_space(self):
        return {}, {}

    def hyper_space(self):
        hyper_space, hyper_choices = self.full_hyper_space()
        for par_name in self.const_param:
            hyper_space.pop(self._full(par_name), None)
            hyper_choices.pop(self._full(par_name), None)
        return hyper_space, hyper_choices

    def _full(self, par_name):
        return "fex_" + par_name

    @property
    def default_param(self):
        signature = inspect.signature(self.__init__)
        return {
            k: v.default
            for k, v in signature.parameters.items()
            if v.default is not inspect.Parameter.empty
        }
