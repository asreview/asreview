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


try:
    import tomllib
except ImportError:
    import tomli as tomllib

import json
from dataclasses import dataclass
from dataclasses import replace
from pathlib import Path
from typing import Optional

from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_CLASSIFIER
from asreview.config import DEFAULT_FEATURE_EXTRACTION
from asreview.config import DEFAULT_N_QUERY
from asreview.config import DEFAULT_QUERY_STRATEGY


@dataclass
class ReviewSettings:
    """Object to store the configuration of a review session.

    The main difference being that it type checks (some)
    of its contents.
    """

    classifier: str = DEFAULT_CLASSIFIER
    query_strategy: str = DEFAULT_QUERY_STRATEGY
    balance_strategy: str = DEFAULT_BALANCE_STRATEGY
    feature_extraction: str = DEFAULT_FEATURE_EXTRACTION
    classifier_param: Optional[dict] = None
    query_param: Optional[dict] = None
    balance_param: Optional[dict] = None
    feature_param: Optional[dict] = None
    n_query: int = DEFAULT_N_QUERY
    n_stop: Optional[int] = None
    n_prior_relevant: Optional[int] = None
    n_prior_irrelevant: Optional[int] = None
    prior_seed: Optional[int] = None
    seed: Optional[int] = None

    def from_file(self, fp, load=None):
        """Fill the contents of settings by reading a config file.

        Arguments
        ---------
        fp: str, Path
            Review config file.
        load: object
            Config reader. Default tomllib.load for TOML (.toml) files,
            otherwise json.load.
        """
        if load is None:
            if Path(fp).suffix == ".toml":
                load = tomllib.load
            else:
                load = json.load

        with open(fp, "rb") as f:
            self = replace(self, **load(f))

        return self
