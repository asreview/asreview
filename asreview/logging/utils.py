import os
from contextlib import contextmanager


def _get_logger_class(fp):
    "Get logging class from file extension."
    from asreview.logging.hdf5 import HDF5Logger
    from asreview.logging.json import JSONLogger
    from asreview.logging.dict import DictLogger

    if fp is None:
        return DictLogger

    log_ext = os.path.splitext(fp)[1]
    if log_ext in ['.h5', '.hdf5', '.he5']:
        logger_class = HDF5Logger
    else:
        logger_class = JSONLogger
    return logger_class


@contextmanager
def open_logger(fp, *args, read_only=False, **kwargs):
    """Open a logger from a file.

    Arguments
    ---------
    fp: str
        File to open.
    read_only: bool
        Whether to open the file in read_only mode.

    Returns
    -------
    BaseLogger:
        Depending on the extension the appropriate logger is
        chosen:
        - [.h5, .hdf5, .he5] -> HDF5Logger.
        - None -> DictLogger (doesn't store anything permanently).
        - Anything else -> JSONLogger.
    """
    logger_class = _get_logger_class(fp)
    try:
        logger = logger_class(log_fp=fp, *args, read_only=read_only, **kwargs)
        yield logger
    finally:
        logger.close()


def loggers_from_dir(data_dir, prefix="result"):
    """Obtain a list of loggers from a directory.

    Arguments
    ---------
    data_dir: str
        Directory where to search for logging files.
    prefix: str
        Files starting with the prefix are assumed to be logging files.
        The rest is ignored.

    Returns
    -------
    dict:
        A dictionary of opened loggers, with their (base) filenames as keys.
    """
    loggers = {}
    files = os.listdir(data_dir)
    if not files:
        print(f"Error: {data_dir} is empty")
        return None

    for log_file in files:
        if not log_file.startswith(prefix):
            continue

        log_fp = os.path.join(data_dir, log_file)
        loggers[log_file] = open_logger(log_fp, read_only=True)

    return loggers
