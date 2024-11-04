import numpy as np
from numpy.testing import assert_almost_equal
import pytest

from asreview.metrics import loss


@pytest.mark.parametrize(
    "labels, expected_value",
    [
        ([1, 0], 0),
        ([0, 1], 1),
        ([1, 1, 0, 0, 0], 0),
        ([0, 0, 0, 1, 1], 1),
        ([1, 0, 1], 0.5),
        (
            [
                0,
                1,
                0,
                0,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                0,
                1,
                1,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                0,
                1,
                0,
                1,
                0,
                1,
                0,
                0,
                1,
                1,
            ],
            0.5583333333333333,
        ),
    ],
)
def test_loss_value_function(labels, expected_value):
    loss_value = loss(labels)
    assert_almost_equal(loss_value, expected_value)


@pytest.mark.parametrize(
    "labels",
    [[0, 0, 0], [0], [1]],
)
def test_loss_value_error_cases(labels):
    with pytest.raises(ValueError):
        loss(labels)


def test_random_loss_values():
    np.random.seed(42)
    for _ in range(100):
        length = np.random.randint(2, 100)
        labels = np.random.randint(0, 2, length)

        # Ensure labels are not all 0 or all 1
        if np.all(labels == 0) or np.all(labels == 1):
            labels[np.random.randint(0, length)] = 1 - labels[0]

        loss_value = loss(labels)
        assert 0 <= loss_value <= 1
