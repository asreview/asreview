'''
Created on 3 Apr 2019

@author: qubix
'''
import numpy as np
from math import log, inf, ceil
from copy import deepcopy
from tensorflow.python.keras.engine.distributed_training_utils import set_weights
# from asr.balanced_al import _set_class_weight


def _set_class_weight(weight1, fit_kwargs):
    weight0 = 1
#     if n_included:
#         weight1 = (n_queried-n_included)/(dyn_cw*n_included)
    fit_kwargs['class_weight'] = {
        0: weight0,
        1: weight1,
    }
    print(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")


def find_batch_size(n_class, ratio_one, pref_bs, search_window=20):
    """
    Returns
    -------
    n_per_mini_epoch[2]: one, zero
    batch_size
    n_mini_epoch
    """
    sw = search_window

    if n_class[0]+n_class[1] < pref_bs:
        return (n_class, n_class[0]+n_class[1], 1)

    pref = [0, 0]
    pref[0] = int(n_class[1]/ratio_one)
    pref[1] = int(n_class[0]*ratio_one)

    if pref[0] > n_class[0]:
        adjust_class = 1
        pref[0] = n_class[0]
    else:
        adjust_class = 0
        pref[1] = n_class[1]

    bs_factor = 0.01
    ratio_factor = 0.05
    non_fit_factor = 1

    best_score = inf
    best_val = None

    for bs in range(pref_bs-sw, pref_bs+sw):
        if bs < 1:
            continue
        mini_epoch = [pref[0], pref[1]]
        for nc_adjust in range(pref[adjust_class]-sw, pref[adjust_class]+sw+1):
            if nc_adjust < 1:
                continue
            mini_epoch[adjust_class] = nc_adjust
            new_ratio = mini_epoch[1]/mini_epoch[0]
            score = ratio_factor * abs(log(new_ratio/ratio_one))
            score += bs_factor * abs(log(bs/pref_bs))
            epoch_size = mini_epoch[0]+mini_epoch[1]
            if (epoch_size) % bs:
                score += non_fit_factor
#             n_batch_per_epoch = ceil(epoch_size/bs)
            n_epoch_0 = ceil(n_class[0]/mini_epoch[0])
            n_epoch_1 = ceil(n_class[1]/mini_epoch[1])
            n_mini_epoch = max(n_epoch_0, n_epoch_1)
#             print(score, (deepcopy(mini_epoch), bs, n_mini_epoch))

            if score < best_score:
                best_score = score
                best_val = (deepcopy(mini_epoch), bs, n_mini_epoch)
#                 print(best_val, best_score)
    return best_val


def balanced_train_data(X, y, fit_kwargs, ratio=1.0, shuffle=True,
                        pref_batch_size=32, n_epoch=None, frac_included=1):

    ind = np.array([np.where(y == 0)[0], np.where(y == 1)[0]])
    n_ind = [len(ind[0]), len(ind[1])]

    mini_epoch, batch_size, n_mini_epoch = find_batch_size(
        n_ind, ratio, pref_batch_size)

    fixed = None
    for i in range(2):
        if n_ind[i] == mini_epoch[i]:
            fixed = i
    if fixed is None:
        print("Error: can't find batch size.")

    fixed_ind = np.tile(ind[fixed], n_mini_epoch)
    usample_copy = np.copy(ind[1-fixed])
    np.random.shuffle(usample_copy)
    np.random.shuffle(ind[1-fixed])
    usample_ind = np.append(ind[1-fixed], usample_copy)

    if fixed == 0:
        zero_ind = fixed_ind
        one_ind = usample_ind
    else:
        zero_ind = usample_ind
        one_ind = fixed_ind

    all_ind = np.array([], dtype=int)
    nz = mini_epoch[0]
    no = mini_epoch[1]
    n_mini_epoch = min(n_mini_epoch, n_epoch)

    for i in range(n_mini_epoch):
        zero_slice = zero_ind[i*nz:(i+1)*nz]
        one_slice = one_ind[i*no:(i+1)*no]
        new_ind = np.append(zero_slice, one_slice)
        if shuffle:
            np.random.shuffle(new_ind)
        all_ind = np.append(all_ind, new_ind)

    print(f"n_epoch: {n_epoch}, n_mini_epoch: {n_mini_epoch}\n"
          f"mini_epoch: {mini_epoch}\n"
          f"batch_size: {batch_size}")
    fit_kwargs['epochs'] = ceil(n_epoch/n_mini_epoch)
    fit_kwargs['batch_size'] = batch_size
    _set_class_weight(1/frac_included, fit_kwargs)
#     if fixed == 0:
#         _set_class_weight(n_mini_epoch/frac_included, fit_kwargs)
#     else:
#         _set_class_weight(1/(frac_included*n_mini_epoch), fit_kwargs)
    return X[all_ind].copy(), y[all_ind].copy()


def undersample(X, y, fit_kwargs, ratio=1.0, shuffle=True):
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    if n_one/n_zero >= ratio:
        shuf_ind = np.append(one_ind, zero_ind)
    else:
        n_zero_epoch = ceil(n_one/ratio)
        shuf_ind = np.append(one_ind, zero_ind[-n_zero_epoch:])
#         rand_idx = np.random.choice(n_zero, n_zero_epoch, replace=False)
#         rand_zero = zero_ind[rand_idx]
#         shuf_ind = np.append(one_ind, rand_zero)
    print(shuffle)
    if shuffle:
        np.random.shuffle(shuf_ind)
    print(shuf_ind)
    fit_kwargs['batch_size'] = len(shuf_ind)
    return X[shuf_ind].copy(), y[shuf_ind].copy(), shuf_ind


def validation_data(X, y, fit_kwargs, ratio=1):
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    n_zero_add = min(n_zero, int(ratio*n_one))

    zero_add = zero_ind[np.random.choice(n_zero, n_zero_add, replace=False)]
    all_ind = np.append(one_ind, zero_add)
    fit_kwargs['validation_data'] = (X[all_ind], y[all_ind])


def rebalance_train_data(X, y, ratio=1, max_mini_epoch=None, shuffle=True):
    n_sample = len(y)
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    if shuffle:
        np.random.shuffle(zero_ind)

    if n_one/n_sample > ratio:
        return X, y

    n_mini_epoch = int(ratio/(1-ratio) * n_zero/n_one+1)
    if max_mini_epoch is not None:
        n_mini_epoch = min(max_mini_epoch, n_mini_epoch)
    n_zero_epoch = int(n_one*(1/ratio-1))

    all_ind = np.array([], dtype=int)

    batch_size = n_zero_epoch+n_one
    for i in range(n_mini_epoch):
        new_zero_ind = zero_ind[i*n_zero_epoch:(i+1)*n_zero_epoch]
        new_ind = np.append(one_ind, new_zero_ind)
        n_needed = batch_size - len(new_ind)

        if n_needed:
            idx = np.random.choice(n_zero, n_needed, replace=False)
            rand_zero = zero_ind[idx]
            new_ind = np.append(new_ind, rand_zero)
        if shuffle:
            np.random.shuffle(new_ind)
        all_ind = np.append(all_ind, new_ind)
    return X[all_ind], y[all_ind], n_mini_epoch, batch_size
