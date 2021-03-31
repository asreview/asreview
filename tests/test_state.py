import os
import shutil
import datetime
from pathlib import Path

import pytest

import numpy as np

from asreview import ASReviewData
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
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert isinstance(state, HDF5State)


def test_version_number_state():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert state.version[0] == "1"


def test_read_only_state():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp, read_only=True) as state1:
        end_time1 = state1.end_time

    with open_state(state_fp) as state2:
        end_time2 = state2.end_time

    assert end_time1 == end_time2

    # TODO{Try to modify and catch error}


def test_print_state():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        print(state)


def test_settings_state():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert isinstance(state.settings, ASReviewSettings)


def test_current_queries():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert isinstance(state.current_queries, dict)
        assert len(state.current_queries.keys()) > 0


def test_n_records_labeled():
    NUM_RECORDS_LABELED_IN_TEST = 4
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert state.n_records_labeled == NUM_RECORDS_LABELED_IN_TEST


# TODO (State): Test with n_instance > 1.
def test_n_predictor_models():
    NUM_PREDICTOR_MODELS_IN_TEST = 3
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert state.n_predictor_models == NUM_PREDICTOR_MODELS_IN_TEST


def test_n_priors():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        assert state.n_priors == 2


def test_is_valid_state(tmpdir):
    state_fp = Path(tmpdir, 'test.h5')
    with open_state(state_fp, read_only=False) as state:
        state._is_valid_state()


# def test_append_to_dataset(tmpdir):
#     state_fp = Path(tmpdir, 'test.h5')
#     indices = [1, 4, 9, 16, 25]
#     labels = [1, 0, 1, 0, 1]
#
#     with open_state(state_fp, read_only=False) as state:
#         state._append_to_dataset('indices', indices[0])
#         assert state.f['results/indices'].shape[0] == 1



# TODO(STATE): Make example of state file where record ids are strings.
def test_row_index_to_record_id():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    RECORD_IDS = [0, 1, 4, 5]

    with open_state(state_fp) as state:
        for i in range(4):
            assert state._row_index_to_record_id(i) == RECORD_IDS[i]


def test_record_id_to_row_index():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    RECORD_IDS = [0, 1, 4, 5]

    with open_state(state_fp) as state:
        for i in range(4):
            assert state._record_id_to_row_index(RECORD_IDS[i]) == i


@pytest.mark.xfail(
    raises=ValueError,
    reason="You can not search by record_id and query at the same time."
)
def test_get_dataset_fail():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    with open_state(state_fp) as state:
        state._get_dataset('labels', query=0, record_id=0)


def test_get_dataset():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    INDICES = [0, 3, 2, 1]
    RECORD_IDS = [0, 1, 4, 5]
    TIMES = [1607095116822064, 1607095116822064, 1607095116833420, 1607095116838645]

    with open_state(state_fp) as state:
        assert isinstance(state._get_dataset('predictor_methods'), np.ndarray)
        assert isinstance(state._get_dataset('labels', query=2), np.ndarray)
        assert isinstance(state._get_dataset('models_training', record_id=4), np.ndarray)

        assert all(state._get_dataset('indices') == INDICES)
        assert state._get_dataset('predictor_models', query=1)[0] == b'nb'
        assert all(state._get_dataset('predictor_methods', query=0) == [b'initial', b'initial'])
        assert state._get_dataset('labels', record_id=4)[0] == 1
        assert state._get_dataset('labeling_times', record_id=0)[0] == TIMES[0]


def test_get_predictor_methods():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    METHODS = [b'initial', b'initial', b'max', b'max']

    with open_state(state_fp) as state:
        all_methods = state.get_predictor_methods()
        assert isinstance(all_methods, np.ndarray)
        assert all_methods.tolist() == METHODS


def test_get_predictor_models():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    MODELS = [b'initial', b'initial', b'nb', b'nb']

    with open_state(state_fp) as state:
        all_models = state.get_predictor_models()
        assert isinstance(all_models, np.ndarray)
        assert all_models.tolist() == MODELS


def test_get_predictor_training_sets():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    TRAINING_SETS = [-1, -1, 0, 1]

    with open_state(state_fp) as state:
        all_training_sets = state.get_predictor_training_sets()
        assert isinstance(all_training_sets, np.ndarray)
        assert all_training_sets.tolist() == TRAINING_SETS


def test_get_order_of_labeling():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    RECORD_ID_ORDER = [0, 5, 4, 1]

    with open_state(state_fp) as state:
        assert isinstance(state.get_order_of_labeling(), np.ndarray)
        assert all(state.get_order_of_labeling() == RECORD_ID_ORDER)


def test_get_labels():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    RECORD_ID_ORDER = [0, 5, 4, 1]
    LABELS = [1, 0, 1, 0]

    with open_state(state_fp) as state:
        assert isinstance(state.get_labels(), np.ndarray)
        assert all(state.get_labels() == LABELS)
        assert all(state.get_labels(query=0) == LABELS[:2])
        assert state.get_labels(query=2)[0] == LABELS[3]
        assert state.get_labels(record_id=1)[0] == LABELS[3]


def test_get_time():
    state_fp = Path("tests", "hdf5_states", "test_converted.h5")
    RECORD_ID_ORDER = [0, 5, 4, 1]
    TIMES_DT = np.array(['2020-12-04T15:18:36.822064', '2020-12-04T15:18:36.822064',
     '2020-12-04T15:18:36.833420', '2020-12-04T15:18:36.838645'], dtype=np.datetime64)
    TIMES = [1607095116822064, 1607095116822064, 1607095116833420,
       1607095116838645]

    with open_state(state_fp) as state:
        assert isinstance(state.get_labeling_time(), np.ndarray)
        assert all(state.get_labeling_time() == TIMES)
        assert all(state.get_labeling_time(format='datetime') == TIMES_DT)
        assert len(state.get_labeling_time(query=0)) == 1
        assert state.get_labeling_time(query=0)[0] == TIMES[1]
        assert state.get_labeling_time(query=1)[0] == TIMES[2]
        assert state.get_labeling_time(record_id=5)[0] == TIMES[1]
        assert state.get_labeling_time(record_id=1, format='datetime')[0] == TIMES_DT[3]


def test_create_empty_state(tmpdir):
    state_fp = Path(tmpdir, 'state.h5')
    with open_state(state_fp, read_only=False) as state:
        assert state.is_empty()


def test_add_as_data(tmpdir):
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)
    state_fp = Path(tmpdir, 'state.h5')
    HASH = '4f2aa98ea92675f9887e63d9a4b972daf8b7b834'
    RECORD_IDS = list(range(12, 2, -1))

    with open_state(state_fp, read_only=False) as state:
        state._add_as_data(as_data)
        assert HASH in state.f['data_properties'].keys()
        assert all(np.array(state.f[f'data_properties/{HASH}/record_table']) == RECORD_IDS)


def test_add_labeling_data(tmpdir):
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)

    RECORD_IDS = np.array([3, 5, 7, 9])
    LABELS = np.array([1, 0, 0, 1])
    METHODS = np.array([b'initial', b'initial', b'max', b'max'])
    MODELS = np.array([b'initial', b'initial', b'nb', b'svm'])
    TRAINING_SETS = np.array([-1, -1, 0, 1])
    LABELING_TIMES = np.array([1617197681466447, 1617197700565384, 1617197708920184, 1617197715836106])

    state_fp = Path(tmpdir, 'state.h5')
    with open_state(state_fp, read_only=False) as state:
        state._add_as_data(as_data)
        state.add_labeling_data(record_ids=RECORD_IDS[:2], labels=LABELS[:2],
                                models=MODELS[:2], methods=METHODS[:2],
                                training_sets=TRAINING_SETS[:2], labeling_times=LABELING_TIMES[:2])
        state.add_labeling_data(record_ids=RECORD_IDS[[2]], labels=LABELS[[2]],
                                models=MODELS[[2]], methods=METHODS[[2]],
                                training_sets=TRAINING_SETS[[2]], labeling_times=LABELING_TIMES[[2]])
        state.add_labeling_data(record_ids=RECORD_IDS[[3]], labels=LABELS[[3]],
                                models=MODELS[[3]], methods=METHODS[[3]],
                                training_sets=TRAINING_SETS[[3]], labeling_times=LABELING_TIMES[[3]])

        assert all(state.f['results/labels'][:] == LABELS)
        assert all(state.f['results/predictor_methods'][:] == METHODS)
        assert all(state.f['results/predictor_models'][:] == MODELS)
        assert all(state.f['results/labeling_times'][:] == LABELING_TIMES)

# # Test get by querying for the whole dataset everytime. I'll implement indexing
# # at a later stage.
# def test_get():
#     state_fp = Path("tests", "hdf5_states", "test_converted.h5")
#     METHODS = ['initial', 'initial', 'max', 'max']
#     INDICES = [0, 3, 2, 1]
#     LABELS = [1, 0, 1, 0]
#
#     with open_state(state_fp) as state:
#         assert all([x.encode('ascii') for x in METHODS] ==
#                    state.get("predictor_methods"))
#         assert all(INDICES == state.get("indices"))


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

