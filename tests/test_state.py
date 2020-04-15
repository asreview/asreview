import os
from pathlib import Path

import numpy as np

from asreview.state import JSONState, DictState
from asreview.state.hdf5_v1 import HDF5v1State
from asreview.state.hdf5_v2 import HDF5v2State
from asreview.state import open_state
from asreview.settings import ASReviewSettings
from asreview.config import LABEL_NA


def test_read_json_state():

    state_fp = Path("tests", "state_files", "test_1_inst.json")

    with open_state(str(state_fp)) as state:
        assert isinstance(state, JSONState)


def test_read_hdf5_v1_state():
    state_fp = Path("tests", "state_files", "test_1_inst_v1.h5")
    with open_state(str(state_fp), read_only=True) as state:
        assert isinstance(state, HDF5v1State)


def test_read_hdf5_v2_state():
    state_fp = Path("tests", "state_files", "test_1_inst_v2.h5")
    with open_state(str(state_fp), read_only=True) as state:
        assert isinstance(state, HDF5v2State)


def test_read_dict_state():
    with open_state(None) as state:
        assert isinstance(state, DictState)


def test_write_json_state(tmpdir):
    check_write_state(tmpdir, 'test.json')


def test_write_hdf5_state(tmpdir):
    check_write_state(tmpdir, 'test.h5')


def test_write_dict_state(tmpdir):
    check_write_state(tmpdir, None)


def check_write_state(tmpdir, state_file):
    if state_file is not None:
        state_fp = os.path.join(tmpdir, state_file)
    else:
        state_fp = None

    settings = ASReviewSettings(mode="simulate", model="nb",
                                query_strategy="rand_max",
                                balance_strategy="simple",
                                feature_extraction="tfidf")

    n_records = 6
    n_half = int(n_records/2)
    start_labels = np.full(n_records, LABEL_NA, dtype=int)
    labels = np.zeros(n_records, dtype=np.int)
    labels[::2] = np.ones(n_half, dtype=np.int)
    methods = np.full((n_records), "initial")
    methods[2::] = np.full((int(n_records-2)), "random")
    methods[2::2] = np.full((int((n_records-2)/2)), "max")
    print(start_labels)

    with open_state(state_fp) as state:
        state.settings = settings
        state.set_labels(start_labels)
        current_labels = np.copy(start_labels)
        for i in range(n_records):
            query_i = int(i/2)
            proba = None
            if i >= 2 and (i % 2) == 0:
                proba = np.random.rand(n_records)
            if proba is not None:
                state.add_proba(np.arange(i+1, n_records), np.arange(i+1),
                                proba, query_i)
            state.add_classification([i], [labels[i]], [methods[i]], query_i)
            current_labels[i] = labels[i]
            state.set_labels(current_labels)
            check_state(state, i, query_i, labels, methods, proba)


def check_state(state, label_i, query_i, labels, methods, proba):
    n_records = len(labels)

    state_labels = state.get("labels")
    assert len(state_labels) == len(labels)
    for i in range(label_i+1):
        assert state_labels[i] == labels[i]
    for i in range(label_i+1, n_records):
        assert state_labels[i] == np.full(1, LABEL_NA, dtype=np.int)[0]

    result_dict = state.to_dict()
    print(state.n_queries())
    print(result_dict)
    cur_i = 0
    for qi in range(query_i+1):
        res = result_dict["results"][qi]
        max_i = cur_i + len(res["label_methods"])
        for j in range(len(res["label_methods"])):
            assert res["label_methods"][j] == methods[j+cur_i]
        assert np.all(res["label_idx"] == np.arange(cur_i, max_i))
        assert np.all(res["inclusions"] == labels[cur_i:max_i])
        cur_i = max_i

    if proba is not None:
        res = result_dict["results"][query_i]
        assert np.all(res["proba"] == proba)
        assert np.all(res["pool_idx"] == list(range(label_i+1, n_records)))
        assert np.all(res["train_idx"] == list(range(0, label_i+1)))
