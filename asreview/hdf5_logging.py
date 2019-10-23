import json
from datetime import datetime

import h5py
import numpy as np
import itertools
from asreview.settings import ASReviewSettings


def _append_to_dataset(name, values, g, dtype):
    if name not in g:
        g.create_dataset(name, (len(values),), dtype=dtype, maxshape=(None,),
                         chunks=True)
    else:
        g[name].resize((len(g[name])+len(values),))
    dataset = g[name]
    dataset[len(g[name])-len(values):] = values


def _dict_from_group(g):
    g_dict = {}
    for key, value in g.attrs.items():
        g_dict[key] = value
    for key, value in g.items():
        if isinstance(value, h5py.Dataset):
            if value.shape is not None:
                new_arr = np.array(value)
                if str(new_arr.dtype).startswith('|S'):
                    new_arr = np.array(new_arr, dtype=str)
                g_dict[key] = new_arr.tolist()
        else:
            g_dict[key] = _dict_from_group(value)
    return g_dict


def _result_group(f, query_i):
    try:
        g = f[f'/results/{query_i}']
    except KeyError:
        g = f.create_group(f'/results/{query_i}')
        g.attrs['creation_time'] = np.string_(datetime.now())
    return g


class HDF5_Logger(object):
    """Class for logging the Systematic Review"""

    def __init__(self, log_fp, read_only=False):
        self.settings = None
        self.empty = True
        self._n_labels = None
        super(HDF5_Logger, self).__init__()
        self.read_only = read_only
        self.restore(log_fp, read_only=read_only)

#     def __del__(self):
#         self.close()

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.close()

    def __str__(self):
        log_str = "Attributes:\n--------------\n"
        for key, value in self.f.attrs.items():
            log_str += f"{key}: {value}\n"
        log_str += "\n\nGroups+datasets:\n---------------\n"
        log_str += str(list(self.f.keys()))
        return log_str

    def todict(self):
        hdf_dict = {}
        for key, value in self.f.attrs.items():
            if key == "settings":
                hdf_dict[key] = self.settings
            else:
                hdf_dict[key] = value

        for key, value in self.f.items():
            if isinstance(self.f[key], h5py.Dataset):
                if value.shape is not None:
                    hdf_dict[key] = np.array(value)

        hdf_dict["results"] = []
        for i in itertools.count():
            if str(i) not in self.f["results"]:
                break
            hdf_dict["results"].append(
                _dict_from_group(self.f["results"][str(i)]))

        return hdf_dict

    def is_empty(self):
        return len(self.f["results"]) == 0

    def set_labels(self, y):
        if "labels" not in self.f:
            self.f.create_dataset("labels", y.shape, dtype=np.int, data=y)
        else:
            self.f["labels"][...] = y

    def n_labels(self):
        if self._n_labels is None:
            self._n_labels = len(self.f["labels"])
        return self._n_labels

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
        g = _result_group(self.f, query_i)
        if "new_labels" not in g:
            g.create_group("new_labels")

        g = g['new_labels']

        np_methods = np.array(list(map(np.string_, methods)))
        _append_to_dataset('idx', idx, g, dtype=np.int)
        _append_to_dataset('labels', labels, g, dtype=np.int)
        _append_to_dataset('methods', np_methods, g, dtype='S20')

#         bool_array = np.full(self.n_labels(), False, dtype=bool)
#         bool_array[idx] = True
#         self.f["labels"][bool_array] = labels
#         for i, index in enumerate(idx):
#             self.f["labels"][index] = labels[i]

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

    def review_state(self):
        labels = np.array(self.f['labels'][:], dtype=np.int)

        train_idx = []
        query_src = {}
        for query_i in range(self.n_queries()):
            try:
                g = self.f[f'/results/{query_i}/new_labels']
            except KeyError:
                continue
            new_idx = g['idx'][:]
            methods = g['methods'][:]
            train_idx.extend(new_idx.tolist())
            for i in range(len(new_idx)):
                method = methods[i]
                idx = new_idx[i]
                if method not in query_src:
                    query_src[method] = []
                query_src[method].append(idx)

        train_idx = np.array(train_idx, dtype=np.int)
        query_i = self.n_queries()
        if 'new_labels' not in self.f[f'/results/{query_i-1}/new_labels']:
            query_i -= 1

        return labels, train_idx, query_src, query_i

    def save(self):
        """Save logs to file.

        Arguments
        ---------
        fp: str
            The file path to export the results to.

        """
        self.f['end_time'] = str(datetime.now())
        self.f.flush()

    def restore(self, fp, read_only=False):
        if read_only:
            mode = 'r'
        else:
            mode = 'a'

        self.f = h5py.File(fp, mode)
        try:
            settings_dict = json.loads(self.f.attrs['settings'])
            if "mode" in settings_dict:
                self.settings = ASReviewSettings(**settings_dict)
        except KeyError:
            self.create_structure()

    def create_structure(self):
        self.f.attrs['start_time'] = np.string_(datetime.now())
        self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.attrs['settings'] = np.string_("{}")
        self.f.create_group('results')

    def close(self):
        if not self.read_only:
            self.f.attrs['end_time'] = np.string_(datetime.now())
        self.f.close()
