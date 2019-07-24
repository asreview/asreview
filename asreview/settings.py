from abc import ABC
import os
from asreview.utils import config_from_file, _safe_dict_update


class ASReviewSettings(ABC):
    def __init__(self, model, n_instances, n_queries, n_prior_included,
                 n_prior_excluded, query_strategy,
                 balance_strategy, mode, data_fp):
        data_name = os.path.basename(data_fp)
        self._settings = {
            "data_file": (data_name, str),
            "model": (model.lower(), str),
            "query_strategy": (query_strategy, str),
            "balance_strategy": (balance_strategy, str),
            "n_instances": (n_instances, int),
            "n_queries": (n_queries, int),
            "n_prior_included": (n_prior_included, int),
            "n_prior_excluded": (n_prior_excluded, int),
            "mode": (mode, str),
            "model_param": ({}, dict),
            "fit_param": ({}, dict),
            "query_param": ({}, dict),
            "balance_param": ({}, dict),
        }

    def override(self, config_fp):
        new_config = config_from_file(config_fp)
        new_settings = _safe_dict_update(self._settings, new_config)
        return new_settings
