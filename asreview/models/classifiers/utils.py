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

__all__ = []

import logging


def _set_class_weight(weight1):
    """Used various classifiers to have quicker learning."""
    if weight1 is None:
        return None
    weight0 = 1.0
    cw_class = {
        0: weight0,
        1: weight1,
    }
    logging.debug(f"Using class weights: 0 <- {weight0}, 1 <- {weight1}")
    return cw_class
