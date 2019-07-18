import numpy as np
from math import ceil, exp, log

from asreview.balance_strategies.base import BaseTrainData


class TripleBalanceTD(BaseTrainData):
    """
    Class to get the three way rebalancing function and arguments.
    It divides the data into three groups: 1's, 0's from random sampling,
    and 0's from max sampling. Thus it only makes sense to use this class in
    combination with the rand_max query strategy.
    """
    def __init__(self, balance_kwargs, fit_kwargs, query_kwargs):
        super(TripleBalanceTD, self).__init__(balance_kwargs)
        self.balance_kwargs['pref_epochs'] = int(fit_kwargs.get('epochs', 1))
        self.balance_kwargs['fit_kwargs'] = fit_kwargs
        self.balance_kwargs['query_kwargs'] = query_kwargs

    def func_kwargs(self):
        return triple_balance, self.balance_kwargs

    def default_kwargs(self):
        defaults = {}
        defaults['rand_max_b'] = 10
        defaults['rand_max_alpha'] = 1.0
        defaults['one_zero_beta'] = 0.6
        defaults['one_zero_delta'] = 0.15
        defaults['shuffle'] = True
        defaults['rand_max_idx'] = {}
        return defaults


def _rand_max_weight(n_one, n_zero_rand, n_zero_max, n_samples, b, alpha):
    """
    Get the weight ratio between random and max samples.

    Parameters
    ----------
    b: float
        Ratio between rand/max at 0% queried.
    alpha: float
        Power law governing the transition.

    Returns
    -------
    float:
        Weight ratio between random/max instances.
    """
    frac = (n_one+n_zero_max)/(n_samples-n_zero_rand)
    ratio = b * exp(-log(b) * frac**alpha)
    return ratio


def _one_zero_ratio(n_one, n_zero, beta, delta):
    """
    Get the weight ratio between ones and zeros.

    Parameters
    ----------
    beta:
        Exponent governing decay of 1's to 0's.
    delta:
        Asymptotic ratio for infinite number of samples.

    Returns
    -------
    float:
        Weight ratio between 1's and 0's
    """
    ratio = (1-delta)*(n_one/n_zero)**beta + delta
    return ratio


def _get_triple_dist(n_one, n_zero_rand, n_zero_max, n_samples, rand_max_b=10,
                     rand_max_alpha=1.0, one_zero_beta=0.6, one_zero_delta=0.15):
    " Get the number of 1's, random 0's and max 0's in each mini epoch. "
    n_zero = n_zero_rand+n_zero_max

    # First get the number of ones and zeros in each mini epoch.
    oz_ratio = _one_zero_ratio(n_one, n_zero, one_zero_beta, one_zero_delta)
    n_zero_epoch = ceil(n_one/oz_ratio)

    # Then the number of random zeros and max zeros in each mini epoch.
    rand_max_wr = _rand_max_weight(n_one, n_zero_rand, n_zero_max, n_samples,
                                   rand_max_b, rand_max_alpha)
    if n_zero_max:
        n_zero_rand_epoch = n_zero_epoch/(rand_max_wr+n_zero_max/n_zero_rand)
        n_zero_rand_epoch = ceil(rand_max_wr*n_zero_rand_epoch)
    else:
        n_zero_rand_epoch = n_zero_epoch
    n_zero_max_epoch = n_zero_epoch-n_zero_rand_epoch

    return n_one, n_zero_rand_epoch, n_zero_max_epoch


def _n_mini_epoch(n_samples, epoch_size):
    " Compute the size of mini epochs needed to use all data. "
    if n_samples <= 0 or epoch_size <= 0:
        return 0
    return ceil(n_samples/epoch_size)


def triple_balance(X, y, train_idx, fit_kwargs={}, query_kwargs={},
                   pref_epochs=1, shuffle=True, rand_max_idx={}, **dist_kwargs):
    """
    A more advanced function that does resample the training set.
    Most likely only useful in combination with NN's, and possibly other
    stochastic classification methods.
    """
    # We want to know which training indices are from rand/max sampling.
    # If we have no information, assume everything is random.
    max_idx = query_kwargs.get("max_idx", np.array([], dtype=int))
    rand_idx = query_kwargs.get("rand_idx", train_idx)

    # Append the new indices to their corresponding lists.
    if "last_max_idx" in query_kwargs:
        max_idx = np.append(max_idx, query_kwargs['last_max_idx'])
        rand_idx = np.append(rand_idx, query_kwargs['last_rand_idx'])
    else:
        rand_idx = train_idx

    # Write them beack for next round.
    if shuffle:
        np.random.shuffle(rand_idx)
        np.random.shuffle(max_idx)
    rand_max_idx['rand_idx'] = rand_idx
    rand_max_idx['max_idx'] = max_idx

    # Split the idx into three groups: 1's, random 0's, max 0's.
    one_idx = train_idx[np.where(y[train_idx] == 1)]
    zero_max_idx = max_idx[np.where(y[max_idx] == 0)]
    zero_rand_idx = rand_idx[np.where(y[rand_idx] == 0)]

    n_one = len(one_idx)
    n_zero_rand = len(zero_rand_idx)
    n_zero_max = len(zero_max_idx)
    n_samples = len(y)

    # Get the distribution of 1's, and random 0's and max 0's.
    n_one_epoch, n_zero_rand_epoch, n_zero_max_epoch = _get_triple_dist(
        n_one, n_zero_rand, n_zero_max, n_samples, **dist_kwargs)
    print(f"(1, 0_rand, 0_max) = "
          f"({n_one_epoch}, {n_zero_rand_epoch}, {n_zero_max_epoch})")

    # Calculate the number of mini epochs, and # of samples for each group.
    n_mini_epoch = max(_n_mini_epoch(n_one, n_one_epoch),
                       _n_mini_epoch(n_zero_rand, n_zero_rand_epoch),
                       _n_mini_epoch(n_zero_max, n_zero_max_epoch)
                       )

    # Replicate the indices until we have enough.
    while len(one_idx) < n_one_epoch*n_mini_epoch:
        one_idx = np.append(one_idx, one_idx)
    while (n_zero_rand_epoch and
           len(zero_rand_idx) < n_zero_rand_epoch*n_mini_epoch):
        zero_rand_idx = np.append(zero_rand_idx, zero_rand_idx)
    while (n_zero_max_epoch and
           len(zero_max_idx) < n_zero_max_epoch*n_mini_epoch):
        zero_max_idx = np.append(zero_max_idx, zero_max_idx)

    # Build the training set from the three groups.
    all_idx = np.array([], dtype=int)
    for i in range(n_mini_epoch):
        new_one_idx = one_idx[i*n_one_epoch:(i+1)*n_one_epoch]
        new_zero_rand_idx = zero_rand_idx[i*n_zero_rand_epoch:(i+1)*n_zero_rand_epoch]
        new_zero_max_idx = zero_max_idx[i*n_zero_max_epoch:(i+1)*n_zero_max_epoch]
        new_idx = new_one_idx
        new_idx = np.append(new_idx, new_zero_rand_idx)
        new_idx = np.append(new_idx, new_zero_max_idx)
        if shuffle:
            np.random.shuffle(new_idx)
        all_idx = np.append(all_idx, new_idx)

    # Set the number of epochs in the fit_kwargs.
    if 'epochs' in fit_kwargs:
        efrac_one = n_one_epoch/n_one
        efrac_zero_rand = n_zero_rand_epoch/n_zero_rand
        if n_zero_max:
            efrac_zero_max = n_zero_max_epoch/n_zero_max
            efrac = (efrac_one*efrac_zero_rand*efrac_zero_max)**(1./3.)
        else:
            efrac = (efrac_one*efrac_zero_rand)**(1./2.)
        efrac = 1.0
        print(f"Fraction of mini epoch = {efrac}")
        fit_kwargs['epochs'] = ceil(pref_epochs/(efrac*n_mini_epoch))
    return X[all_idx], y[all_idx]
