# Copyright 2019 The ASReview Authors. All Rights Reserved.
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

from asreview.init_sampling import sample_prior_knowledge
from asreview.review import BaseReview


class ReviewSimulate(BaseReview):
    """Automated Systematic Review in simulation mode."""
    name = "simulate"

    def __init__(self,
                 as_data,
                 *args,
                 n_prior_included=0,
                 n_prior_excluded=0,
                 prior_idx=None,
                 init_seed=None,
                 **kwargs):

        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        if prior_idx is not None and len(prior_idx) != 0:
            start_idx = prior_idx
        else:
            labels = as_data.labels
            labeled_idx = np.where((labels == 0) | (labels == 1))[0]

            if len(labeled_idx) != len(labels):
                logging.warning("Simulating partial review, ignoring unlabeled"
                                f" papers (n={len(labels)-len(labeled_idx)}.")
                as_data = as_data.slice(labeled_idx)
                labels = as_data.labels
                print(labels)

            start_idx = as_data.prior_data_idx
            if len(start_idx) == 0 and n_prior_included + n_prior_excluded > 0:
                start_idx = sample_prior_knowledge(
                    labels, n_prior_included, n_prior_excluded,
                    random_state=init_seed)

        super(ReviewSimulate, self).__init__(
            as_data, *args, start_idx=start_idx, **kwargs)

    def _get_labels(self, ind):
        """Get the labels directly from memory.

        Arguments
        ---------
        ind: list, np.array
            A list with indices

        Returns
        -------
        list, np.array
            The corresponding true labels for each indice.
        """

        return self.y[ind, ]
