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

import itertools
import os
from pathlib import Path
from math import floor

import numpy as np
import pandas as pd
from scipy import stats

from asreview.state import BaseState
from asreview.state.utils import open_state
from asreview.state.legacy.utils import states_from_dir
from asreview.analysis.statistics import _get_labeled_order
from asreview.analysis.statistics import _get_limits
from asreview.analysis.statistics import _find_inclusions
from asreview.analysis.statistics import _get_last_proba_order


def rrf(inclusions, val=0.1):
    """Get the RRF (Relevant References Found).

    Arguments
    ---------
    val:
        At which recall, between 0 and 1.

    Returns
    -------
    tuple:
        Tuple consisting of RRF value, x_positions, y_positions of RRF bar.

    """

    recall = pd.Series(inclusions).cumsum()
    intersect = floor(len(inclusions)*val)

    return recall.values[intersect-1]

rrf([0,1,0,1,0,0,1,0,0,1]) == 0
rrf([0,1,0,1,0,0,1,0,0,1], 0.10) == 0
rrf([0,1,0,1,0,0,1,0,0,1], 0.20) == 1
rrf([0,1,0,1,0,0,1,0,0,1], 0.50) == 1
rrf([0,1,0,1,0,0,1,0,0,1], 1) == 4


def wss(inclusions, val=0.9):

	# get the recall curve and maximum values
    recall = pd.Series(inclusions).cumsum()
    n_inclusions = recall.max()

    # compute the number of inclusions at recall val
    n_inclusions_at_recall = n_inclusions*val

    # get the horizontal cutoff
    n_screened = None
    for i, r in enumerate(recall):
    	if r > n_inclusions_at_recall:
    		n_screened = i
    		break 

    # get the random screening curve
    inclusion_prob_random = np.full(
    	(len(inclusions), ), 
    	n_inclusions/len(inclusions)
    )
    recall_random = pd.Series(inclusion_prob_random).cumsum()

 	# return the difference
    return recall[n_screened] - recall_random[n_screened]


print(wss([1,1,0,1,0,1,0,0,0,0]))
# print(wss([0,1,0,1,0,0,1,0,0,1], 0.10))
# print(wss([0,1,0,1,0,0,1,0,0,1], 0.20))
# print(wss([0,1,0,1,0,0,1,0,0,1], 0.50))
# print(wss([0,1,0,1,0,0,1,0,0,1], 1))


