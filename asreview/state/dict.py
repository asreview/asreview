# Copyright 2019-2020 The ASReview Authors. All Rights Reserved.
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

from base64 import b64encode, b64decode
from collections import OrderedDict
from datetime import datetime
from io import BytesIO

import numpy as np
from scipy.sparse.csr import csr_matrix
from scipy.sparse import save_npz, load_npz

from asreview.analysis.statistics import _get_labeled_order
from asreview.analysis.statistics import _get_last_proba_order
from asreview.state.base import BaseState
from asreview.settings import ASReviewSettings


def get_serial_list(array, dtype=None):
    if isinstance(array, np.ndarray):
        array = array.tolist()
    if dtype is not None:
        array = list(map(dtype, array))
    return array


class DictState(BaseState):
    """Class for storing the state of a review with no permanent storage."""
    version = "1.1"
    read_only = False

    def __init__(self, state_fp, *_, **__):
        super(DictState, self).__init__(state_fp)
        self.read_only = False

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        return self._print_state()

    def _print_state(self):
        self._state_dict["time"]["end_time"] = str(datetime.now())
        label_order, _ = _get_labeled_order(self)
        try:
            labels_assigned = self.get("labels")[label_order]
        except (KeyError, IndexError):
            return ""
        labels = list(zip(label_order, labels_assigned))

        state_str = "Labeled during review:\n\n"
        for label in labels:
            state_str += f"{label[0]} => {label[1]}\n"

        pool_order = _get_last_proba_order(self)
        if len(pool_order) > 0:
            state_str += "\n\n Most likely included according to ASReview:\n\n"
            for idx in pool_order:
                state_str += f"{idx}\n"

        return state_str

    def _add_to_state(self, new_dict, i, append_result=False):
        # Find the first number that has not yet been used.
        results = self._state_dict["results"]
        if i is None:
            if (len(results) > 0 and
                    set(new_dict.keys()).isdisjoint(results[-1])):
                i = len(results) - 1
            else:
                i = len(results)

        while i >= len(results):
            results.append({})

        for key in new_dict:
            if key in results[i] and append_result:
                results[i][key].extend(new_dict[key])
            else:
                results[i][key] = new_dict[key]

    def _add_as_data(self, as_data, feature_matrix=None):
        record_table = as_data.record_ids
        data_hash = as_data.hash()

        if "data_properties" not in self._state_dict:
            self._state_dict["data_properties"] = {}

        data_properties = self._state_dict["data_properties"]
        if data_hash not in data_properties:
            data_properties[data_hash] = {}
        data_properties[data_hash]["record_table"] = record_table.tolist()
        if feature_matrix is None:
            return
        if isinstance(feature_matrix, np.ndarray):
            encoded_X = feature_matrix.tolist()
            matrix_type = "ndarray"
        elif isinstance(feature_matrix, csr_matrix):
            with BytesIO() as f:
                save_npz(f, feature_matrix)
                f.seek(0)
                encoded_X = b64encode(f.read()).decode('ascii')
            matrix_type = "csr_matrix"
        else:
            encoded_X = feature_matrix
            matrix_type = "unknown"
        data_properties[data_hash]["feature_matrix"] = encoded_X
        data_properties[data_hash]["matrix_type"] = matrix_type

    def get_feature_matrix(self, data_hash):
        my_data = self._state_dict["data_properties"][data_hash]
        encoded_X = my_data["feature_matrix"]
        matrix_type = my_data["matrix_type"]
        if matrix_type == "ndarray":
            return np.array(encoded_X)
        elif matrix_type == "csr_matrix":
            with BytesIO(b64decode(encoded_X)) as f:
                return load_npz(f)
        return encoded_X

    def get_current_queries(self):
        str_queries = self._state_dict["current_queries"]
        return {int(key): value for key, value in str_queries.items()}

    def set_current_queries(self, current_queries):
        self._state_dict["current_queries"] = current_queries

    def is_empty(self):
        return len(self._state_dict["results"]) == 0

    def set_labels(self, y):
        self._state_dict["labels"] = y.tolist()

    def set_final_labels(self, y):
        self._state_dict["final_labels"] = y.tolist()

    @property
    def settings(self):
        settings = self._state_dict.get("settings", None)
        if settings is None:
            return None
        return ASReviewSettings(**settings)

    @settings.setter
    def settings(self, settings):
        self._state_dict["settings"] = vars(settings)

    def add_classification(self, idx, labels, methods, query_i):
        # Ensure that variables are serializable
        idx = get_serial_list(idx, int)
        labels = get_serial_list(labels, int)
        methods = get_serial_list(methods, str)

        new_dict = {'labelled': list(zip(idx, labels, methods))}
        self._add_to_state(new_dict, query_i, append_result=True)

    def add_proba(self, pool_idx, train_idx, proba, query_i):
        new_dict = {
            "pool_idx": get_serial_list(pool_idx, int),
            "train_idx": get_serial_list(train_idx, int),
            "proba": get_serial_list(proba, float),
        }
        self._add_to_state(new_dict, query_i)

    def n_queries(self):
        return len(self._state_dict["results"])

    def get(self, variable, query_i=None, idx=None):
        if query_i is not None:
            res = self._state_dict["results"][query_i]

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
            array = np.array(self._state_dict["labels"], dtype=np.int)
        elif variable == "final_labels":
            array = np.array(self._state_dict["final_labels"], dtype=np.int)
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
        self._state_dict["results"].pop()

    def initialize_structure(self):
        from asreview import __version__ as asr_version
        self._state_dict = OrderedDict({
            "time": {
                "start_time": str(datetime.now())
            },
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
