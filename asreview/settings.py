# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

import os
from configparser import ConfigParser
import logging

from asreview.config import DEFAULT_N_INSTANCES
from asreview.models.classifiers import get_classifier
from asreview.models.balance import get_balance_model
from asreview.models.query import get_query_model
from asreview.models.feature_extraction import get_feature_model
from asreview.utils import pretty_format
from asreview.types import type_n_queries


SETTINGS_TYPE_DICT = {
    "data_name": str,
    "model": str,
    "query_strategy": str,
    "balance_strategy": str,
    "feature_extraction": str,
    "n_papers": int,
    "n_instances": int,
    "n_queries": type_n_queries,
    "n_prior_included": int,
    "n_prior_excluded": int,
    "mode": str,
    "model_param": dict,
    "query_param": dict,
    "feature_param": dict,
    "balance_param": dict,
}


def _map_settings_type(name, value):

    if value is None:
        return None

    try:
        return SETTINGS_TYPE_DICT[name](value)
    except TypeError:
        raise TypeError(
            f"Can't convert setting '{name}' to {SETTINGS_TYPE_DICT[name]}"
        )


def _convert_types(par_defaults, param):
    """Convert strings from the config file to the appropriate type."""
    for par in param:
        try:
            par_type = type(par_defaults[par])
            if par_type == bool:
                param[par] = param[par] in ["True", "true", "T", "t", True]
            else:
                try:
                    param[par] = par_type(param[par])
                except TypeError:
                    raise TypeError(
                        f"Error converting key in config file: {par}")
        except KeyError:
            logging.warning(f"Parameter {par} does not have a default.\n"
                            f"Defaults: {par_defaults}.")


class ASReviewSettings(object):
    """Object to store the configuration of a review session.

    The main difference being that it type checks (some)
    of its contents.
    """
    def __init__(self,
                 mode,
                 model,
                 query_strategy,
                 balance_strategy,
                 feature_extraction,
                 n_instances=DEFAULT_N_INSTANCES,
                 n_queries=None,
                 n_papers=None,
                 n_prior_included=None,
                 n_prior_excluded=None,
                 abstract_only=False,
                 as_data=None,
                 model_param={},
                 query_param={},
                 balance_param={},
                 feature_param={},
                 data_name=None,
                 data_fp=None):

        self.mode = mode
        self.model = model
        self.query_strategy = query_strategy
        self.balance_strategy = balance_strategy
        self.feature_extraction = feature_extraction
        self.n_instances = n_instances
        self.n_queries = n_queries
        self.n_papers = n_papers
        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        self.abstract_only = abstract_only
        self.as_data = as_data
        self.model_param = model_param
        if query_strategy == "max_random":
            query_param_copy = query_param.copy()
            try:
                del query_param_copy["strategy_1"]
                del query_param_copy["strategy_2"]
            except KeyError:
                pass
            self.query_param = query_param_copy
        else:
            self.query_param = query_param
        self.balance_param = balance_param
        self.feature_param = feature_param

        if data_name:
            self.data_name = data_name
        elif data_fp:
            self.data_name = os.path.basename(data_fp)
        else:
            self.data_name = "unknown"

    def __str__(self):
        return pretty_format(self.to_dict())

    def __setattr__(self, name, value):

        try:
            super(ASReviewSettings, self).__setattr__(
                name,
                _map_settings_type(name, value)
            )
        except KeyError:
            super(ASReviewSettings, self).__setattr__(
                name,
                value
            )

    def to_dict(self):
        """Export default settings to dict."""
        info_dict = {}
        for attrib in SETTINGS_TYPE_DICT:
            value = getattr(self, attrib, None)
            if value is not None:
                info_dict[attrib] = value
        return info_dict

    def from_file(self, config_file):
        """Fill the contents of settings by reading a config file.

        Arguments
        ---------
        config_file: str
            Source configuration file.

        """
        if config_file is None or not os.path.isfile(config_file):
            if config_file is not None:
                print(f"Didn't find configuration file: {config_file}")
            return

        config = ConfigParser()
        config.optionxform = str
        config.read(config_file)

        # Read the each of the sections.
        for sect in config:
            if sect == "global_settings":
                for key, value in config.items(sect):
                    try:
                        setattr(self, key, SETTINGS_TYPE_DICT[key](value))
                    except (KeyError, TypeError):
                        print(f"Warning: value with key '{key}' is ignored "
                              "(spelling mistake, wrong type?).")

            elif sect in [
                    "model_param", "query_param", "balance_param",
                    "feature_param"
            ]:
                setattr(self, sect, dict(config.items(sect)))
            elif sect != "DEFAULT":
                print(f"Warning: section [{sect}] is ignored in "
                      f"config file {config_file}")

        model = get_classifier(self.model)
        _convert_types(model.default_param, self.model_param)
        balance_model = get_balance_model(self.balance_strategy)
        _convert_types(balance_model.default_param, self.balance_param)
        query_model = get_query_model(self.query_strategy)
        _convert_types(query_model.default_param, self.query_param)
        feature_model = get_feature_model(self.feature_extraction)
        _convert_types(feature_model.default_param, self.feature_param)
