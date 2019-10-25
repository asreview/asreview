import os

from asreview.hdf5_logging import HDF5_Logger
from asreview.json_logging import JSON_Logger


def get_logger_class(fp):
    if fp is None:
        return None

    log_ext = os.path.splitext(fp)[1]
    if log_ext in ['.h5', '.hdf5', '.he5']:
        Logger = HDF5_Logger
    else:
        Logger = JSON_Logger
    return Logger


class Logger(object):
    def __init__(self, logger):
        self.logger = logger

    def __enter__(self):
        return self.logger.__enter__()

    def __exit__(self, *args, **kwargs):
        self.logger.__exit__(*args, **kwargs)

    @classmethod
    def from_file(cls, log_fp, *args, **kwargs):
        logger = get_logger_class(log_fp)(log_fp=log_fp, *args, **kwargs)
        return cls(logger)
