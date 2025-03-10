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

from asreview.extensions import extensions


def _format_algorithm(values, name, description):
    s = f"  {name: <20}Available {description}:\n\n"

    result = []

    for x in values:
        padding = " " * 22 + x.name
        if hasattr(x, "dist") and x.dist:
            if x.dist.name != "asreview":
                padding += (
                    " " * (16 - len(x.name)) + f"[{x.dist.name} {x.dist.version}]"
                )
        result.append(padding)

    s += "\n".join(result)
    s += "\n\n"

    return s


def cli_algorithms(argv):  # noqa
    s = "Available active learning algorithms for ASReview. \n\n"

    s += _format_algorithm(
        values=extensions("models.feature_extractors"),
        name="feature_extractor",
        description="feature extraction algorithms",
    )

    s += _format_algorithm(
        values=extensions("models.classifiers"),
        name="classifiers",
        description="classification algorithms",
    )

    s += _format_algorithm(
        values=extensions("models.queriers"),
        name="query_strategies",
        description="query strategies",
    )

    s += _format_algorithm(
        values=extensions("models.balancers"),
        name="balance_strategies",
        description="balance strategies",
    )

    print(s)
