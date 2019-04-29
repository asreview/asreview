from abc import ABC, abstractmethod
from asr.utils import _unsafe_dict_update


class BaseTrainData(ABC):
    def __init__(self, balance_kwargs):
        self.balance_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.balance_kwargs,
                                                  balance_kwargs)

    @abstractmethod
    def func_kwargs(self):
        pass

    def default_kwargs(self):
        return {}
