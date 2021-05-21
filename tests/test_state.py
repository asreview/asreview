from pathlib import Path
from sqlite3 import OperationalError

import pytest

import numpy as np
from scipy.sparse.csr import csr_matrix

from asreview import ASReviewData
from asreview.state import HDF5State
from asreview.state import open_state
from asreview.state.errors import StateNotFoundError
from asreview.settings import ASReviewSettings


TEST_LABELS = [1, 0, 0, 1, 1, 1, 0, 1, 1, 1]
TEST_INDICES = [16, 346, 509, 27, 11, 555, 554, 680, 264, 309]
TEST_RECORD_IDS = [17, 347, 510, 28, 12, 556, 555, 681, 265, 310]
TEST_CLASSIFIERS = ['initial', 'initial', 'initial', 'initial', 'nb', 'nb', 'nb', 'nb', 'nb', 'nb']
TEST_QUERY_STRATEGIES = ['prior', 'prior', 'prior', 'prior', 'max', 'max', 'max', 'max', 'max', 'max']
TEST_BALANCE_STRATEGIES = ['initial', 'initial', 'initial', 'initial', 'double', 'double', 'double', 'double',
                                   'double', 'double']
TEST_FEATURE_EXTRACTION = ['initial', 'initial', 'initial', 'initial', 'tfidf', 'tfidf', 'tfidf', 'tfidf',
                                     'tfidf', 'tfidf']
TEST_TRAINING_SETS = [-1, -1, -1, -1, 4, 5, 6, 7, 8, 9]
TEST_LABELING_TIMES = [1621597506037183, 1621597506046369, 1621597506053114, 1621597506061950, 1621597506070351,
                           1621597506072425, 1621597506073674, 1621597506077505, 1621597506079072, 1621597506084322]
TEST_N_PRIORS = 4
TEST_N_MODELS = 7
TEST_STATE_FP = Path("tests", "v3_states", "test_converted_unzipped.asreview")


@pytest.mark.xfail(
    raises=StateNotFoundError,
    reason="State not found and in read_only mode"
)
def test_state_not_found():
    with open_state("this_file_doesnt_exist.asreview") as state:
        pass


def test_read_basic_state():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state, HDF5State)


def test_version_number_state():
    with open_state(TEST_STATE_FP) as state:
        assert state.version[0] == "1"


def test_read_only_state():
    with open_state(TEST_STATE_FP, read_only=True) as state1:
        end_time1 = state1.end_time

    with open_state(TEST_STATE_FP) as state2:
        end_time2 = state2.end_time

    assert end_time1 == end_time2
#
#     # TODO{Try to modify and catch error}

@pytest.mark.xfail(
    raises=OperationalError,
    reason="attempt to write a readonly database"
)
def test_write_while_read_only_state():
    with open_state(TEST_STATE_FP, read_only=True) as state:
        state.add_labeling_data(TEST_RECORD_IDS,
                                TEST_LABELS,
                                TEST_CLASSIFIERS,
                                TEST_QUERY_STRATEGIES,
                                TEST_BALANCE_STRATEGIES,
                                TEST_FEATURE_EXTRACTION,
                                TEST_TRAINING_SETS,
                                TEST_LABELING_TIMES)


def test_print_state():
    with open_state(TEST_STATE_FP, read_only=True) as state:
        print(state)


def test_settings_state():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.settings, ASReviewSettings)


def test_current_queries():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.current_queries, dict)
        assert len(state.current_queries.keys()) > 0


def test_n_records_labeled():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_records_labeled == len(TEST_LABELS)


# # TODO (State): Test with n_instance > 1.
def test_n_models():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_models == TEST_N_MODELS


def test_n_priors():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_priors == TEST_N_PRIORS


def test_create_new_state_file(tmpdir):
    state_fp = Path(tmpdir, 'test.h5')
    with open_state(state_fp, read_only=False) as state:
        state._is_valid_state()


def test_row_index_to_record_id():
    with open_state(TEST_STATE_FP) as state:
        for i in range(len(TEST_RECORD_IDS)):
            assert state._row_index_to_record_id(TEST_INDICES[i]) == TEST_RECORD_IDS[i]


def test_record_id_to_row_index():
    with open_state(TEST_STATE_FP) as state:
        for i in range(len(TEST_RECORD_IDS)):
            assert state._record_id_to_row_index(TEST_RECORD_IDS[i]) == TEST_INDICES[i]


@pytest.mark.xfail(
    raises=ValueError,
    reason="You can not search by record_id and query at the same time."
)
def test_get_dataset_fail():
    with open_state(TEST_STATE_FP) as state:
        state._get_dataset('labels', query=0, record_id=0)


def test_get_dataset():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state._get_dataset('query_strategies'), np.ndarray)
        assert isinstance(state._get_dataset('labels', query=2), np.ndarray)
        assert isinstance(state._get_dataset('feature_extraction', record_id=17), np.ndarray)

        assert all(state._get_dataset('indices') == TEST_INDICES)
        assert state._get_dataset('classifiers', query=1)[0] == \
               TEST_CLASSIFIERS[TEST_N_PRIORS]
        assert all(state._get_dataset('query_strategies', query=0) ==
                   TEST_QUERY_STRATEGIES[:TEST_N_PRIORS])
        assert state._get_dataset('labels', record_id=17)[0] == TEST_LABELS[TEST_RECORD_IDS.index(17)]


def test_get_query_strategies():
    with open_state(TEST_STATE_FP) as state:
        all_models = state.get_query_strategies()
        assert isinstance(all_models, np.ndarray)
        assert all_models.tolist() == TEST_QUERY_STRATEGIES


def test_get_classifiers():
    with open_state(TEST_STATE_FP) as state:
        all_methods = state.get_classifiers()
        assert isinstance(all_methods, np.ndarray)
        assert all_methods.tolist() == TEST_CLASSIFIERS


def test_get_training_sets():
    with open_state(TEST_STATE_FP) as state:
        all_training_sets = state.get_training_sets()
        assert isinstance(all_training_sets, np.ndarray)
        assert all_training_sets.tolist() == TEST_TRAINING_SETS


def test_get_order_of_labeling():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_order_of_labeling(), np.ndarray)
        assert all(state.get_order_of_labeling() == TEST_RECORD_IDS)


def test_get_labels():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_labels(), np.ndarray)
        assert all(state.get_labels() == TEST_LABELS)
        assert all(state.get_labels(query=0) == TEST_LABELS[:TEST_N_PRIORS])
        assert state.get_labels(query=2)[0] == TEST_LABELS[TEST_N_PRIORS + 1]
        assert state.get_labels(record_id=TEST_RECORD_IDS[5])[0] == TEST_LABELS[5]


# TODO(State): Get state file with labeling times.
def test_get_time():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_labeling_times(), np.ndarray)


def test_create_empty_state(tmpdir):
    state_fp = Path(tmpdir, 'state.asreview')
    with open_state(state_fp, read_only=False) as state:
        assert state.is_empty()


def test_get_feature_matrix():
    with open_state(TEST_STATE_FP) as state:
        feature_matrix = state.get_feature_matrix()
        assert isinstance(feature_matrix, csr_matrix)


def test_add_as_data(tmpdir):
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)
    state_fp = Path(tmpdir, 'state.asreview')
    RECORD_IDS = list(range(12, 2, -1))

    with open_state(state_fp, read_only=False) as state:
        state._add_as_data(as_data)
        assert all(state.record_table['record_ids'] == RECORD_IDS)


def test_add_labeling_data(tmpdir):
    data_fp = TEST_STATE_FP / 'data/ADHD.csv'
    as_data = ASReviewData.from_file(data_fp)

    state_fp = Path(tmpdir, 'state.asreview')
    with open_state(state_fp, read_only=False) as state:
        state._add_as_data(as_data)
        for i in range(3):
            state.add_labeling_data([TEST_RECORD_IDS[i]],
                                    [TEST_LABELS[i]],
                                    [TEST_CLASSIFIERS[i]],
                                    [TEST_QUERY_STRATEGIES[i]],
                                    [TEST_BALANCE_STRATEGIES[i]],
                                    [TEST_FEATURE_EXTRACTION[i]],
                                    [TEST_TRAINING_SETS[i]],
                                    [TEST_LABELING_TIMES[i]])

        state.add_labeling_data(TEST_RECORD_IDS[3:],
                                TEST_LABELS[3:],
                                TEST_CLASSIFIERS[3:],
                                TEST_QUERY_STRATEGIES[3:],
                                TEST_BALANCE_STRATEGIES[3:],
                                TEST_FEATURE_EXTRACTION[3:],
                                TEST_TRAINING_SETS[3:],
                                TEST_LABELING_TIMES[3:])

        assert all(state.get_order_of_labeling() == TEST_RECORD_IDS)
        assert all(state.get_labels() == TEST_LABELS)
        assert all(state.get_classifiers() == TEST_CLASSIFIERS)
        assert all(state.get_query_strategies() == TEST_QUERY_STRATEGIES)
        assert all(state.get_balance_strategies() == TEST_BALANCE_STRATEGIES)
        assert all(state.get_feature_extraction() == TEST_FEATURE_EXTRACTION)
        assert all(state.get_training_sets() == TEST_TRAINING_SETS)
        assert all(state.get_labeling_times() == TEST_LABELING_TIMES)
