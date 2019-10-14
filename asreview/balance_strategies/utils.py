from asreview.balance_strategies.full_sampling import FullSampleTD
from asreview.balance_strategies.triple_balance import TripleBalanceTD
from asreview.balance_strategies.undersampling import UndersampleTD


def get_balance_strategy(settings):
    """ Function to get data rebalancing method. """

    method = getattr(settings, "balance_strategy", "simple")
    settings.balance_strategy = method
    if method == "simple":
        td_obj = FullSampleTD(settings.balance_param)
        td_string = "all training data"
    elif method == "triple_balance":
        td_obj = TripleBalanceTD(
            settings.balance_param, settings.fit_kwargs, settings.query_kwargs)
        td_string = "triple balanced (max,rand) training data"
    elif method in ["undersample", "undersampling"]:
        td_obj = UndersampleTD(settings.balance_param)
        td_string = "undersampled training data"
    else:
        raise ValueError(f"Training data method {method} not found")
    func, settings.balance_kwargs = td_obj.func_kwargs()
    return func, td_string


def get_balance_class(method):
    if method in ["simple", "full"]:
        return FullSampleTD
    if method in ["triple", "triple_balance"]:
        return TripleBalanceTD
    if method in ["undersample", "undersampling"]:
        return UndersampleTD
