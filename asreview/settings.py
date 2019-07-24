import os
from configparser import ConfigParser


SETTINGS_TYPE_DICT = {
    "data_file": str,
    "model": str,
    "query_strategy": str,
    "balance_strategy": str,
    "n_instances": int,
    "n_queries": int,
    "n_prior_included": int,
    "n_prior_excluded": int,
    "mode": str,
    "model_param": dict,
    "fit_param": dict,
    "query_param": dict,
    "balance_param": dict,
}


class ASReviewSettings(object):
    def __init__(self, mode, model, query_strategy, balance_strategy,
                 n_instances, n_queries, n_prior_included=None,
                 n_prior_excluded=None, data_fp=None, data_name=None, model_param={},
                 fit_param={}, query_param={}, balance_param={}, **kwargs
                 ):
        all_args = locals().copy()
        del all_args["self"]
        del all_args["kwargs"]
        print(all_args)
        self._from_args(**all_args, **kwargs)
        
#     def __init__(self, data_fp=None, data_name=None, **kwargs):   

    def _from_args(self, **kwargs):
        for key in kwargs:
            try:
                setattr(self, key, SETTINGS_TYPE_DICT[key](kwargs[key]))
            except (KeyError, TypeError):
                setattr(self, key, kwargs[key])

        if "data_name" in kwargs and kwargs["data_name"] is not None:
            self.data_name = kwargs["data_name"]
        elif "data_fp" in kwargs and kwargs["data_fp"] is not None:
            self.data_name = os.path.basename(kwargs["data_fp"])
        else:
            self.data_name = "unknown"
#         for key in kwargs
#         self.model = model
#         self.n_instances = n_instances
#         self.n_queries = n_queries
#         self.n_prior_included = n_prior_included
#         self.n_prior_excluded = n_prior_excluded
#         self.query_strategy = query_strategy
#         self.balance_strategy = balance_strategy
#         self.mode = mode
#         self.model_param = model_param
#         self.fit_param = fit_param
#         self.query_param = query_param
#         self.balance_param = balance_param
#         

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
                        print(f"Warning: value with key '{key}' is ignored (spelling mistake"
                              ", wrong type?).")
                        
            elif (sect == "model_param" or sect == "fit_param" or
                  sect == "query_param" or sect == "balance_param"):
                setattr(self, sect, dict(config.items(sect)))
            elif sect != "DEFAULT":
                print (f"Warning: section [{sect}] is ignored in "
                       f"config file {config_file}")

