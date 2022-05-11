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

from asreview.data import ASReviewData
from asreview.models.feature_extraction.embedding_lstm import load_embedding
from asreview.models.feature_extraction.embedding_lstm import sample_embedding
from asreview.models.feature_extraction.embedding_lstm import text_to_features
from asreview.project import ASReviewProject
from asreview.project import open_state

from ._version import get_versions

__version__ = get_versions()['version']
del get_versions
