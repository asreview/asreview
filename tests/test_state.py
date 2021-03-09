import os
import shutil
from pathlib import Path

import pytest

import numpy as np

from asreview.state import HDF5State
from asreview.state import open_state, state_from_asreview_file
from asreview.state.errors import StateNotFoundError
from asreview.settings import ASReviewSettings



# def check_write_state(tmpdir, state_file):
#     if state_file is not None:
#         state_fp = os.path.join(tmpdir, state_file)
#     else:
#         state_fp = None

#     settings = ASReviewSettings(mode="simulate",
#                                 model="nb",
#                                 query_strategy="rand_max",
#                                 balance_strategy="simple",
#                                 feature_extraction="tfidf")

#     n_records = 6
#     n_half = int(n_records / 2)
#     start_labels = np.full(n_records, np.nan, dtype=np.int)
#     labels = np.zeros(n_records, dtype=np.int)
#     labels[::2] = np.ones(n_half, dtype=np.int)
#     methods = np.full((n_records), "initial")
#     methods[2::] = np.full((int(n_records - 2)), "random")
#     methods[2::2] = np.full((int((n_records - 2) / 2)), "max")

#     with open_state(state_fp) as state:
#         state.settings = settings
#         state.set_labels(start_labels)
#         current_labels = np.copy(start_labels)
#         for i in range(n_records):
#             query_i = int(i / 2)
#             proba = None
#             if i >= 2 and (i % 2) == 0:
#                 proba = np.random.rand(n_records)
#             state.add_classification([i], [labels[i]], [methods[i]], query_i)
#             if proba is not None:
#                 state.add_proba(np.arange(i + 1, n_records), np.arange(i + 1),
#                                 proba, query_i)
#             current_labels[i] = labels[i]
#             state.set_labels(current_labels)
#             check_state(state, i, query_i, labels, methods, proba)


# def check_state(state, label_i, query_i, labels, methods, proba):
#     n_records = len(labels)

#     state_labels = state.get("labels")
#     assert len(state_labels) == len(labels)
#     for i in range(label_i + 1):
#         assert state_labels[i] == labels[i]
#     for i in range(label_i + 1, n_records):
#         assert state_labels[i] == np.full(1, np.nan, dtype=np.int)[0]

#     result_dict = state.to_dict()
#     cur_i = 0
#     for qi in range(query_i + 1):
#         res = result_dict["results"][qi]
#         max_i = cur_i + len(res["label_methods"])
#         for j in range(len(res["label_methods"])):
#             assert res["label_methods"][j] == methods[j + cur_i]
#         assert np.all(res["label_idx"] == np.arange(cur_i, max_i))
#         assert np.all(res["inclusions"] == labels[cur_i:max_i])
#         cur_i = max_i

#     if proba is not None:
#         res = result_dict["results"][query_i]
#         assert np.all(res["proba"] == proba)
#         assert np.all(res["pool_idx"] == list(range(label_i + 1, n_records)))
#         assert np.all(res["train_idx"] == list(range(0, label_i + 1)))

@pytest.mark.xfail(
    raises=StateNotFoundError,
    reason="State not found and in read_only mode"
)
def test_state_not_found():
    with open_state("this_file_doesnt_exist.h5") as state:
        pass


def test_read_basic_state():
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp) as state:
        assert isinstance(state, HDF5State)


def test_version_number_state():
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp) as state:
        assert state.version[0] == "1"


def test_read_only_state():
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp, read_only=True) as state1:
        end_time1 = state1.end_time

    with open_state(state_fp) as state2:
        end_time2 = state2.end_time

    assert end_time1 == end_time2

    # TODO{Try to modify and catch error}


def test_print_state():
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp) as state:
        print(state)


def test_settings_state():
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp) as state:
        assert isinstance(state.settings, ASReviewSettings)


def test_n_queries():
    NUM_QUERIES_IN_TEST = 2543
    state_fp = Path("tests", "hdf5_states", "basic_state.h5")
    with open_state(state_fp) as state:
        assert state.n_queries() == NUM_QUERIES_IN_TEST


# Test get by querying for the whole dataset everytime. I'll implement indexing
# at a later stage.
def test_get():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    METHODS = ['initial', 'initial', 'max', 'max']
    INDICES = [0, 3, 2, 1]
    LABELS = [1, 0, 1, 0]

    with open_state(state_fp) as state:
        assert all([x.encode('ascii') for x in METHODS] ==
                   state.get("predictor_methods"))
        assert all(INDICES == state.get("indices"))


# ##### tests for old HDF5 states
# def test_read_hdf5_state():
#     state_fp = Path("tests", "state_files", "test_1_inst.h5")
#     with open_state(state_fp) as state:
#         assert isinstance(state, HDF5State)


# def test_version_number_state():
#     state_fp = Path("tests", "state_files", "test_1_inst.h5")
#     with open_state(state_fp) as state:
#         assert state.version[0] == "1"


# def test_settings_state():
#     state_fp = Path("tests", "state_files", "test_1_inst.h5")
#     with open_state(state_fp) as state:
#         print(state.settings)
#         assert isinstance(state.settings, ASReviewSettings)


# def test_read_asreview_file():
#     state_fp = Path("tests", "state_files", "test_1_inst.asreview")
#     with state_from_asreview_file(str(state_fp)) as state:
#         assert isinstance(state, JSONState)


# def test_write_hdf5_state(tmpdir):
#     check_write_state(tmpdir, 'test.h5')

