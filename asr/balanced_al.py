'''
Created on 3 Apr 2019

@author: qubix
'''
import numpy as np


def rebalance_train_data(X, y, imbalance=0.25):
    n_sample = len(y)
    one_ind = np.where(y == 1)[0]
    zero_ind = np.where(y == 0)[0]
    np.random.shuffle(zero_ind)
    n_one = len(one_ind)
    n_zero = len(zero_ind)

    if n_one/n_sample > imbalance:
        return X, y

    n_mini_epoch = int(imbalance/(1-imbalance) * n_zero/n_one+1)
    n_zero_epoch = int(n_one*(1/imbalance-1))

    all_ind = np.array([], dtype=int)
#     print(one_ind)
#     print(zero_ind)
#     print(n_zero_epoch)
#     print(n_mini_epoch)
    for i in range(n_mini_epoch):
        new_zero_ind = zero_ind[i*n_zero_epoch:(i+1)*n_zero_epoch]
        new_ind = np.append(one_ind, new_zero_ind)
        n_needed = n_zero_epoch+n_one - len(new_ind)

        if n_needed:
            rand_zero = zero_ind[np.random.choice(len(zero_ind), n_needed)]
            new_ind = np.append(new_ind, rand_zero)
        np.random.shuffle(new_ind)
        all_ind = np.append(all_ind, new_ind)
#     print(all_ind)
    return X[all_ind], y[all_ind]
