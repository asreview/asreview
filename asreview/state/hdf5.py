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
from asreview.state.errors import StateNotFoundError


LATEST_HDF5STATE_VERSION = "1.1"


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

    def __init__(self, read_only=True):
        super(HDF5State, self).__init__(read_only=read_only)

### OPEN, CLOSE, SAVE, INIT

    def _create_new_state_file(self, fp):

        if self.read_only:
            raise ValueError(
                "Can't create new state file in read_only mode."
            )

        # create folder to state file if not exist
        Path(fp).parent.mkdir(parents=True, exist_ok=True)

        self.f = h5py.File(fp, "a")
        self.f.attrs['start_time'] = np.string_(datetime.now())
        self.f.attrs['end_time'] = np.string_("")
        self.f.attrs['settings'] = np.string_("{}")
        self.f.attrs['version'] = np.string_(LATEST_HDF5STATE_VERSION)
        self.f.create_group('results')

        # TODO{CREATE Feature matrix group}

    def _restore(self, fp):
        """Restore the state file.

        Arguments
        ---------
        fp: str, pathlib.Path
            File path of the state file.
        """

        # If state already exist
        if not Path(fp).is_file():
            raise StateNotFoundError(f"State file {fp} doesn't exist.")

        # store read_only value
        mode = "r" if self.read_only else "a"

        # open or create state file
        self.f = h5py.File(fp, mode)

        try:
            if not self._is_valid_version():
                raise ValueError(
                    f"State cannot be read: state version {self.version}, "
                    f"state file version {self.version}.")
        except AttributeError as err:
            raise ValueError(
                f"Unexpected error when opening state file: {err}"
            )

    def save(self):
        """Save and close the state file."""
        self.f['end_time'] = str(datetime.now())
        self.f.flush()

    def close(self):
        # TODO{STATE} Merge with save?

        if not self.read_only:
            self.f.attrs['end_time'] = np.string_(datetime.now())

        self.f.close()

### PROPERTIES
    def _is_valid_version(self):
        """Check compatibility of state version."""
        # TODO check for version <= 1.1, should fail as well
        # QUESTION: Should all version < LATEST_HDF5STATE fail, or only versions
        # < LATEST_DEPRECATED_VERSION?
        return self.version[0] == LATEST_HDF5STATE_VERSION[0]

    @property
    def version(self):
        """Version number of the state file."""
        try:
            return self.f.attrs['version'].decode("ascii")
        except Exception:
            raise AttributeError("Attribute 'version' not found.")

    @property
    def start_time(self):
        """Init datetime of the state file."""
        try:
            return self.f.attrs['start_time']
        except Exception:
            raise AttributeError("Attribute 'start_time' not found.")

    @property
    def end_time(self):
        """Last modified (datetime) of the state file."""
        try:
            return self.f.attrs['end_time']
        except Exception:
            raise AttributeError("Attribute 'end_time' not found.")

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

### Features

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


### METHODS/FUNC
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

    @property
    def current_queries(self):
        """Get the current queries made by the model.

        This is useful to get back exactly to the state it was in before
        shutting down a review.

        Returns
        -------
        dict:
            The last known queries according to the state file.
        """
        str_queries = json.loads(self.f.attrs["current_queries"])
        return {int(key): value for key, value in str_queries.items()}

    @current_queries.setter
    def current_queries(self, current_queries):
        str_queries = {
            str(key): value
            for key, value in current_queries.items()
        }
        data = np.string_(json.dumps(str_queries))
        self.f.attrs.pop("current_queries", None)
        self.f.attrs["current_queries"] = data

    # add_labelling_data(..)
    def add_classification(self, idx, labels, methods, query_i):
        """Add all data of one labelling action."""
        # TODO(State): Do you need to enlarge maximum size of a HDF5 dataset? (See branch improved_h5_state)
        g = _result_group(self.f, query_i)
        if "new_labels" not in g:
            g.create_group("new_labels")

        g = g['new_labels']

        np_methods = np.array(list(map(np.string_, methods)))
        _append_to_dataset('idx', idx, g, dtype=np.int)
        _append_to_dataset('labels', labels, g, dtype=np.int)
        _append_to_dataset('methods', np_methods, g, dtype='S20')

    # def add_model_data(..)
    def add_proba(self, pool_idx, train_idx, proba, query_i):
        """Add data after finishing training of a model."""
        # TODO(State): Do you need to enlarge maximum size of a HDF5 dataset? (See branch improved_h5_state)
        g = _result_group(self.f, query_i)
        g.create_dataset("pool_idx", data=pool_idx, dtype=np.int)
        g.create_dataset("train_idx", data=train_idx, dtype=np.int)
        g.create_dataset("proba", data=proba, dtype=np.float)

    def n_queries(self):
        return (self.f['results/indices'].shape[0] -
                self.f['results'].attrs['n_priors'] + 1)
        # QUESTION: This treats the priors as one query, is that what you want?

    def _record_id_to_row_index(self, record_id):
        """Find the row index that corresponds to a given record id.

        Arguments
        ---------
        record_id: int
            Record_id of a record.

        Returns
        -------
        int:
            Row index of the given record_id in the dataset.
        """
        data_hash = list(self.f['data_properties'].keys())[0]
        record_table = self.f[f'data_properties/{data_hash}/record_table']
        return np.where(record_table[:] == record_id)[0][0]

    def _row_index_to_record_id(self, row_index):
        """Find the record_id that corresponds to a given row index.

        Arguments
        ----------
        row_index: int
            Row index.

        Returns
        -------
        str:
            Record_id of the record with given row index.

        """
        data_hash = list(self.f['data_properties'].keys())[0]
        record_table = self.f[f'data_properties/{data_hash}/record_table']
        return record_table[row_index]

    @property
    def n_priors(self):
        """Get the number of samples in the prior information.

        Returns
        -------
        int:
            Number of priors. If priors have not been selected returns None.
        """
        try:
            n_priors = self.f['results'].attrs['n_priors']
        except KeyError:
            n_priors = None
        return n_priors

    def _get_dataset(self, dataset, query=None, record_id=None):
        """Get a dataset from the state file, or only the part corresponding to a given query or record_id.

        Arguments
        ---------
        dataset: str
            Name of the dataset you want to get.
        query: int
            Only return the data of the given query, where query=0 correspond to the prior information.
        record_id: str/int
            Only return the data corresponding to the given record_id.

        Returns
        -------
        np.ndarray:
            If both query and record_id are None, return the full dataset.
            If query is given, return the data from that query, where the 0-th query is the prior information.
            If record_id is given, return the data corresponding record.
            If both are given it raises a ValueError.
        """
        if (query is not None) and (record_id is not None):
            raise ValueError("You can not search by record_id and query at the same time.")

        if query is not None:
            # 0 corresponds to all priors.
            if query == 0:
                dataset_slice = range(self.n_priors)
            # query_i is in spot (i + n_priors - 1).
            else:
                dataset_slice = [query + self.n_priors - 1]
        elif record_id is not None:
            # Convert record id to row index.
            idx = self._record_id_to_row_index(record_id)
            # Find where this row number was labelled.
            dataset_slice = np.where(self.f['results/indices'][:] == idx)[0]
        else:
            # Return the whole dataset.
            dataset_slice = range(self.f[f'results/{dataset}'].shape[0])

        return np.array(self.f[f'results/{dataset}'])[dataset_slice]

    def get_predictor_methods(self, query=None, record_id=None):
        """Get the predictor method from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the predictor method.
            If this is 0, you get the predictor method for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the predictor method.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with predictor methods in the labelling order,
            else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset(dataset='predictor_methods', query=query, record_id=record_id)

    def get_order_of_labelling(self):
        """Get full array of record id's in order that they were labelled.

        Returns
        -------
        np.ndarray:
            The record_id's in the order that they were labelled.
        """
        indices = self._get_dataset(dataset='indices')
        return np.array([self._row_index_to_record_id(idx) for idx in indices])

    def get_labels(self, query=None, record_id=None):
        """Get the labels from the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the label.
            If this is 0, you get the label for all the priors.
        record_id: str
            The record_id of the sample from which you want to obtain the label.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with labels in the labelling order,
            else it returns only the specific one determined by query or record_id.
        """
        return self._get_dataset('labels', query=query, record_id=record_id)

    def get_time(self, query=None, record_id=None):
        """Get the time of labelling the state file.

        Arguments
        ---------
        query: int
            The query number from which you want to obtain the time.
            If this is 0, you get the time the priors were entered,
            which is the same for all priors.
        record_id: str
            The record_id of the sample from which you want to obtain the time.

        Returns
        -------
        np.ndarray:
            If query and record_id are None, it returns the full array with times in the labelling order,
            else it returns only the specific one determined by query or record_id.
        """
        times = self._get_dataset('time', query=query, record_id=record_id)
        if query == 0:
            times = times[[self.n_priors-1]]
        return times


    def get(self, variable, query_i=None, idx=None):
        # TODO(State): Turn logic into if, elif, ..., elif, else.
        if query_i is not None:
            g = self.f[f"/results/{query_i}"]
        array = None
        # if variable == "label_methods":
        #     array = np.array(g["new_labels"]["methods"]).astype('U20')
        # if variable == "label_idx":
        #     array = np.array(g["new_labels"]["idx"], dtype=int)
        if variable == "predictor_methods":
            array = np.array(self.f['results/predictor_methods'])
        if variable == "indices":
            array = np.array(self.f['results/indices'], dtype=int)
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
