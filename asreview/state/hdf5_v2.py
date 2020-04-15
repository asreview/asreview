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

import json
from datetime import datetime
from pathlib import Path

import h5py
import numpy as np
from scipy.sparse.csr import csr_matrix

from asreview.settings import ASReviewSettings
from asreview.state.hdf5 import HDF5State

RESIZE_CHUNK = 10000


class HDF5v2State(HDF5State):
    """Class for storing the review state with HDF5 storage."""
    version = "2.0"

    def __init__(self, state_fp, read_only=False):
        super(HDF5v2State, self).__init__(state_fp, read_only=read_only)

    def set_labels(self, y):
        if "labels" not in self.f:
            self.f.create_dataset("labels", y.shape, dtype=int, data=y)
        else:
            self.f["labels"][...] = y

    def set_final_labels(self, y):
        if "final_labels" not in self.f:
            self.f.create_dataset(
                "final_labels", y.shape, dtype=int, data=y)
        else:
            self.f["final_labels"][...] = y

    def set_current_queries(self, current_queries):
        str_queries = {str(key): value for key, value in current_queries.items()}
        data = np.string_(json.dumps(str_queries))
        self.f.attrs.pop("current_queries", None)
        self.f.attrs["current_queries"] = data

    def get_current_queries(self):
        str_queries = json.loads(self.f.attrs["current_queries"])
        return {int(key): value for key, value in str_queries.items()}

    def add_classification(self, idx, labels, methods, query_i):
        try:
            g = self.f["label_history"]
        except KeyError:
            g = self.f.create_group("label_history")

        if "idx" not in g:
            g.create_dataset("idx", (RESIZE_CHUNK,), dtype=int,
                             maxshape=(None,), chunks=True)
            g.create_dataset("labels", (RESIZE_CHUNK,), dtype=int,
                             maxshape=(None,), chunks=True)
            g.create_dataset("methods", (RESIZE_CHUNK,), dtype='S20',
                             maxshape=(None,), chunks=True)
            g.attrs["cur_size"] = 0
            g.attrs["max_size"] = RESIZE_CHUNK

        cur_size = g.attrs["cur_size"]
        max_size = g.attrs["max_size"]
        while cur_size + len(idx) > max_size:
            g["idx"].resize((max_size+RESIZE_CHUNK,))
            g["labels"].resize((max_size+RESIZE_CHUNK,))
            g["methods"].resize((max_size+RESIZE_CHUNK,))
            max_size += RESIZE_CHUNK
            g.attrs["max_size"] = max_size

        np_methods = np.array(list(map(np.string_, methods)), dtype='S20')
        new_size = cur_size + len(idx)
        g["idx"][cur_size:new_size] = idx
        g["labels"][cur_size:new_size] = labels
        g["methods"][cur_size:new_size] = np_methods
        g.attrs["cur_size"] += len(idx)

    def add_proba(self, pool_idx, train_idx, proba, query_i):
        cur_at_hist = self.f["label_history"].attrs["cur_size"]
        train_group = self.f["train_history"]
        if str(cur_at_hist) in train_group:
            g = train_group[cur_at_hist]
            g["proba"][...] = proba
        else:
            g = train_group.create_group(str(cur_at_hist))
            g.attrs["timestamp"] = np.string_(datetime.now())
            g.create_dataset("pool_idx", data=pool_idx, dtype=int)
            g.create_dataset("train_idx", data=train_idx, dtype=int)
            g.create_dataset("proba", data=proba, dtype=float)

    @property
    def settings(self):
        settings = self.f.attrs.get('settings', None)
        if settings is None:
            return None
        settings_dict = json.loads(settings)
        return ASReviewSettings(**settings_dict)

    @settings.setter
    def settings(self, settings):
        self.f.attrs.pop('settings', None)
        self.f.attrs['settings'] = np.string_(json.dumps(vars(settings)))

    def n_queries(self):
        keys = self.f['train_history'].keys()
        if len(keys) == 0:
            print("cur_size = ", self.f['label_history'].attrs["cur_size"])
            try:
                if self.f['label_history'].attrs["cur_size"] != 0:
                    return 1
                else:
                    return 0
            except AttributeError:
                return 0
        return len(keys) + 1

    def save(self):
        self.f.flush()

    def _add_as_data(self, as_data, feature_matrix=None):
        record_table = as_data.record_ids
        data_hash = as_data.hash()
        try:
            data_group = self.f["/data_properties"]
        except KeyError:
            data_group = self.f.create_group("/data_properties")

        try:
            as_data_group = data_group[data_hash]
        except KeyError:
            as_data_group = data_group.create_group(data_hash)

        if "record_table" not in as_data_group:
            as_data_group.create_dataset("record_table", data=record_table)

        if feature_matrix is None:
            return
        if isinstance(feature_matrix, np.ndarray):
            if "feature_matrix" in as_data_group:
                return
            as_data_group.create_dataset("feature_matrix", data=feature_matrix)
            as_data_group.attrs['matrix_type'] = np.string_("ndarray")
        elif isinstance(feature_matrix, csr_matrix):
            if "indptr" in as_data_group:
                return
            as_data_group.create_dataset("indptr", data=feature_matrix.indptr)
            as_data_group.create_dataset("indices", data=feature_matrix.indices)
            as_data_group.create_dataset("shape", data=feature_matrix.shape, dtype=int)
            as_data_group.create_dataset("data", data=feature_matrix.data)
            as_data_group.attrs["matrix_type"] = np.string_("csr_matrix")
        else:
            as_data_group.create_dataset("feature_matrix", data=feature_matrix)
            as_data_group.attrs["matrix_type"] = np.string_("unknown")

    def get_feature_matrix(self, data_hash):
        as_data_group = self.f[f"/data_properties/{data_hash}"]

        matrix_type = as_data_group.attrs["matrix_type"].decode("ascii")
        if matrix_type == "ndarray":
            return np.array(as_data_group["feature_matrix"])
        elif matrix_type == "csr_matrix":
            feature_matrix = csr_matrix((
                as_data_group["data"], as_data_group["indices"],
                as_data_group["indexptr"]), shape=as_data_group["shape"])
            return feature_matrix
        return as_data_group["feature_matrix"]

    def get(self, variable, query_i=None, idx=None):
        train_ids = sorted(map(int, self.f["train_history"].keys()))

        array = None
        if variable in ("proba", "pool_idx", "train_idx"):
            dtypes = {"proba": float, "pool_idx": int, "train_idx": int}
            if query_i is None or query_i == 0:
                raise KeyError()
            if query_i > 0:
                query_i -= 1
            g = self.f["train_history"][str(train_ids[query_i])]
            array = np.array(g[variable], dtype=dtypes[variable])

        elif variable in ("label_methods", "label_idx", "inclusions"):
            g = self.f["label_history"]
            cur_size = g.attrs["cur_size"]
            if variable == "label_methods":
                array = np.array(g["methods"]).astype('U20')[:cur_size]
            if variable == "label_idx":
                array = np.array(g["idx"], dtype=int)[:cur_size]
            if variable == "inclusions":
                array = np.array(g["labels"], dtype=int)[:cur_size]

            if query_i is not None and len(train_ids) != 0:
                train_ids = [0] + train_ids
                start = train_ids[query_i]
                try:
                    end = train_ids[query_i+1]
                except IndexError:
                    end = cur_size
                if query_i == -1:
                    if train_ids[-1] == cur_size:
                        start = train_ids[-2]
                        end = train_ids[-1]
                    else:
                        start = train_ids[-1]
                        end = cur_size

                if start == end:
                    raise IndexError()
                array = array[start:end]

        else:
            if variable == "labels":
                array = np.array(self.f["labels"], dtype=int)
            if variable == "final_labels":
                array = np.array(self.f["final_labels"], dtype=int)

        if array is None:
            return None

        if idx is not None:
            return array[idx]

        return array

    def delete_last_query(self):
        pass

    @property
    def file_version(self):
        try:
            return self.f.attrs['version'].decode("ascii")
        except KeyError:
            return self.version

    def restore(self, fp):
        if self.read_only:
            mode = 'r'
        else:
            mode = 'a'

        Path(fp).parent.mkdir(parents=True, exist_ok=True)
        self.f = h5py.File(fp, mode)
        if "version" not in self.f.attrs:
            self.initialize_structure()

#         if self.file_version != self.version:
#             raise ValueError(
#                 f"State cannot be read: state version {self.version}, "
#                 f"state file version {self.file_version}.")

    def initialize_structure(self):
        self.f.attrs['start_time'] = np.string_(datetime.now())
        self.f.attrs['settings'] = np.string_("{}")
        self.f.attrs['version'] = np.string_(self.version)
        self.f.create_group('train_history')
        self.f.create_group('label_history')
        self.f["label_history"].attrs["cur_size"] = 0
        self.f["label_history"].attrs["max_size"] = 0

    def close(self):
        self.f.close()
