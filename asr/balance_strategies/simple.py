from asr.balance_strategies.base import BaseTrainData


def simple_td(X, y, train_idx):
    """
    Function that does not resample the training set.

    Arguments
    ---------
    X: np.array
        Complete matrix of all samples.
    y: np.array
        Classified results of all samples.
    extra_vars: dict:
        Extra variables that can be passed around between functions.

    Returns
    -------
    np.array:
        Training samples.
    np.array:
        Classification of training samples.
    """
    return X[train_idx], y[train_idx]


class SimpleTD(BaseTrainData):
    def __init__(self, balance_kwargs):
        super(SimpleTD, self).__init__(balance_kwargs)

    def func_kwargs(self):
        return simple_td, self.balance_kwargs
