import json
from datetime import datetime
from pathlib import Path
import copy


import numpy as np

import asreview
from asreview.settings import ASReviewSettings
from collections import OrderedDict


def query_key(query_i):
    return str(query_i)


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
                else:
                    log_list.append(read_log(x))
            except ValueError:
                pass

        return log_list
    else:
        raise ValueError("log_dir is not a valid directory.")


class Logger(object):
    """Class for logging the Systematic Review"""

    def __init__(self, log_fp=None):
        super(Logger, self).__init__()
        if log_fp is not None:
            self.restore(log_fp)
        else:
            # since python 3, this is an ordered dict
            self._log_dict = OrderedDict({
                "time": {"start_time": str(datetime.now())},
                "version": 1,
                "software_version": asreview.__version__
            })

    def __str__(self):
        return self._print_logs()

    def _print_logs(self):
        self._log_dict["time"]["end_time"] = str(datetime.now())
        s = "Logs of the Systematic Review process:\n"
        for i, value in self._log_dict.items():
            s += f"Query {i} - Reduction {value}"

        return s

    def _add_log(self, new_dict, i):
        # Find the first number that is not logged yet.
        if i is None:
            i = 0
            qk = query_key(i)
            while qk in self._log_dict:
                # If the keys of the new dictionary don't exist, this is it.
                if set(new_dict.keys()).isdisjoint(self._log_dict[qk].keys()):
                    break
                i += 1
                qk = query_key(i)

        qk = query_key(i)
        if qk not in self._log_dict:
            self._log_dict[qk] = {}

        self._log_dict[qk].update(new_dict)

    def add_settings(self, settings):
        self.settings = copy.deepcopy(settings)

    def add_labels(self, y):
        self._log_dict["labels"] = y.tolist()

    def add_query_info(self, query_kwargs, i=None):
        if 'last_bounds' not in query_kwargs:
            print("Error: lastbounds not found/.")
            return
        new_dict = {
            'label_methods':
                query_kwargs['last_bounds']
        }
        self._add_log(new_dict, i)

    def add_training_log(self, indices, labels, i=None):
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
        new_dict = {'labelled': list(zip(indices, labels))}
        self._add_log(new_dict, i)

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
        self._add_log(new_dict, i)

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
        self._add_log(new_dict, i)

    def save(self, fp):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        self._log_dict["settings"] = copy.deepcopy(vars(self.settings))
        self._log_dict["settings"]["query_kwargs"].pop("src_query_idx", None)
        self._log_dict["settings"]["query_kwargs"].pop("pred_proba", None)
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

    def get_src_query_idx(self):
        # Reinstate the random/max sampling information.
        i = 0
        qk = query_key(i)
        src_query_idx = {"random": []}
#         rand_idx = []
#         max_idx = []
        while qk in self._log_dict:
            if "labelled" not in self._log_dict[qk]:
                i += 1
                qk = query_key(i)
                continue
            if "label_methods" not in self._log_dict[qk]:
                src_query_idx["random"].extend(self._log_dict[qk]["labelled"])
            else:
                for bound in self._log_dict[qk]["label_methods"]:
                    query_type = bound[0]
                    start = bound[1]
                    end = bound[2]
                    idx = self._log_dict[qk]["labelled"][start:end]
                    if query_type not in src_query_idx:
                        src_query_idx[query_type] = []
                    src_query_idx[query_type].extend(idx)
            i += 1
            qk = query_key(i)
        for query_type in src_query_idx:
            src_query_idx[query_type] = np.array(
                [x[0] for x in src_query_idx[query_type]], dtype=int)
        return src_query_idx

