import copy
import json
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

import asreview
import numpy as np
from asreview.settings import ASReviewSettings


def read_log(log_fp):
    """Read log file.

    Arguments
    ---------
    log_fp: str, pathlib.Path
        File path of the log file.

    Returns
    -------
    Logger:
        A Logger object with logs.
    """
    log_fp_path = Path(log_fp)

    try:
        with open(log_fp_path, "r") as f:

            log = Logger()
            log._log_dict = json.load(f)

            return log

    except Exception as err:
        raise err


def read_logs_from_dir(log_dir, prefix=None):
    """Read log files from directory.

    Arguments
    ---------
    log_dir: str, pathlib.Path
        Directory in which to find the log file(s).
    prefix: str
        Prefix for log files. For example 'result_'.

    Returns
    -------
    list:
        A list with Logger objects.
    """

    log_fp_path = Path(log_dir)

    if log_fp_path.is_dir():
        log_list = []

        for x in log_fp_path.iterdir():

            try:
                if prefix and not x.name.startswith(prefix):
                    continue
                log_list.append(read_log(x))
            except ValueError:
                pass

        return log_list
    raise ValueError("log_dir is not a valid directory.")


class Logger(object):
    """Class for logging the Systematic Review"""

    def __init__(self, log_fp=None):
        super(Logger, self).__init__()
        self.settings = None
        if log_fp is not None:
            self.restore(log_fp)
        else:
            # since python 3, this is an ordered dict
            self._log_dict = OrderedDict({
                "time": {"start_time": str(datetime.now())},
                "version": 1,
                "software_version": asreview.__version__,
                "results": [],
            })

    def __str__(self):
        return self._print_logs()

    def _print_logs(self):
        self._log_dict["time"]["end_time"] = str(datetime.now())
        log_str = "Logs of the Systematic Review process:\n"
        for i, value in self._log_dict.items():
            log_str += f"Query {i} - Reduction {value}"

        return log_str

    def _add_to_log(self, new_dict, i, append_result=False):
        # Find the first number that is not logged yet.
        results = self._log_dict["results"]
        if i is None:
            if (len(results) > 0
                    and set(new_dict.keys()).isdisjoint(results[-1])):
                i = len(results)-1
            else:
                i = len(results)

        while i >= len(results):
            results.append({})

        for key in new_dict:
            if key in results[i] and append_result:
                results[i][key].extend(new_dict[key])
            else:
                results[i][key] = new_dict[key]

    def add_settings(self, settings):
        self.settings = copy.deepcopy(settings)

    def add_labels(self, y):
        self._log_dict["labels"] = y.tolist()

    def add_classification(self, indices, labels, methods, i=None):
        """Add training indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for training.
        labels: list
            A list of labels corresponding with the training indices.
        i: int
            The query number.
        """

        # ensure that variables are serializable
        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        if isinstance(labels, np.ndarray):
            labels = labels.tolist()

        results = self._log_dict["results"]
        while i >= len(results):
            results.append({})

        label_methods = results[i].get("label_methods", [])
        for method in methods:
            if len(label_methods) and label_methods[-1][0] == method[1]:
                label_methods[-1][1] += 1
            else:
                label_methods.append([method[1], 1])

        new_dict = {'label_methods': label_methods}
        self._add_to_log(new_dict, i, append_result=False)
        new_dict = {'labelled': list(zip(indices, labels))}
        self._add_to_log(new_dict, i, append_result=True)

    def add_pool_predict(self, indices, pred, i=None):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for unlabeled pool.
        pred: np.array
            A list of predictions for those samples.
        i: int
            The query number.
        """

        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        pred = np.reshape(pred, -1)
        if isinstance(pred, np.ndarray):
            pred = pred.tolist()
        new_dict = {'predictions': list(zip(indices, pred))}
        self._add_to_log(new_dict, i, append_result=False)

    def add_proba(self, indices, pred_proba, logname="pool_proba", i=None):
        """Add inverse pool indices and their labels.

        Arguments
        ---------
        indices: list, np.array
            A list of indices used for unlabeled pool.
        pred: np.array
            Array of prediction probabilities for unlabeled pool.
        i: int
            The query number.
        """

        if isinstance(indices, np.ndarray):
            indices = indices.tolist()
        pred_proba = pred_proba[:, 1]
        if isinstance(pred_proba, np.ndarray):
            pred_proba = pred_proba.tolist()
        new_dict = {logname: list(zip(indices, pred_proba))}
        self._add_to_log(new_dict, i)

    def save(self, fp):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        self._log_dict["settings"] = copy.deepcopy(vars(self.settings))
        self._log_dict["settings"]["query_kwargs"].pop("pred_proba", None)
        self._log_dict["settings"]["query_kwargs"].pop("query_src", None)
        self._log_dict["settings"]["query_kwargs"].pop("current_queries", None)
        self._log_dict.move_to_end("settings", last=False)
        self._log_dict["time"]["end_time"] = str(datetime.now())
        fp = Path(fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        with fp.open('w') as outfile:
            json.dump(self._log_dict, outfile, indent=2)
        del self._log_dict["settings"]

    def restore(self, fp):
        with open(fp, "r") as f:
            self._log_dict = OrderedDict(json.load(f))
        self.settings = ASReviewSettings(**self._log_dict.pop("settings"))
