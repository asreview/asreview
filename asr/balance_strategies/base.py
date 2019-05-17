from abc import ABC, abstractmethod
from asr.utils import _unsafe_dict_update


def get_balance_strategy(settings):
    """ Function to get data rebalancing method. """

    from asr.balance_strategies import FullSampleTD
    from asr.balance_strategies import TripleBalanceTD
    from asr.balance_strategies import UndersampleTD

    method = settings.get("train_data_fn", "simple")
    settings["train_data_fn"] = method
    if method == "simple":
        td_obj = FullSampleTD(settings['balance_param'])
        td_string = "all training data"
    elif method == "triple_balance":
        td_obj = TripleBalanceTD(
            settings['balance_param'], settings['fit_kwargs'],
            settings['query_kwargs'])
        td_string = "triple balanced (max,rand) training data"
    elif method in ["undersample", "undersampling"]:
        td_obj = UndersampleTD(settings['balance_param'])
        td_string = "undersampled training data"
    else:
        raise ValueError(f"Training data method {method} not found")
    func, settings['balance_kwargs'] = td_obj.func_kwargs()
    return func, td_string


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
