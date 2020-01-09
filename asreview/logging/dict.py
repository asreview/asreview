# Copyright 2019 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from collections import OrderedDict
from datetime import datetime

import numpy as np

from asreview.analysis.statistics import _get_labeled_order
from asreview.analysis.statistics import _get_last_proba_order
from asreview.logging.base import BaseLogger


def get_serial_list(array, dtype=None):
    if isinstance(array, np.ndarray):
        array = array.tolist()
    if dtype is not None:
        array = list(map(dtype, array))
    return array


class DictLogger(BaseLogger):
    """Class for logging the Systematic Review with no storage."""
    version = "1.1"
    read_only = False

    def __init__(self, log_fp, *_, **__):
        super(DictLogger, self).__init__(log_fp)
        self.read_only = False

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        return self._print_logs()

    def _print_logs(self):
        self._log_dict["time"]["end_time"] = str(datetime.now())
        label_order, _ = _get_labeled_order(self)
        try:
            labels_assigned = self.get("labels")[label_order]
        except (KeyError, IndexError):
            return ""
        labels = list(zip(label_order, labels_assigned))

        log_str = "Labeled during review:\n\n"
        for label in labels:
            log_str += f"{label[0]} => {label[1]}\n"

        pool_order = _get_last_proba_order(self)
        if len(pool_order) > 0:
            log_str += "\n\n Most likely included according to ASReview:\n\n"
            for idx in pool_order:
                log_str += f"{idx}\n"

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

    def set_final_labels(self, y):
        self._log_dict["final_labels"] = y.tolist()

    def add_settings(self, settings):
        self.settings = settings
        self._log_dict["settings"] = vars(settings)

    def add_classification(self, idx, labels, methods, query_i):
        # Ensure that variables are serializable
        idx = get_serial_list(idx, int)
        labels = get_serial_list(labels, int)
        methods = get_serial_list(methods, str)

        new_dict = {'labelled': list(zip(idx, labels, methods))}
        self._add_to_log(new_dict, query_i, append_result=True)

    def add_proba(self, pool_idx, train_idx, proba, query_i):
        new_dict = {
            "pool_idx": get_serial_list(pool_idx, int),
            "train_idx": get_serial_list(train_idx, int),
            "proba": get_serial_list(proba, float),
        }
        self._add_to_log(new_dict, query_i)

    def n_queries(self):
        return len(self._log_dict["results"])

    def get(self, variable, query_i=None, idx=None):
        if query_i is not None:
            res = self._log_dict["results"][query_i]

        array = None
        label_vars = ["label_idx", "inclusions", "label_methods"]
        if variable in label_vars:
            array_id = label_vars.index(variable)
            if variable == "label_methods":
                dtype = str
            else:
                dtype = np.int
            array = np.array([x[array_id] for x in res["labelled"]],
                             dtype=dtype)
        elif variable == "labels":
            array = np.array(self._log_dict["labels"], dtype=np.int)
        elif variable == "final_labels":
            array = np.array(self._log_dict["final_labels"], dtype=np.int)
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

    def delete_last_query(self):
        self._log_dict["results"].pop()

    def initialize_structure(self):
        from asreview import __version__ as asr_version
        self._log_dict = OrderedDict({
            "time": {"start_time": str(datetime.now())},
            "version": self.version,
            "software_version": asr_version,
            "settings": {},
            "results": [],
        })

    def close(self):
        if not self.read_only:
            self.save()

    def save(self):
        print(self)

    def restore(self, *_, **__):
        self.initialize_structure()
