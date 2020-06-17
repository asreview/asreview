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

AVAILABLE_CLI_MODI = ["simulate"]
AVAILABLE_REVIEW_CLASSES = ["simulate", "minimal"]

LABEL_NA = -1

KERAS_MODELS = ["lstm_base", "lstm_pool"]

# CLI defaults
DEFAULT_MODEL = "nb"
DEFAULT_QUERY_STRATEGY = "max_random"
DEFAULT_BALANCE_STRATEGY = "triple"
DEFAULT_FEATURE_EXTRACTION = "tfidf"
DEFAULT_N_INSTANCES = 1
DEFAULT_N_PRIOR_INCLUDED = 1
DEFAULT_N_PRIOR_EXCLUDED = 1

GITHUB_PAGE = "https://github.com/asreview/asreview"
EMAIL_ADDRESS = "asreview@uu.nl"

STATE_EXTENSIONS = ['.h5', '.hdf5', '.he5', '.json']
LOGGER_EXTENSIONS = STATE_EXTENSIONS

COLUMN_DEFINITIONS = [
    ["final_included", "label", "label_included", "included_label",
     "included_final", "included", "included_flag", "include"],
    ["abstract_included", "included_abstract", "included_after_abstract"],
    ['title', 'primary_title'],
    ['authors', 'author names', 'first_authors'],
    ['abstract', 'abstract note'],
    ['keywords'],
]
