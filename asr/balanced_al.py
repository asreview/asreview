'''
Functions that resample the training data.
'''
import numpy as np
from math import ceil, exp, log


def _rand_max_weight(n_one, n_zero_rand, n_zero_max, n_samples, extra_vars={}):
    frac = (n_one+n_zero_max)/(n_samples-n_zero_rand)
    b = extra_vars.get("rand_max_weight_b", 30)
    print(f"Using for rand/max ratio: b = {b}")
#     delta = 1.0
    alpha = 0.5

#     ratio = b*exp(-delta**alpha * log(b) * frac**(-alpha))
    ratio = b * exp(-log(b) * frac**alpha)
    print(b, frac, alpha, ratio)
    return ratio


def _one_zero_ratio(n_one, n_zero, extra_vars={}):
    beta = extra_vars.get("one_zero_beta", 0.4)
    print(f"Using for 1/0 ratio: beta = {beta}")
    ratio = (n_one/n_zero)**beta
    return ratio


def _get_triple_dist(n_one, n_zero_rand, n_zero_max, n_samples, extra_vars={}):
    n_zero = n_zero_rand+n_zero_max
    n_zero_epoch = ceil(n_one/_one_zero_ratio(n_one, n_zero, extra_vars))
    rand_max_wr = _rand_max_weight(n_one, n_zero_rand, n_zero_max, n_samples, extra_vars)
    if n_zero_max:
        print(rand_max_wr, n_zero_epoch, n_zero_max, n_zero_rand)
        n_zero_rand_epoch = rand_max_wr*n_zero_epoch/(rand_max_wr+n_zero_max/n_zero_rand)
        n_zero_rand_epoch = ceil(n_zero_rand_epoch)
    else:
        n_zero_rand_epoch = n_zero_epoch
    n_zero_max_epoch = n_zero_epoch-n_zero_rand_epoch

    return n_one, n_zero_rand_epoch, n_zero_max_epoch


def _set_class_weight(weight1, fit_kwargs):
    """ Used in RNN's to have quicker learning. """
    weight0 = 1.0
    fit_kwargs['class_weight'] = {
        0: weight0,
        1: weight1,
    }
    print(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")


def simple_td(X, y, train_idx, extra_vars={}):
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


def _n_mini_epoch(n_samples, epoch_size):
    if n_samples <= 0:
        return 0
    return ceil(n_samples/epoch_size)


def triple_balance_td(X, y, train_idx, extra_vars={}):
    """
    A more advanced function that does resample the training set.
    Most likely only useful in combination with NN's, and possibly other
    stochastic classification methods.
    """
    # We want to know which training indices are from rand/max sampling.
    # If we have no information, assume everything is random.
    fit_kwargs = extra_vars.get("fit_kwargs", {})
    max_idx = extra_vars.get("max_idx", np.array([], dtype=int))
    rand_idx = extra_vars.get("rand_idx", train_idx)

    # Get more variables from extra_vars.
    if 'pref_epochs' not in extra_vars:
        extra_vars['pref_epochs'] = fit_kwargs.get('epochs', 1)
    if 'shuffle' not in extra_vars:
        extra_vars['shuffle'] = fit_kwargs.get('shuffle', True)
    shuffle = extra_vars['shuffle']
    pref_epochs = extra_vars['pref_epochs']

    # Append the new indices to their corresponding lists.
    if "last_max_idx" in extra_vars:
        max_idx = np.append(max_idx, extra_vars['last_max_idx'])
        rand_idx = np.append(rand_idx, extra_vars['last_rand_idx'])
    else:
        rand_idx = train_idx

    # Write them beack for next round.
    if shuffle:
        np.random.shuffle(rand_idx)
        np.random.shuffle(max_idx)
    extra_vars['rand_idx'] = rand_idx
    extra_vars['max_idx'] = max_idx

    # Split the idx into three groups: 1's, random 0's, max 0's.
    one_idx = train_idx[np.where(y[train_idx] == 1)]
    zero_max_idx = max_idx[np.where(y[max_idx] == 0)]
    zero_rand_idx = rand_idx[np.where(y[rand_idx] == 0)]

    n_one = len(one_idx)
    n_zero_rand = len(zero_rand_idx)
    n_zero_max = len(zero_max_idx)
    n_samples = len(y)

    n_one_epoch, n_zero_rand_epoch, n_zero_max_epoch = _get_triple_dist(
        n_one, n_zero_rand, n_zero_max, n_samples, extra_vars)
    print(f"(1, 0_rand, 0_max) = ({n_one_epoch}, {n_zero_rand_epoch}, {n_zero_max_epoch})")

    # Calculate the number of mini epochs, and # of samples for each group.
    n_mini_epoch = max(_n_mini_epoch(n_one, n_one_epoch),
                       _n_mini_epoch(n_zero_rand, n_zero_rand_epoch),
                       _n_mini_epoch(n_zero_max, n_zero_max_epoch)
                       )
#     print("++++++++++++++++++++++")
#     print(one_idx)
#     print(zero_rand_idx)
#     print(zero_max_idx)
#     print("----------------------")
    # Replicate the indices until we have enough.
    while len(one_idx) < n_one_epoch*n_mini_epoch:
        one_idx = np.append(one_idx, one_idx)
    while n_zero_rand and len(zero_rand_idx) < n_zero_rand_epoch*n_mini_epoch:
        zero_rand_idx = np.append(zero_rand_idx, zero_rand_idx)
    while n_zero_max and len(zero_max_idx) < n_zero_max_epoch*n_mini_epoch:
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
#         print(new_idx)
        all_idx = np.append(all_idx, new_idx)

    # Set the number of epochs.
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


def undersample_td(X, y, train_idx, extra_vars={}):
    """ Undersample the training set to balance 1's and 0's. """
    ratio = extra_vars.get("undersample_ratio", 1.0)
    shuffle = extra_vars.get("shuffle", True)

    one_ind = train_idx[np.where(y[train_idx] == 1)]
    zero_ind = train_idx[np.where(y[train_idx] == 0)]

    n_one = len(one_ind)
    n_zero = len(zero_ind)

    if n_one/n_zero >= ratio:
        shuf_ind = np.append(one_ind, zero_ind)
    else:
        n_zero_epoch = ceil(n_one/ratio)
        zero_under = np.random.choice(np.arange(n_zero), n_zero_epoch,
                                      replace=False)
        shuf_ind = np.append(one_ind, zero_under)

    if shuffle:
        np.random.shuffle(shuf_ind)
    return X[shuf_ind], y[shuf_ind]


def validation_data(X, y, fit_kwargs, ratio=1):
    """ Set validation data from the samples remaining in the pool. """
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    n_zero_add = min(n_zero, int(ratio*n_one))

    zero_add = zero_ind[np.random.choice(n_zero, n_zero_add, replace=False)]
    all_ind = np.append(one_ind, zero_add)
    fit_kwargs['validation_data'] = (X[all_ind], y[all_ind])
