# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

from typing import List
import numpy as np

def loss(labels: List[int]):
    Ny = sum(labels)
    Nx = len(labels)
    if Ny == 0 or Nx == Ny:
        loss = f'{Ny = }'
    else:
        loss = float((Ny * (Nx - (Ny - 1) / 2) - np.cumsum(labels).sum()) / (Ny * (Nx - Ny)))
    return loss

def wss(labels, intercept, x_absolute=False, y_absolute=False):
    n_docs = len(labels)
    n_pos_docs = sum(labels)

    docs_found = np.cumsum(labels)
    docs_found_random = np.round(np.linspace(0, n_pos_docs, n_docs))

    when_found = np.searchsorted(docs_found, np.arange(1, n_pos_docs + 1))
    when_found_random = np.searchsorted(docs_found_random, np.arange(1, n_pos_docs + 1))
    n_found_earlier = when_found_random - when_found

    x = np.arange(1, n_pos_docs + 1)
    if not x_absolute:
        x = x / n_pos_docs

    if y_absolute:
        y = n_found_earlier
    else:
        y = n_found_earlier / n_docs

    i = np.searchsorted(x, intercept, side="right")
    return y[i - 1]
