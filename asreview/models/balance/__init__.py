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
    "Balanced",
]

from asreview.models.balance.balanced import Balanced

"""Balance strategies to rebalance and reorder the training data.

There are several balance strategies that rebalance and reorder the
training data. This is sometimes necessary, because the data is often
very imbalanced: there are many more records that should be excluded than
included (otherwise, automation cannot help much anyway).

There are several balance strategies available. In configuration
files, parameters are found under the section ``[balance_param]``.
"""
