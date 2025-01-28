import numpy as np
import pytest
from sklearn.utils import compute_sample_weight
from sklearn.utils.estimator_checks import check_estimator

from asreview.extensions import extensions
from asreview.extensions import load_extension
from asreview.models.balancers import Balanced


def test_balancers():
    assert len(extensions("models.balancers")) >= 1


@pytest.mark.parametrize("balancer", extensions("models.balancers"))
def test_balance_model_name(balancer):
    model = load_extension("models.balancers", balancer.name)()
    assert model.name == balancer.name


@pytest.mark.parametrize("balancer", extensions("models.balancers"))
def test_balance_model_param(balancer):
    model = load_extension("models.balancers", balancer.name)()
    assert isinstance(model.get_params(), dict)


@pytest.mark.parametrize("balancer", extensions("models.balancers"))
@pytest.mark.skip(reason="Check estimator is not working for balance models.")
def test_balance_check_estimator(balancer):
    model = load_extension("models.balancers", balancer.name)()
    assert check_estimator(model)


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
