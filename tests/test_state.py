from pathlib import Path
from sqlite3 import OperationalError
import json
import pytest

import pandas as pd
from scipy.sparse.csr import csr_matrix

from asreview import ASReviewData
from asreview.state import SqlStateV1
from asreview.state import open_state
from asreview.state import init_project_folder_structure
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_reviews_path
from asreview.state.paths import get_data_path
from asreview.state.paths import get_feature_matrices_path
from asreview.state.sqlstate import RESULTS_TABLE_COLUMNS
from asreview.state.errors import StateNotFoundError
from asreview.settings import ASReviewSettings

TEST_LABELS = [1, 0, 0, 1, 1, 1, 0, 1, 1, 1]
TEST_INDICES = [16, 346, 509, 27, 11, 555, 554, 680, 264, 309]
TEST_RECORD_IDS = [17, 347, 510, 28, 12, 556, 555, 681, 265, 310]
TEST_RECORD_TABLE = list(range(1, 852))
TEST_CLASSIFIERS = [
    'prior', 'prior', 'prior', 'prior', 'nb', 'nb', 'nb', 'nb', 'nb', 'nb'
]
TEST_QUERY_STRATEGIES = [
    'prior', 'prior', 'prior', 'prior', 'max', 'max', 'max', 'max', 'max',
    'max'
]
TEST_BALANCE_STRATEGIES = [
    'prior', 'prior', 'prior', 'prior', 'double', 'double', 'double', 'double',
    'double', 'double'
]
TEST_FEATURE_EXTRACTION = [
    'prior', 'prior', 'prior', 'prior', 'tfidf', 'tfidf', 'tfidf', 'tfidf',
    'tfidf', 'tfidf'
]
TEST_TRAINING_SETS = [-1, -1, -1, -1, 4, 5, 6, 7, 8, 9]
TEST_NOTES = [None, None, None, 'random text', 'another random text', None,
              None, 'A final random text', None, None]

TEST_N_PRIORS = 4
TEST_N_MODELS = 7

TEST_STATE_FP = Path('tests', 'asreview_files',
                     'test_state_example_converted.asreview')
TEST_WITH_TIMES_FP = Path('tests', 'asreview_files',
                          'test_state_example_with_times.asreview')
TEST_LABELING_TIMES = [
    '2021-08-20 11:14:30.093919', '2021-08-20 11:14:30.093919',
    '2021-08-20 11:14:30.093919', '2021-08-20 11:14:30.093919',
    '2021-08-20 11:14:51.307699', '2021-08-20 11:14:54.328311',
    '2021-08-20 11:14:56.981117', '2021-08-20 11:14:59.810290'
]

TEST_FIRST_PROBS = [0.7107394917661797, 0.7291694332065035, 0.732624685298732,
                    0.7017866934752249, 0.7275304788204621, 0.7126109527686055,
                    0.7246720268636593, 0.7040374218528891, 0.7095665447517838,
                    0.7021937381372063]
TEST_LAST_PROBS = [0.7116408177006979, 0.7119557616570122, 0.71780127925996,
                   0.7127075014419986, 0.7085644453092131, 0.7067520535764322,
                   0.7103161247883791, 0.7192568428839242, 0.7118104532649111,
                   0.7150387267232563]


def test_init_project_folder(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)

    assert get_project_file_path(project_path).is_file()
    assert get_data_path(project_path).is_dir()
    assert get_feature_matrices_path(project_path).is_dir()
    assert get_reviews_path(project_path).is_dir()

    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    assert project_config['id'] == 'test'


@pytest.mark.xfail(raises=IsADirectoryError,
                   reason="Project folder {project_path} already exists.")
def test_init_project_already_exists(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    init_project_folder_structure(project_path)


@pytest.mark.xfail(raises=StateNotFoundError,
                   reason="Project folder does not exist")
def test_invalid_project_folder():
    with open_state('this_is_not_a_project') as state:  # noqa
        pass


@pytest.mark.xfail(raises=StateNotFoundError,
                   reason="State file does not exist")
def test_state_not_found(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    with open_state(project_path) as state:  # noqa
        pass


def test_read_basic_state():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state, SqlStateV1)


def test_version_number_state():
    with open_state(TEST_STATE_FP) as state:
        assert state.version[0] == "1"


@pytest.mark.xfail(raises=OperationalError,
                   reason="attempt to write a readonly database")
def test_write_while_read_only_state():
    with open_state(TEST_STATE_FP, read_only=True) as state:
        state.add_labeling_data(TEST_RECORD_IDS, TEST_LABELS, TEST_CLASSIFIERS,
                                TEST_QUERY_STRATEGIES, TEST_BALANCE_STRATEGIES,
                                TEST_FEATURE_EXTRACTION, TEST_TRAINING_SETS)


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


def test_n_priors():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_priors == TEST_N_PRIORS


def test_create_new_state_file(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    with open_state(project_path, read_only=False) as state:
        state._is_valid_state()


def test_get_dataset():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_dataset(['query_strategies']),
                          pd.DataFrame)
        assert isinstance(state.get_dataset(), pd.DataFrame)

        # Try getting a specific column.
        assert state.get_dataset(['record_ids'
                                  ])['record_ids'].to_list() == TEST_RECORD_IDS
        assert state.get_dataset([
            'feature_extraction'
        ])['feature_extraction'].to_list() == TEST_FEATURE_EXTRACTION
        # Try getting all columns and that picking the right column.
        assert state.get_dataset()['balance_strategies'].to_list(
        ) == TEST_BALANCE_STRATEGIES
        # Try getting a specific column with column name as string, instead of
        # list containing column name.
        assert state.get_dataset(
            'training_sets')['training_sets'].to_list() == TEST_TRAINING_SETS


def test_get_data_by_query_number():
    with open_state(TEST_STATE_FP) as state:
        query = state.get_data_by_query_number(0)
        assert list(query.columns) == RESULTS_TABLE_COLUMNS
        assert query['balance_strategies'].tolist(
        ) == TEST_BALANCE_STRATEGIES[:TEST_N_PRIORS]
        assert query['classifiers'].tolist(
        ) == TEST_CLASSIFIERS[:TEST_N_PRIORS]

        for query_num in [1, 3, 5]:
            query_idx = query_num + TEST_N_PRIORS - 1
            query = state.get_data_by_query_number(query_num)
            assert isinstance(query, pd.DataFrame)
            assert query['feature_extraction'].to_list(
            )[0] == TEST_FEATURE_EXTRACTION[query_idx]
            assert query['labels'].to_list()[0] == TEST_LABELS[query_idx]
            assert query['record_ids'].to_list(
            )[0] == TEST_RECORD_IDS[query_idx]

        columns = RESULTS_TABLE_COLUMNS[2:5]
        query = state.get_data_by_query_number(4, columns)
        assert list(query.columns) == columns


def test_get_data_by_record_id():
    with open_state(TEST_STATE_FP) as state:
        for idx in [2, 6, 8]:
            record_id = TEST_RECORD_IDS[idx]
            query = state.get_data_by_record_id(record_id)
            assert isinstance(query, pd.DataFrame)
            assert query['training_sets'].to_list(
            )[0] == TEST_TRAINING_SETS[idx]
            assert query['record_ids'].to_list()[0] == TEST_RECORD_IDS[idx]


def test_get_query_strategies():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_query_strategies(), pd.Series)
        assert all(state.get_query_strategies() == TEST_QUERY_STRATEGIES)


def test_get_classifiers():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_classifiers(), pd.Series)
        assert all(state.get_classifiers() == TEST_CLASSIFIERS)


def test_get_training_sets():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_training_sets(), pd.Series)
        assert all(state.get_training_sets() == TEST_TRAINING_SETS)


def test_get_order_of_labeling():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_order_of_labeling(), pd.Series)
        assert all(state.get_order_of_labeling() == TEST_RECORD_IDS)


def test_get_labels():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_labels(), pd.Series)
        assert all(state.get_labels() == TEST_LABELS)


def test_get_labeling_times():
    with open_state(TEST_WITH_TIMES_FP) as state:
        assert isinstance(state.get_labeling_times(), pd.Series)
        assert all(state.get_labeling_times() == TEST_LABELING_TIMES)


def test_create_empty_state(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    with open_state(project_path, read_only=False) as state:
        assert state.is_empty()


def test_get_feature_matrix():
    with open_state(TEST_STATE_FP) as state:
        feature_matrix = state.get_feature_matrix()
        assert isinstance(feature_matrix, csr_matrix)


def test_get_record_table():
    with open_state(TEST_STATE_FP) as state:
        record_table = state.get_record_table()
        assert isinstance(record_table, pd.DataFrame)
        assert list(record_table.columns) == ['record_ids']
        assert record_table['record_ids'].to_list() == TEST_RECORD_TABLE


def test_record_table(tmpdir):
    data_fp = Path('tests', "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)

    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    RECORD_IDS = list(range(12, 2, -1))

    with open_state(project_path, read_only=False) as state:
        state.add_record_table(as_data.record_ids)
        assert state.get_record_table()['record_ids'].to_list() == RECORD_IDS


def test_get_last_probabilities():
    with open_state(TEST_STATE_FP) as state:
        probabilities = state.get_last_probabilities()
        assert isinstance(probabilities, pd.DataFrame)
        assert list(probabilities.columns) == ['proba']
        assert probabilities['proba'].to_list()[:10] == TEST_FIRST_PROBS
        assert probabilities['proba'].to_list()[-10:] == TEST_LAST_PROBS


@pytest.mark.xfail(
    raises=ValueError,
    reason="There are 851 probabilities in the"
    f" database, but 'probabilities' has length 3")
def test_add_last_probabilities_fail():
    with open_state(TEST_STATE_FP) as state:
        state.add_last_probabilities([1.0, 2.0, 3.0])


def test_add_last_probabilities(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    probabilities = [float(num) for num in range(50)]
    with open_state(project_path, read_only=False) as state:
        state.add_last_probabilities(probabilities)
        state_probabilities = state.get_last_probabilities()['proba'].tolist()
        assert state_probabilities == probabilities


def test_add_labeling_data(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    with open_state(project_path, read_only=False) as state:
        for i in range(3):
            # Test without specifying notes.
            state.add_labeling_data([TEST_RECORD_IDS[i]], [TEST_LABELS[i]],
                                    [TEST_CLASSIFIERS[i]],
                                    [TEST_QUERY_STRATEGIES[i]],
                                    [TEST_BALANCE_STRATEGIES[i]],
                                    [TEST_FEATURE_EXTRACTION[i]],
                                    [TEST_TRAINING_SETS[i]])

        # Test with specifying notes and with larger batch.
        state.add_labeling_data(TEST_RECORD_IDS[3:], TEST_LABELS[3:],
                                TEST_CLASSIFIERS[3:],
                                TEST_QUERY_STRATEGIES[3:],
                                TEST_BALANCE_STRATEGIES[3:],
                                TEST_FEATURE_EXTRACTION[3:],
                                TEST_TRAINING_SETS[3:],
                                TEST_NOTES[3:])

        data = state.get_dataset()
        assert data['record_ids'].to_list() == TEST_RECORD_IDS
        assert data['labels'].to_list() == TEST_LABELS
        assert data['classifiers'].to_list() == TEST_CLASSIFIERS
        assert data['query_strategies'].to_list() == TEST_QUERY_STRATEGIES
        assert data['balance_strategies'].to_list() == TEST_BALANCE_STRATEGIES
        assert data['feature_extraction'].to_list() == TEST_FEATURE_EXTRACTION
        assert data['training_sets'].to_list() == TEST_TRAINING_SETS
        assert data['notes'].to_list() == TEST_NOTES


def test_add_note(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    init_project_folder_structure(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_labeling_data(TEST_RECORD_IDS[:3], TEST_LABELS[:3],
                                TEST_CLASSIFIERS[:3],
                                TEST_QUERY_STRATEGIES[:3],
                                TEST_BALANCE_STRATEGIES[:3],
                                TEST_FEATURE_EXTRACTION[:3],
                                TEST_TRAINING_SETS[:3],
                                TEST_NOTES[:3])

        note = 'An added note'
        record_id = TEST_RECORD_IDS[1]
        state.add_note(note, record_id)
        record_data = state.get_data_by_record_id(record_id)
        assert record_data['notes'][0] == note
