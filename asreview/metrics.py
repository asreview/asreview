# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

"""Performance metrics for activate learning results."""

__all__ = ["loss", "ndcg"]

import numpy as np


def loss(labels: list[int]):
    """Compute the loss of the labels.

    arguments
    ---------
    labels: list
        List of labels.

    Returns
    -------
    float:
        The loss of the labels.
    """
    Ny = sum(labels)
    Nx = len(labels)
    if Ny == 0 or Nx == Ny:
        raise ValueError("Labels must contain two distinct classes.")
    return float(
        (Ny * (Nx - (Ny - 1) / 2) - np.cumsum(labels).sum()) / (Ny * (Nx - Ny))
    )


def ndcg(labels: list[int]):
    """Compute the Normalized Discounted Cumulative Gain (NDCG) https://doi.org/10.48550/arXiv.1304.6480 for binary labels.

    Arguments
    ---------
    labels: list
        List of binary labels (0 or 1).

    Returns
    -------
    float:
        The NDCG score.
    """
    labels = np.asarray(labels)

    def dcg_binary(binary_labels):
        gains = binary_labels  # Gains are the binary labels
        discounts = 1.0 / np.log2(np.arange(2, len(binary_labels) + 2))
        return np.sum(gains * discounts)

    ideal_labels = np.sort(labels)[::-1]  # Ideal ranking (sorted labels)
    actual_dcg = dcg_binary(labels)  # Use binary DCG
    ideal_dcg = dcg_binary(ideal_labels)  # Use binary DCG for ideal

    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0
