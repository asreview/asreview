# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
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

from asreview.entry_points.base import BaseEntryPoint
from asreview.models.balance import list_balance_strategies
from asreview.models.classifiers import list_classifiers
from asreview.models.feature_extraction import list_feature_extraction
from asreview.models.query import list_query_strategies


def _format_algorithm(values, name, description):

    s = f"  {name: <20}Available {description}:\n\n"

    result = []

    for x in values:
        if hasattr(x, "label"):
            result.append(
                " " * 22 + f"{x.name}" + " " * (16 - len(x.name)) + f"{x.label}"
            )
        else:
            result.append(" " * 22 + f"{x.name}")

    s += "\n".join(result)
    s += "\n\n"

    return s


class AlgorithmsEntryPoint(BaseEntryPoint):
    description = "Available active learning algorithms for ASReview."

    def execute(self, argv):

        s = "Available active learning algorithms for ASReview. \n\n"

        # classifiers
        s += _format_algorithm(
            values=list_classifiers(),
            name="classifiers",
            description="classification algorithms"
        )

        # query_strategies
        s += _format_algorithm(
            values=list_query_strategies(),
            name="query_strategies",
            description="query strategies"
        )

        # balance_strategies
        s += _format_algorithm(
            values=list_balance_strategies(),
            name="balance_strategies",
            description="balance strategies"
        )

        # feature_extraction
        s += _format_algorithm(
            values=list_feature_extraction(),
            name="feature_extraction",
            description="feature extraction algorithms"
        )

        print(s)
