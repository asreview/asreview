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

from asreview.settings import ASReviewSettings
from asreview.logging.base import BaseLogger


def _append_to_dataset(name, values, g, dtype):
    if name not in g:
        g.create_dataset(name, (len(values),), dtype=dtype, maxshape=(None,),
                         chunks=True)
    else:
        g[name].resize((len(g[name])+len(values),))
    dataset = g[name]
    dataset[len(g[name])-len(values):] = values


def _result_group(f, query_i):
    try:
        g = f[f'/results/{query_i}']
    except KeyError:
        g = f.create_group(f'/results/{query_i}')
        g.attrs['creation_time'] = np.string_(datetime.now())
    return g


class HDF5Logger(BaseLogger):
    """Class for logging a Systematic Review with HDF5 storage."""
    version = "1.1"

    def __init__(self, log_fp, read_only=False):
        super(HDF5Logger, self).__init__(log_fp, read_only=read_only)

    def set_labels(self, y):
        if "labels" not in self.f:
            self.f.create_dataset("labels", y.shape, dtype=np.int, data=y)
        else:
            self.f["labels"][...] = y

    def set_final_labels(self, y):
        if "final_labels" not in self.f:
            self.f.create_dataset(
                "final_labels", y.shape, dtype=np.int, data=y)
        else:
            self.f["final_labels"][...] = y

    def add_classification(self, idx, labels, methods, query_i):
        g = _result_group(self.f, query_i)
        if "new_labels" not in g:
            g.create_group("new_labels")

        g = g['new_labels']

        np_methods = np.array(list(map(np.string_, methods)))
        _append_to_dataset('idx', idx, g, dtype=np.int)
        _append_to_dataset('labels', labels, g, dtype=np.int)
        _append_to_dataset('methods', np_methods, g, dtype='S20')

    def add_proba(self, pool_idx, train_idx, proba, query_i):
        g = _result_group(self.f, query_i)
        g.create_dataset("pool_idx", data=pool_idx, dtype=np.int)
        g.create_dataset("train_idx", data=train_idx, dtype=np.int)
        g.create_dataset("proba", data=proba, dtype=np.float)

    def add_settings(self, settings):
        self.settings = settings
        self.f.attrs.pop('settings', None)
        self.f.attrs['settings'] = np.string_(json.dumps(vars(settings)))

    def n_queries(self):
        return len(self.f['results'].keys())

    def save(self):
        self.f['end_time'] = str(datetime.now())
        self.f.flush()

    def get(self, variable, query_i=None, idx=None):
        if query_i is not None:
            g = self.f[f"/results/{query_i}"]
        array = None
        if variable == "label_methods":
            array = np.array(g["new_labels"]["methods"]).astype('U20')
        if variable == "label_idx":
            array = np.array(g["new_labels"]["idx"], dtype=int)
        if variable == "inclusions":
            array = np.array(g["new_labels"]["labels"], dtype=int)
        if variable == "proba":
            array = np.array(g["proba"], dtype=np.float)
        if variable == "labels":
            array = np.array(self.f["labels"], dtype=np.int)
        if variable == "final_labels":
            array = np.array(self.f["final_labels"], dtype=np.int)
        if variable == "pool_idx":
            array = np.array(g["pool_idx"], dtype=np.int)
        if variable == "train_idx":
            array = np.array(g["train_idx"], dtype=np.int)
        if array is None:
            return None
        if idx is not None:
            return array[idx]
        return array

    def delete_last_query(self):
        query_i_last = self.n_queries()-1
        del self.f[f"/results/{query_i_last}"]

    def restore(self, fp):
        if self.read_only:
            mode = 'r'
        else:
            mode = 'a'

        Path(fp).parent.mkdir(parents=True, exist_ok=True)
        self.f = h5py.File(fp, mode)
        try:
            log_version = self.f.attrs['version'].decode("ascii")
            if log_version != self.version:
                raise ValueError(
                    f"Log cannot be read: logger version {self.version}, "
                    f"logfile version {log_version}.")
            settings_dict = json.loads(self.f.attrs['settings'])
            if "mode" in settings_dict:
                self.settings = ASReviewSettings(**settings_dict)
        except KeyError:
            self.initialize_structure()

    def initialize_structure(self):
        self.f.attrs['start_time'] = np.string_(datetime.now())
        self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.attrs['settings'] = np.string_("{}")
        self.f.attrs['version'] = np.string_(self.version)
        self.f.create_group('results')

    def close(self):
        if not self.read_only:
            self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.close()
