import numpy as np
import pytest
from sklearn.utils import compute_sample_weight

from asreview.extensions import extensions
from asreview.extensions import load_extension
from asreview.models.balance.balanced import Balanced

BALANCERS = ["balanced"]


def generate_labels(n_sample):
    rn = np.random.RandomState(535)
    n_sample_zero = int(n_sample / 2)
    n_sample_one = n_sample - n_sample_zero
    y = np.append(np.zeros(n_sample_zero), np.ones(n_sample_one))
    rn.shuffle(y)

    return y


@pytest.mark.parametrize("balance_strategy", BALANCERS)
def test_balance_model_name(balance_strategy):
    model = load_extension("models.balance", balance_strategy)()
    assert model.name == balance_strategy


@pytest.mark.parametrize("balance_strategy", BALANCERS)
def test_balance_param(balance_strategy):
    model = load_extension("models.balance", balance_strategy)()
    assert isinstance(model.param, dict)


def test_balance_general():
    assert len(extensions("models.balance")) >= 1


def test_balanced():
    y = np.random.randint(0, 2, 100)
    balancer = Balanced()
    # Check that ratio=1.0 gives the same as the 'balanced' setting of
    # `compute_sample_weight`.
    assert np.allclose(
        compute_sample_weight("balanced", y), balancer.compute_sample_weight(y)
    )

    for ratio in [0.25, 1, 5, 10]:
        balancer = Balanced(ratio=ratio)
        sample_weight = balancer.compute_sample_weight(y)
        # Check that the sample weight is normalized to the length of y.
        assert round(sum(sample_weight)) == len(y)
        # Check that (total weight 1's) / (total weight 0's) is equal to the ratio.
        assert sum(sample_weight[y == 1]) / sum(sample_weight[y == 0]) - ratio < 10 ** (
            -5
        )
