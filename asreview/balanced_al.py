'''
Functions that resample the training data.
'''
import numpy as np


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
