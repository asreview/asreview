# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from asreview.compat import convert_id_to_idx
from asreview.init_sampling import sample_prior_knowledge
from asreview.review import BaseReview


class ReviewSimulate(BaseReview):
    """ASReview Simulation mode class.

    Arguments
    ---------
    as_data: asreview.ASReviewData
        The data object which contains the text, labels, etc.
    model: BaseModel
        Initialized model to fit the data during active learning.
        See asreview.models.utils.py for possible models.
    query_model: BaseQueryModel
        Initialized model to query new instances for review, such as random
        sampling or max sampling.
        See asreview.query_strategies.utils.py for query models.
    balance_model: BaseBalanceModel
        Initialized model to redistribute the training data during the
        active learning process. They might either resample or undersample
        specific papers.
    feature_model: BaseFeatureModel
        Feature extraction model that converts texts and keywords to
        feature matrices.
    n_prior_included: int
        Sample n prior included papers.
    n_prior_excluded: int
        Sample n prior excluded papers.
    prior_idx: int
        Prior indices by row number.
    n_papers: int
        Number of papers to review during the active learning process,
        excluding the number of initial priors. To review all papers, set
        n_papers to None.
    n_instances: int
        Number of papers to query at each step in the active learning
        process.
    n_queries: int
        Number of steps/queries to perform. Set to None for no limit.
    start_idx: numpy.ndarray
        Start the simulation/review with these indices. They are assumed to
        be already labeled. Failing to do so might result bad behaviour.
    init_seed: int
        Seed for setting the prior indices if the --prior_idx option is
        not used. If the option prior_idx is used with one or more
        index, this option is ignored.
    state_file: str
        Path to state file. Replaces log_file argument.
    """

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

        # check for partly labeled data
        labels = as_data.labels
        labeled_idx = np.where((labels == 0) | (labels == 1))[0]
        if len(labeled_idx) != len(labels):
            raise ValueError("Expected fully labeled dataset.")

        if prior_idx is not None and len(prior_idx) != 0:
            start_idx = prior_idx
        else:
            start_idx = as_data.prior_data_idx
            if len(start_idx) == 0 and n_prior_included + n_prior_excluded > 0:
                start_idx = sample_prior_knowledge(labels,
                                                   n_prior_included,
                                                   n_prior_excluded,
                                                   random_state=init_seed)
        super(ReviewSimulate, self).__init__(as_data,
                                             *args,
                                             start_idx=start_idx,
                                             **kwargs)

    def _get_labels(self, ind):
        """Get the labels directly from memory.

        Arguments
        ---------
        ind: list, numpy.ndarray
            A list with indices

        Returns
        -------
        list, numpy.ndarray
            The corresponding true labels for each indice.
        """

        return self.y[ind, ]
