from pytest import mark
import numpy as np

from asreview.balance_strategies.utils import get_balance_model


def generate_data(n_feature=20, n_sample=10):
    X = np.random.rand(n_sample, n_feature)
    n_sample_zero = np.int(n_sample/2)
    n_sample_one = n_sample - n_sample_zero
    y = np.append(np.zeros(n_sample_zero), np.ones(n_sample_one))
    np.random.shuffle(y)

    return X, y


def check_partition(X, y, X_partition, y_partition, train_idx):
    partition_idx = []
    for row in X_partition:
        partition_idx.append(
            np.where(np.all(X == row, axis=1))[0][0]
        )

    assert np.count_nonzero(y_partition == 0) > 0
    assert np.count_nonzero(y_partition == 1) > 0
    assert len(partition_idx) == X_partition.shape[0]
    assert set(partition_idx) <= set(train_idx.tolist())
    assert np.all(X[partition_idx] == X_partition)
    assert np.all(y[partition_idx] == y_partition)


@mark.parametrize(
    "balance_strategy",
    [
        "undersample",
        "simple",
        "double",
        "triple",
    ])
def test_balance(balance_strategy, n_partition=100, n_feature=200,
                 n_sample=100):
    model = get_balance_model(balance_strategy)
    X, y = generate_data(n_feature=n_feature, n_sample=n_sample)
    for _ in range(n_partition):
        n_train = np.random.randint(10, n_sample)
        while True:
            train_idx = np.random.choice(
                np.arange(len(y)), n_train, replace=False)
            num_zero = np.count_nonzero(y[train_idx] == 0)
            num_one = np.count_nonzero(y[train_idx] == 1)
            if num_zero > 0 and num_one > 0:
                break
        shared = {"query_src": {}, "current_queries": {}}
        X_train, y_train = model.sample(X, y, train_idx, shared)
        check_partition(X, y, X_train, y_train, train_idx)
