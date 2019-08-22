import os
from configparser import ConfigParser


SETTINGS_TYPE_DICT = {
    "data_file": str,
    "model": str,
    "query_strategy": str,
    "balance_strategy": str,
    "n_instances": str,
    "n_queries": str,
    "n_prior_included": int,
    "n_prior_excluded": int,
    "mode": str,
    "model_param": dict,
    "fit_param": dict,
    "query_param": dict,
    "balance_param": dict,
}


class ASReviewSettings(object):
    def __init__(self, model, n_instances, n_queries, n_prior_included,
                 n_prior_excluded, query_strategy,
                 balance_strategy, mode, data_fp, model_param={}, fit_param={},
                 query_param={}, balance_param={}
                 ):
        self.data_name = os.path.basename(data_fp)
        self.model = model
        self.n_instances = n_instances
        self.n_queries = n_queries
        self.n_prior_included = n_prior_included
        self.n_prior_excluded = n_prior_excluded
        self.query_strategy = query_strategy
        self.balance_strategy = balance_strategy
        self.mode = mode
        self.model_param = model_param
        self.fit_param = fit_param
        self.query_param = query_param
        self.balance_param = balance_param

    def from_file(self, config_file):
        if config_file is None or not os.path.isfile(config_file):
            if config_file is not None:
                print(f"Didn't find configuration file: {config_file}")
            return {}
    
        config = ConfigParser()
        config.read(config_file)
        
        # Read the each of the sections.
        for sect in config:
            if sect == "global_settings":
                for key, value in config.items(sect):
                    try:
                        setattr(self, key, SETTINGS_TYPE_DICT[key](value))
                    except (KeyError, TypeError):
                        print(f"Warning: value with key '{key}' is ignored (spelling mistake?).")
                        
            elif (sect == "model_param" or sect == "fit_param" or
                  sect == "query_param" or sect == "balance_param"):
                setattr(self, sect, dict(config.items(sect)))
            elif sect != "DEFAULT":
                print (f"Warning: section [{sect}] is ignored in "
                       f"config file {config_file}")
