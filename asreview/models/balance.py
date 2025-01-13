from sklearn.base import BaseEstimator
from sklearn.utils.class_weight import compute_sample_weight as _compute_sample_weight

__all__ = [
    "Balanced",
    "BalancedOptimal",
]


class Balanced(BaseEstimator):
    """Balanced sample weight

    Parameters
    ----------
    ratio: float
        The ratio of the number of samples in class 0 to the number of samples
        in class 1.

    """

    name = "balanced"
    label = "Balanced Sample Weight"

    def __init__(self, ratio=1.0):
        self.ratio = ratio

    def compute_sample_weight(self, y):
        if len(set(y)) != 2:
            raise ValueError("Only binary classification is supported.")

        weights = _compute_sample_weight(
            {1: 1.0, 0: sum(y == 1) / (self.ratio * sum(y == 0))}, y=y
        )
        return weights * (len(y) / sum(weights))


class BalancedOptimal(Balanced):
    """Balanced optimal sample weight"""

    name = "balanced_optimal"
    label = "Balanced Optimal Sample Weight"

    def __init__(self):
        super(BalancedOptimal, self).__init__(ratio=1.5)
