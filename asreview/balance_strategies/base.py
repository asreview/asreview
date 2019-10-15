from abc import ABC
from abc import abstractmethod

from asreview.utils import _unsafe_dict_update


class BaseTrainData(ABC):
    " Abstract class for balance strategies. "
    def __init__(self, balance_kwargs):
        self.function = None
        self.balance_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.balance_kwargs,
                                                  balance_kwargs)

    def func_kwargs(self):
        " Should give back the function and arguments for balancing. "
        return self.function, self.balance_kwargs

    def default_kwargs(self):
        return {}

    def hyperopt_space(self):
        return {}
