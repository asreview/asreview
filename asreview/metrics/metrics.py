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

from asreview.state.utils import open_state
from asreview.metrics.utils import _get_inclusions_from_state
from asreview.state import SqlStateV1


def rrf(inclusions, val=0.1):
    """Compute RRF (Relevant References Found).

    Arguments
    ---------
    val:
        At which recall, between 0 and 1.

    Returns
    -------
    tuple:
        Tuple consisting of RRF value, x_positions, y_positions of RRF bar.

    """

    # if inclusions is state file
    if isinstance(inclusions, SqlStateV1):
        inclusions = _get_inclusions_from_state(inclusions)

    recall = pd.Series(inclusions).cumsum()
    intersect = floor(len(inclusions)*val)

    return recall.values[intersect-1]


def wss(inclusions, val=0.9):
    """Compute WSS (Work Saved Sampled) value.

    Arguments
    ---------
    val:
        At which recall, between 0 and 100.
    x_format:
        Format for position of WSS value in graph.

    Returns
    -------
    tuple:
        Tuple consisting of WSS value, x_positions, y_positions of WSS bar.
    """

    # if inclusions is state file
    if isinstance(inclusions, SqlStateV1):
        inclusions = _get_inclusions_from_state(inclusions)

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


def avg_time_to_discovery(inclusions, result_format="number"):
    """Estimate the Time to Discovery (TD) for each paper.

    Get the best/last estimate on how long it takes to find a paper.

    Arguments
    ---------
    result_format: str
        Desired output format: "number", "fraction" or "percentage".

    Returns
    -------
    dict:
        For each inclusion, key=paper_id, value=avg time.
    """
    pass
