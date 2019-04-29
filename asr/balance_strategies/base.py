from abc import ABC, abstractmethod
from asr.utils import _unsafe_dict_update


class BaseTrainData(ABC):
    " Abstract class for balance strategies. "
    def __init__(self, balance_kwargs):
        self.balance_kwargs = self.default_kwargs()
        self.balance_kwargs = _unsafe_dict_update(self.balance_kwargs,
                                                  balance_kwargs)

    @abstractmethod
    def func_kwargs(self):
        " Should give back the function and arguments for balancing. "
        pass

    def default_kwargs(self):
        return {}
