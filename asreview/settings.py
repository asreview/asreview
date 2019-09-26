import os
from configparser import ConfigParser

from asreview.config import DEFAULT_N_INSTANCES


SETTINGS_TYPE_DICT = {
    "data_file": str,
    "model": str,
    "query_strategy": str,
    "balance_strategy": str,
    "n_papers": int,
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
    """ Dictionary like object that stores the configuration of a
        review session. The main difference being that it type checks (some)
        of its contents.
    """
    def __init__(self, mode, model, query_strategy, balance_strategy,
                 n_instances=DEFAULT_N_INSTANCES, n_queries=None,
                 n_papers=None, n_prior_included=None, n_prior_excluded=None,
                 data_fp=None, data_name=None, model_param={}, fit_param={},
                 query_param={}, balance_param={}, **kwargs
                 ):
        all_args = locals().copy()
        del all_args["self"]
        del all_args["kwargs"]
        self._from_args(**all_args, **kwargs)

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

    def from_file(self, config_file):
        """ Fill the contents of settings by reading a config file.

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

            elif sect in ["model_param", "fit_param", "query_param",
                          "balance_param"]:
                setattr(self, sect, dict(config.items(sect)))
            elif sect != "DEFAULT":
                print (f"Warning: section [{sect}] is ignored in "
                       f"config file {config_file}")

    def __str__(self):
        info_str = "----------------------------\n"
        for attrib in SETTINGS_TYPE_DICT:
            value = getattr(self, attrib, None)
            if value is not None:
                info_str += attrib + ": " + str(value) + "\n"
        info_str += "----------------------------\n"
        return info_str
