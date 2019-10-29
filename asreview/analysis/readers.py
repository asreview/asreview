import os

from asreview.logging import Logger


def loggers_from_dir(data_dir, prefix="result"):
    "Obtain a list of loggers from a directory."
    loggers = {}
    files = os.listdir(data_dir)
    if not files:
        print(f"Error: {data_dir} is empty")
        return None

    for log_file in files:
        if not log_file.startswith(prefix):
            continue

        log_fp = os.path.join(data_dir, log_file)
        loggers[log_file] = Logger.from_file(log_fp, read_only=True).logger

    return loggers
