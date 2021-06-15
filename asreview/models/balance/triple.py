# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging

import numpy as np

from asreview.models.balance.base import BaseBalance
from asreview.models.balance.double import _one_weight
from asreview.models.balance.double import DoubleBalance
from asreview.models.balance.double import _zero_weight
from asreview.models.balance.double import fill_training
from asreview.models.balance.double import random_round
from asreview.utils import get_random_state


class TripleBalance(BaseBalance):
    """Triple balance strategy.

    This divides the training data into three sets: included papers, excluded
    papers found with random sampling and papers found with max sampling. They
    are balanced according to formulas depending on the percentage of papers
    read in the dataset, the number of papers with random/max sampling etc.
    Works best for stochastic training algorithms. Reduces to both full
    sampling and undersampling with corresponding parameters.

    Arguments
    ---------
    a: float
        Governs the weight of the 1's. Higher values mean linearly more 1's
        in your training sample.
    alpha: float
        Governs the scaling the weight of the 1's, as a function of the
        ratio of ones to zeros. A positive value means that the lower the
        ratio of zeros to ones, the higher the weight of the ones.
    b: float
        Governs how strongly we want to sample depending on the total
        number of samples. A value of 1 means no dependence on the total
        number of samples, while lower values mean increasingly stronger
        dependence on the number of samples.
    beta: float
        Governs the scaling of the weight of the zeros depending on the
        number of samples. Higher values means that larger samples are more
        strongly penalizing zeros.
    c: float
        Value between one and zero that governs the weight of samples done
        with maximal sampling. Higher values mean higher weight.
    gamma: float
        Governs the scaling of the weight of the max samples as a function
        of the % of papers read. Higher values mean stronger scaling.
    """

    name = "triple"
    label = "Dynamic resampling (Triple)"

    def __init__(self,
                 a=2.155,
                 alpha=0.94,
                 b=0.789,
                 beta=1.0,
                 c=0.835,
                 gamma=2.0,
                 shuffle=True,
                 random_state=None):
        """Initialize the triple balance strategy."""
        super(TripleBalance, self).__init__()
        self.a = a
        self.alpha = alpha
        self.b = b
        self.beta = beta
        self.c = c
        self.gamma = gamma
        self.shuffle = shuffle
        self.fallback_model = DoubleBalance(
            a=a, alpha=alpha, b=b, beta=beta, random_state=random_state)
        self._random_state = get_random_state(random_state)

    def sample(self, X, y, train_idx, shared):
        """Resample the training data.

        Arguments
        ---------
        X: numpy.ndarray
            Complete feature matrix.
        y: numpy.ndarray
            Labels for all papers.
        train_idx: numpy.ndarray
            Training indices, that is all papers that have been reviewed.
        shared: dict
            Dictionary to share data between balancing models and other models.

        Returns
        -------
        numpy.ndarray,numpy.ndarray:
            X_train, y_train: the resampled matrix, labels.
        """
        max_idx = np.array(shared["query_src"].get("max", []), dtype=np.int)
        rand_idx = np.array([], dtype=np.int)
        for qtype in shared["query_src"]:
            if qtype != "max":
                rand_idx = np.append(rand_idx, shared["query_src"][qtype])

        rand_idx = rand_idx.astype(int)
        # Write them back for next round.
        if self.shuffle:
            self._random_state.shuffle(rand_idx)
            self._random_state.shuffle(max_idx)

        if len(rand_idx) == 0 or len(max_idx) == 0:
            logging.debug("Warning: trying to use triple balance, but unable"
                          f" to, because we have {len(max_idx)} max samples "
                          f"and {len(rand_idx)} random samples.")
            return self.fallback_model.sample(X, y, train_idx, shared)

        # Split the idx into three groups: 1's, random 0's, max 0's.
        one_idx = train_idx[np.where(y[train_idx] == 1)]
        zero_max_idx = max_idx[np.where(y[max_idx] == 0)]
        zero_rand_idx = rand_idx[np.where(y[rand_idx] == 0)]

        if len(zero_rand_idx) == 0 or len(zero_max_idx) == 0:
            logging.debug("Warning: trying to use triple balance, but unable "
                          f"to, because we have {len(zero_max_idx)} zero max"
                          f"samples and {len(zero_rand_idx)} random samples.")
            return self.fallback_model.sample(X, y, train_idx, shared)

        n_one = len(one_idx)
        n_zero_rand = len(zero_rand_idx)
        n_zero_max = len(zero_max_idx)
        n_samples = len(y)
        n_train = len(train_idx)

        # Get the distribution of 1's, and random 0's and max 0's.
        n_one_train, n_zero_rand_train, n_zero_max_train = _get_triple_dist(
            n_one, n_zero_rand, n_zero_max, n_samples, n_train, self.a,
            self.alpha, self.b, self.beta, self.c, self.gamma,
            self._random_state)
        logging.debug(f"(1, 0_rand, 0_max) = ({n_one_train}, "
                      f"{n_zero_rand_train}, {n_zero_max_train})")

        one_train_idx = fill_training(one_idx, n_one_train, self._random_state)
        zero_rand_train_idx = fill_training(zero_rand_idx, n_zero_rand_train,
                                            self._random_state)
        zero_max_train_idx = fill_training(zero_max_idx, n_zero_max_train,
                                           self._random_state)

        all_idx = np.concatenate(
            [one_train_idx, zero_rand_train_idx, zero_max_train_idx])
        self._random_state.shuffle(all_idx)

        return X[all_idx], y[all_idx]

    def full_hyper_space(self):
        from hyperopt import hp
        parameter_space = {
            "bal_a": hp.lognormal("bal_a", 0, 1),
            "bal_alpha": hp.uniform("bal_alpha", 0, 2),
            "bal_b": hp.uniform("bal_b", 0, 1),
            # "bal_zero_beta": hp.uniform("bal_zero_beta", 0, 2),
            "bal_c": hp.uniform("bal_c", 0, 1),
            # "bal_zero_max_gamma": hp.uniform("bal_zero_max_gamma", 0.01, 2)
        }
        return parameter_space, {}


def _zero_max_weight(fraction_read, c, gamma):
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
    weight = 1 - (1 - c) * (1 - fraction_read)**gamma
    return weight


def _get_triple_dist(n_one, n_zero_rand, n_zero_max, n_samples, n_train, one_a,
                     one_alpha, zero_b, zero_beta, zero_max_c, zero_max_gamma,
                     random_state):
    " Get the number of 1's, random 0's and max 0's in each mini epoch. "
    n_zero = n_zero_rand + n_zero_max
    n_read = n_one + n_zero
    one_weight = _one_weight(n_one, n_zero, one_a, one_alpha)
    zero_weight = _zero_weight(n_read, zero_b, zero_beta)
    zero_max_weight = _zero_max_weight(n_read / n_samples, zero_max_c,
                                       zero_max_gamma)

    tot_zo_weight = one_weight * n_one + zero_weight * n_zero

    n_one_train = random_round(one_weight * n_one * n_train / tot_zo_weight,
                               random_state)
    n_one_train = max(1, min(n_train - 2, n_one_train))
    n_zero_train = n_train - n_one_train

    tot_rm_weight = 1 * n_zero_rand + zero_max_weight * n_zero_max
    n_zero_rand_train = random_round(
        n_zero_train * 1 * n_zero_rand / tot_rm_weight, random_state)
    n_zero_rand_train = max(1, min(n_zero_rand - 1, n_zero_rand_train))
    n_zero_max_train = n_zero_train - n_zero_rand_train

    return n_one_train, n_zero_rand_train, n_zero_max_train
