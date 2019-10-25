import json
from collections import OrderedDict
from datetime import datetime
from pathlib import Path

import numpy as np

import asreview
from asreview.settings import ASReviewSettings


class JSON_Logger(object):
    """Class for logging the Systematic Review"""

    def __init__(self, log_fp, *_, read_only=False, **__):
        super(JSON_Logger, self).__init__()
        self.read_only = read_only
        self.version = "2.0"
        self.settings = None
        self.log_fp = log_fp
        self.restore(log_fp)

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

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

    def is_empty(self):
        return len(self._log_dict["results"]) == 0

    def set_labels(self, y):
        self._log_dict["labels"] = y.tolist()

    def add_settings(self, settings):
        self.settings = settings
        self._log_dict["settings"] = vars(settings)

    def add_classification(self, idx, labels, methods, query_i):
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
        if isinstance(idx, np.ndarray):
            indices = idx.tolist()
        if isinstance(labels, np.ndarray):
            labels = labels.tolist()
        if isinstance(methods, np.ndarray):
            methods = methods.tolist()

        new_dict = {'labelled': list(zip(indices, labels, methods))}
        self._add_to_log(new_dict, query_i, append_result=True)

    def add_proba(self, pool_idx, train_idx, proba, query_i):
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
        new_dict = {
            "pool_idx": pool_idx.tolist(),
            "train_idx": train_idx.tolist(),
            "proba": proba.tolist(),
        }
        self._add_to_log(new_dict, query_i)

    def n_queries(self):
        return len(self._log_dict["results"])

    def review_state(self):
        labels = np.array(self._log_dict["labels"], dtype=np.int)

        train_idx = []
        query_src = {}
        for query_i, res in enumerate(self._log_dict["results"]):
            if "labelled" not in res:
                continue
            label_idx = [x[0] for x in res["labelled"]]
            inclusions = [x[1] for x in res["labelled"]]
            label_meth = [x[2] for x in res["labelled"]]
            for i, meth in enumerate(label_meth):
                if meth not in query_src:
                    query_src[meth] = []
                query_src[meth].append(label_idx[i])
                labels[label_idx[i]] = inclusions[i]
            train_idx.extend(label_idx)
        if query_i > 0 and "labelled" not in self._log_dict["results"][-1]:
            query_i -= 1

        train_idx = np.array(train_idx, dtype=np.int)
        return labels, train_idx, query_src, query_i

    def save(self):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        self._log_dict["time"]["end_time"] = str(datetime.now())
        fp = Path(self.log_fp)

        if fp.is_file:
            fp.parent.mkdir(parents=True, exist_ok=True)

        with fp.open('w') as outfile:
            json.dump(self._log_dict, outfile, indent=2)

    def get(self, variable, query_i=None, idx=None):
        if query_i is not None:
            res = self._log_dict["results"][query_i]

        array = None
        if variable == "label_methods":
            array = res["labelled"]
            array = np.array([x[2] for x in array], dtype=str)
        elif variable in ["label_idx", "labelled"]:
            array = res["labelled"]
            array = np.array([x[0] for x in array], dtype=np.int)
        elif variable == "labels":
            array = np.array(self._log_dict["labels"], dtype=np.int)
        elif variable == "proba":
            array = np.array(res["proba"], dtype=np.float)
        elif variable == "train_idx":
            array = np.array(res["train_idx"], dtype=np.int)
        elif variable == "pool_idx":
            array = np.array(res["pool_idx"], dtype=np.int)
        if array is None:
            return None
        if idx is not None:
            return array[idx]
        return array

    def restore(self, fp):
        try:
            with open(fp, "r") as f:
                self._log_dict = OrderedDict(json.load(f))
            log_version = self._log_dict["version"]
            if log_version != self.version:
                raise ValueError(
                    f"Log cannot be read: logger version {self.version}, "
                    f"logfile version {log_version}.")
            self.settings = ASReviewSettings(**self._log_dict["settings"])
        except FileNotFoundError:
            self.create_structure()

    def create_structure(self):
        self._log_dict = OrderedDict({
            "time": {"start_time": str(datetime.now())},
            "version": self.version,
            "software_version": asreview.__version__,
            "settings": {},
            "results": [],
        })

    def close(self):
        if not self.read_only:
            self.save()
