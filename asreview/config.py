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

import numpy as np

AVAILABLE_CLI_MODI = ["oracle", "simulate"]
AVAILABLE_REVIEW_CLASSES = ["oracle", "simulate", "minimal"]

DEMO_DATASETS = {
    "example_ptsd": "https://raw.githubusercontent.com/msdslab/automated-systematic-review-datasets/master/datasets/Van_de_Schoot_PTSD/output/PTSD_VandeSchoot_18.csv",  # noqa
    "example_hall": "https://raw.githubusercontent.com/msdslab/automated-systematic-review-datasets/master/datasets/Four%20Software%20Engineer%20Data%20Sets/Software%20Engineering%201%20Hall.csv",  # noqa
    "example_cohen": "https://raw.githubusercontent.com/msdslab/automated-systematic-review-datasets/master/datasets/Cohen_EBM/output/ACEInhibitors.csv",  # noqa
}


NOT_AVAILABLE = np.nan

KERAS_MODELS = ["lstm_base", "lstm_pool"]

# CLI defaults
DEFAULT_MODEL = "nb"
DEFAULT_QUERY_STRATEGY = "max_random"
DEFAULT_BALANCE_STRATEGY = "triple"
DEFAULT_FEATURE_EXTRACTION = "tfidf"
DEFAULT_N_INSTANCES = 1
DEFAULT_N_PRIOR_INCLUDED = 10
DEFAULT_N_PRIOR_EXCLUDED = 10

GITHUB_PAGE = "https://github.com/msdslab/automated-systematic-review"
EMAIL_ADDRESS = "asreview@uu.nl"
