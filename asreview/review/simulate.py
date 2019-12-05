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

from asreview.init_sampling import sample_prior_knowledge
from asreview.review import BaseReview
from asreview.review.base import _merge_prior_knowledge


class ReviewSimulate(BaseReview):
    """ Automated Systematic Review in simulation mode. """

    def __init__(self,
                 X,
                 y,
                 *args,
                 n_prior_included=None,
                 n_prior_excluded=None,
                 **kwargs):
        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        super(ReviewSimulate, self).__init__(
            X, y, *args, **kwargs)

    def _prior_knowledge(self, logger):
        """ Get the prior knowledge, either from specific paper IDs,
            and if they're not given from the number of in/exclusions. """
        if self.prior_included is not None or self.prior_excluded is not None:
            prior_indices, prior_labels = _merge_prior_knowledge(
                self.prior_included,
                self.prior_excluded
            )
        else:
            # Create the prior knowledge
            init_ind = sample_prior_knowledge(
                self.y,
                n_prior_included=self.n_prior_included,
                n_prior_excluded=self.n_prior_excluded,
                random_state=None  # TODO
            )
            prior_indices, prior_labels = init_ind, self.y[init_ind, ]
        self.classify(prior_indices, prior_labels, logger, method="initial")

    def _get_labels(self, ind):
        """ Get the labels directly from memory.

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
