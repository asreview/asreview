'''
Created on 3 Apr 2019

@author: qubix
'''
import numpy as np
from math import log, inf, ceil
from copy import deepcopy
# from asr.balanced_al import _set_class_weight


def _set_class_weight(weight1, fit_kwargs):
    weight0 = 1.0
#     if n_included:
#         weight1 = (n_queried-n_included)/(dyn_cw*n_included)
    fit_kwargs['class_weight'] = {
        0: weight0,
        1: weight1,
    }
    print(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")


def simple_td(X, y, train_idx, extra_vars={}):
    return X[train_idx], y[train_idx]


def triple_balance_td(X, y, train_idx, extra_vars={}):
    fit_kwargs = extra_vars.get("fit_kwargs", {})
    max_idx = extra_vars.get("max_idx", np.array([], dtype=int))
    rand_idx = extra_vars.get("rand_idx", train_idx)

    if 'pref_epochs' not in extra_vars:
        extra_vars['pref_epochs'] = fit_kwargs.get('epochs', 1)
    if 'shuffle' not in extra_vars:
        extra_vars['shuffle'] = fit_kwargs.get('shuffle', True)
    shuffle = extra_vars['shuffle']
    pref_epochs = extra_vars['pref_epochs']

    if "last_max_idx" in extra_vars:
        max_idx = np.append(max_idx, extra_vars['last_max_idx'])
        rand_idx = np.append(rand_idx, extra_vars['last_rand_idx'])
    else:
        rand_idx = train_idx

    extra_vars['rand_idx'] = rand_idx
    extra_vars['max_idx'] = max_idx

    one_idx = train_idx[np.where(y[train_idx] == 1)]
    zero_max_idx = max_idx[np.where(y[max_idx] == 0)]
    zero_rand_idx = rand_idx[np.where(y[rand_idx] == 0)]

    print(one_idx, zero_rand_idx, zero_max_idx)
    n_one = len(one_idx)
    n_zero_rand = len(zero_rand_idx)
    n_zero_pred = len(zero_max_idx)

    n_mini_epoch = max(1, ceil(n_zero_pred/n_one), ceil(n_zero_rand/n_one))
    n_total = n_one*n_mini_epoch

    while len(one_idx) < n_total:
        one_idx = np.append(one_idx, one_idx)
    while n_zero_rand and len(zero_rand_idx) < n_total:
        zero_rand_idx = np.append(zero_rand_idx, zero_rand_idx)
    while n_zero_pred and len(zero_max_idx) < n_total:
        zero_max_idx = np.append(zero_max_idx, zero_max_idx)

    all_idx = np.array([], dtype=int)
    for i in range(n_mini_epoch):
        new_idx = one_idx[i*n_one:(i+1)*n_one].copy()
        new_idx = np.append(new_idx, zero_max_idx[i*n_one:(i+1)*n_one])
        new_idx = np.append(new_idx, zero_rand_idx[i*n_one:(i+1)*n_one])
        if shuffle:
            np.random.shuffle(new_idx)
        all_idx = np.append(all_idx, new_idx)
    fit_kwargs['epochs'] = ceil(pref_epochs/n_mini_epoch)
    return X[all_idx], y[all_idx]


def undersample_td(X, y, train_idx, extra_vars={}):
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
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    n_zero_add = min(n_zero, int(ratio*n_one))

    zero_add = zero_ind[np.random.choice(n_zero, n_zero_add, replace=False)]
    all_ind = np.append(one_ind, zero_add)
    fit_kwargs['validation_data'] = (X[all_ind], y[all_ind])
