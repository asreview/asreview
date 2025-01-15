# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

DEFAULT_BALANCE = "balanced"
DEFAULT_FEATURE_EXTRACTION = "tfidf"
DEFAULT_QUERY = "max"
DEFAULT_CLASSIFIER = "nb"

__all__ = [
    "balance",
    "classifiers",
    "feature_extraction",
    "query",
    "DEFAULT_BALANCE",
    "DEFAULT_FEATURE_EXTRACTION",
    "DEFAULT_QUERY",
    "DEFAULT_CLASSIFIER",
]

"""Active learning model components.

Components like classifiers, query strategies, balance strategies, and
feature_extraction techniques."""
