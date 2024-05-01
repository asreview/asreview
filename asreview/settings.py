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

__all__ = ["ReviewSettings"]

import tomllib
from dataclasses import dataclass, replace

from asreview.config import DEFAULT_N_INSTANCES
from asreview.data import Dataset


@dataclass
class ReviewSettings:
    """Object to store the configuration of a review session.

    The main difference being that it type checks (some)
    of its contents.
    """

    model: str
    query_strategy: str
    balance_strategy: str
    feature_extraction: str
    n_instances: int = DEFAULT_N_INSTANCES
    stop_if: int
    n_prior_included: int
    n_prior_excluded: int
    as_data: Dataset
    model_param: dict
    query_param: dict
    balance_param: dict
    feature_param: dict

    def from_file(self, fp, load=None):
        """Fill the contents of settings by reading a config file.

        Arguments
        ---------
        fp: str, Path
            Review config file.
        load: object
            Config reader. Default tomllib.load
        """
        if load is None:
            load = tomllib.load

        with open(fp) as f:
            self = replace(self, load(f))
