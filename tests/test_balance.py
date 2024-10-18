import numpy as np
import pytest

from asreview.models.balance.undersample import UndersampleBalance
from asreview.models.balance.double import DoubleBalance
from asreview.extensions import extensions
from asreview.extensions import load_extension

BALANCERS = ["undersample", "double"]


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
    assert len(extensions("models.balance")) >= 2


def test_undersample():
    # Test case 1: ratio = 1.0
    balance = UndersampleBalance(ratio=1.0, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5])
    y = np.array([1, 0, 1, 0, 1, 0])
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == len(labeled_idx)
    assert len(y_balance) == len(y)

    # Test case 2: ratio = 0.5
    balance = UndersampleBalance(ratio=0.5, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5, 6, 7])
    y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == 8  # 3 ones + 5 zeros
    assert len(y_balance) == 8
    assert sum(y_balance) == 3  # 3 ones

    # Test case 3: ratio = 0.25
    balance = UndersampleBalance(ratio=0.25, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    y = np.array([1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == 10  # 2 ones + 8 zeros
    assert len(y_balance) == 10
    assert sum(y_balance) == 2  # 2 ones

    # Test case 4: ratio = 0.0, edge case
    balance = UndersampleBalance(ratio=0.0, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5])
    y = np.array([1, 0, 1, 0, 1, 0])
    with pytest.raises(ValueError):
        balance.sample(labeled_idx, y)

    # Test case 5: ratio > 1.0
    balance = UndersampleBalance(ratio=2.0, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5])
    y = np.array([1, 1, 0, 0, 0, 0])
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == 3  # 2 ones + 1 zeros
    assert len(y_balance) == 3
    assert sum(y_balance) == 2  # 2 ones

    # Test case 6: ratio = 10.0, edge case
    balance = UndersampleBalance(ratio=10.0, random_state=535)
    labeled_idx = np.array([0, 1, 2, 3, 4, 5])
    y = np.array([1, 0, 1, 0, 1, 0])
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == 4  # 3 ones + 1 zeros
    assert len(y_balance) == 4
    assert sum(y_balance) == 3  # 3 ones


def test_double():
    y = np.array([0, 1, 0, 1, 0, 0, 0, 0])
    labeled_idx = np.arange(len(y))

    balance = DoubleBalance(random_state=535)
    idx_balance, y_balance = balance.sample(labeled_idx, y)
    assert len(idx_balance) == len(labeled_idx)
    assert len(y_balance) == len(y)

    assert np.sum(y_balance) >= 1
    assert np.sum(y_balance) < len(y_balance)
    assert len(y_balance) <= len(y)


def test_double_permutation():
    rn = np.random.RandomState(535)

    for _ in range(1000):
        y = np.append(np.zeros(rn.randint(1, 100)), np.ones(rn.randint(1, 100)))
        rn.shuffle(y)
        labeled_idx = np.arange(len(y))

        balance = DoubleBalance(
            a=rn.rand() * 10,
            alpha=rn.rand() * 10,
            b=rn.rand() * 10,
            beta=rn.rand() * 10,
            random_state=535,
        )
        idx_balance, y_balance = balance.sample(labeled_idx, y)
        assert len(idx_balance) == len(labeled_idx)
        assert len(y_balance) == len(y)

        # Check if the number of ones is between 1 and len(y_balance) - 1
        assert np.sum(y_balance) >= 1
        assert np.sum(y_balance) < len(y_balance)
        assert len(y_balance) <= len(y)
