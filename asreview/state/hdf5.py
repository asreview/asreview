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

import json
from datetime import datetime
from pathlib import Path

import h5py
import numpy as np
from scipy.sparse.csr import csr_matrix

from asreview.settings import ASReviewSettings
from asreview.state.base import BaseState


LATEST_HDF5STATE_VERSION = "1.1"


class StateNotFoundError(FileNotFoundError):
    pass


def _append_to_dataset(name, values, g, dtype):
    if name not in g:
        g.create_dataset(name, (len(values), ),
                         dtype=dtype,
                         maxshape=(None, ),
                         chunks=True)
    else:
        g[name].resize((len(g[name]) + len(values), ))
    dataset = g[name]
    dataset[len(g[name]) - len(values):] = values


def _result_group(f, query_i):
    try:
        g = f[f'/results/{query_i}']
    except KeyError:
        g = f.create_group(f'/results/{query_i}')
        g.attrs['creation_time'] = np.string_(datetime.now())
    return g


class HDF5State(BaseState):
    """Class for storing the review state with HDF5 storage.

    Arguments
    ---------
    read_only: bool
        Open state in read only mode. Default False.
    """

    def __init__(self, read_only=False):
        super(HDF5State, self).__init__(read_only=read_only)

    @property
    def version(self):
        """Version number of the state file."""
        try:
            return self.f.attrs['version'].decode("ascii")
        except Exception:
            raise AttributeError("Attribute 'version' not found.")

    def _is_valid_version(self):
        """Check compatibility of state version."""
        # TODO check for version <= 1.1, should fail as well

        return self.version[0] == LATEST_HDF5STATE_VERSION[0]

    def _initialize_structure(self):
        self.f.attrs['start_time'] = np.string_(datetime.now())
        self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.attrs['settings'] = np.string_("{}")
        self.f.attrs['version'] = np.string_(LATEST_HDF5STATE_VERSION)
        self.f.create_group('results')

    def restore(self, fp, read_only=False, init_on_missing=True):
        """Init or restore the state file.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path of the state file.
        read_only: bool
            Open state in read only mode. Default False.
        init_on_missing: bool
            Create new state file if it doesn't exist. Default True.
        """

        # store read_only value
        self.read_only = read_only
        mode = "r" if self.read_only else "a"

        # create folder to state file if not exist
        Path(fp).parent.mkdir(parents=True, exist_ok=True)

        # open the HDF5 file
        self.f = h5py.File(fp, mode)

        try:
            if not self._is_valid_version():
                raise ValueError(
                    f"State cannot be read: state version {self.version}, "
                    f"state file version {self.version}.")
        except AttributeError:
            if init_on_missing:
                self._initialize_structure()
            else:
                raise StateNotFoundError(f"State file {fp} doesn't exist.")

    def save(self):
        """Save and close the state file."""
        self.f['end_time'] = str(datetime.now())
        self.f.flush()

    def close(self):
        # TODO{STATE} Merge with save?
        if not self.read_only:
            self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.close()

    @property
    def settings(self):
        """Settings of the ASReview pipeline.

        Settings like models.

        Example
        -------

        Example of settings.

            model             : nb
            query_strategy    : max_random
            balance_strategy  : triple
            feature_extraction: tfidf
            n_instances       : 1
            n_queries         : 1
            n_prior_included  : 10
            n_prior_excluded  : 10
            mode              : simulate
            model_param       : {'alpha': 3.822}
            query_param       : {'strategy_1': 'max', 'strategy_2': 'random', 'mix_ratio': 0.95}
            feature_param     : {}
            balance_param     : {'a': 2.155, 'alpha': 0.94, ... 'gamma': 2.0, 'shuffle': True}
            abstract_only     : False

        """
        settings = self.f.attrs.get('settings', None)
        if settings is None:
            return None
        settings_dict = json.loads(settings)
        return ASReviewSettings(**settings_dict)

    @settings.setter
    def settings(self, settings):
        self.f.attrs.pop('settings', None)
        self.f.attrs['settings'] = np.string_(json.dumps(vars(settings)))

    # def set_labels(self, y):
    # Remove this
    #     """Set the initial labels as of the dataset.

    #     y: list
    #         List of outcome labels.
    #     """

    #     if "labels" not in self.f:
    #         # key labels doesn't exist, create and fill with data
    #         self.f.create_dataset("labels", y.shape, dtype=np.int, data=y)
    #     else:
    #         # exists, but overwrite
    #         self.f["labels"][...] = y

    # def set_final_labels(self, y):
    #     # Seems to be deprecated
    #     if "final_labels" not in self.f:
    #         self.f.create_dataset("final_labels",
    #                               y.shape,
    #                               dtype=np.int,
    #                               data=y)
    #     else:
    #         self.f["final_labels"][...] = y

    def set_current_queries(self, current_queries):
        str_queries = {
            str(key): value
            for key, value in current_queries.items()
        }
        data = np.string_(json.dumps(str_queries))
        self.f.attrs.pop("current_queries", None)
        self.f.attrs["current_queries"] = data

    def get_current_queries(self):
        str_queries = json.loads(self.f.attrs["current_queries"])
        return {int(key): value for key, value in str_queries.items()}

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

    def n_queries(self):
        return len(self.f['results'].keys())

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
            as_data_group.create_dataset("indices",
                                         data=feature_matrix.indices)
            as_data_group.create_dataset("shape",
                                         data=feature_matrix.shape,
                                         dtype=int)
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
            feature_matrix = csr_matrix(
                (as_data_group["data"], as_data_group["indices"],
                 as_data_group["indexptr"]),
                shape=as_data_group["shape"])
            return feature_matrix
        return as_data_group["feature_matrix"]

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
        # if variable == "labels":
        #     array = np.array(self.f["labels"], dtype=np.int)
        # if variable == "final_labels":
        #     array = np.array(self.f["final_labels"], dtype=np.int)
        if variable == "pool_idx":
            array = np.array(g["pool_idx"], dtype=np.int)
        if variable == "train_idx":
            array = np.array(g["train_idx"], dtype=np.int)
        if array is None:
            return None
        if idx is not None:
            return array[idx]
        return array

    # def delete_last_query(self):
    #     # Nowhere found
    #     query_i_last = self.n_queries() - 1
    #     del self.f[f"/results/{query_i_last}"]
