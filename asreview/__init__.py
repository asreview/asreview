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

from asreview.logging.utils import open_logger
from asreview.feature_extraction.embedding_lstm import load_embedding
from asreview.feature_extraction.embedding_lstm import sample_embedding
from asreview.feature_extraction.embedding_lstm import text_to_features
from asreview.readers import ASReviewData
from asreview.readers import read_csv
from asreview.readers import read_data
from asreview.readers import read_excel
from asreview.readers import read_pubmed_xml
from asreview.readers import read_ris
from asreview.review import get_reviewer
from asreview.review import MinimalReview
from asreview.review import review
from asreview.review import review_oracle
from asreview.review import review_simulate
from asreview.review import ReviewOracle
from asreview.review import ReviewSimulate

from ._version import get_versions
__version__ = get_versions()['version']
del get_versions
