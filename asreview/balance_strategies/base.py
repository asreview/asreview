from abc import ABC, abstractmethod

from asreview.utils import _unsafe_dict_update


class BaseTrainData(ABC):
    " Abstract class for balance strategies. "
    def __init__(self, balance_kwargs):
        self.balance_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.balance_kwargs,
                                                  balance_kwargs)

    def func_kwargs_descr(self):
        " Should give back the function and arguments for balancing. "
        return (self.__class__.function(), self.balance_kwargs,
                self.__class__.description())

    def default_kwargs(self):
        return {}

    def hyperopt_space(self):
        return {}

    @staticmethod
    @abstractmethod
    def function():
        raise NotImplementedError

    @staticmethod
    @abstractmethod
    def description():
        raise NotImplementedError
