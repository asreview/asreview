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

__all__ = [
    "Tfidf",
    "OneHot",
]

from asreview.models.feature_extraction.onehot import OneHot
from asreview.models.feature_extraction.tfidf import Tfidf

"""Feature extraction converts texts into features.

Feature extraction is the process of converting a list of texts into some kind
of feature matrix.

There are several feature extraction algorithms available. In configuration
files, parameters are found under the section ``[feature_param]``.

"""
