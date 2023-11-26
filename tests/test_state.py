from pathlib import Path
from sqlite3 import OperationalError

import pandas as pd
import pytest
from scipy.sparse import csr_matrix

from asreview import ASReviewData
from asreview.project import ASReviewProject
from asreview.project import ProjectExistsError
from asreview.project import open_state
from asreview.settings import ASReviewSettings
from asreview.state import SQLiteState
from asreview.state.errors import StateNotFoundError
from asreview.state.sqlstate import RESULTS_TABLE_COLUMNS

TEST_LABELS = [1, 0, 0, 1, 1, 1, 0, 1, 1, 1]
TEST_INDICES = [16, 346, 509, 27, 11, 555, 554, 680, 264, 309]
TEST_RECORD_IDS = [17, 347, 510, 28, 12, 556, 555, 681, 265, 310]
TEST_RECORD_TABLE = list(range(851))
TEST_CLASSIFIERS = [None, None, None, None, "nb", "nb", "nb", "nb", "nb", "nb"]
TEST_QUERY_STRATEGIES = [
    "prior",
    "prior",
    "prior",
    "prior",
    "max",
    "max",
    "max",
    "max",
    "max",
    "max",
]
TEST_BALANCE_STRATEGIES = [
    None,
    None,
    None,
    None,
    "double",
    "double",
    "double",
    "double",
    "double",
    "double",
]
TEST_FEATURE_EXTRACTION = [
    None,
    None,
    None,
    None,
    "tfidf",
    "tfidf",
    "tfidf",
    "tfidf",
    "tfidf",
    "tfidf",
]
TEST_TRAINING_SETS = [-1, -1, -1, -1, 4, 5, 6, 7, 8, 9]
TEST_NOTES = [
    None,
    None,
    None,
    "random text",
    "another random text",
    None,
    None,
    "A final random text",
    None,
    None,
]

TEST_N_PRIORS = 4
TEST_N_MODELS = 7

TEST_STATE_FP = Path("tests", "asreview_files", "test_state_example_converted.asreview")
TEST_WITH_TIMES_FP = Path(
    "tests", "asreview_files", "test_state_example_with_times.asreview"
)
TEST_LABELING_TIMES = [
    "2021-09-30 17:54:07.569255",
    "2021-09-30 17:54:07.569255",
    "2021-09-30 17:54:28.860270",
    "2021-09-30 17:54:28.860270",
    "2021-09-30 17:54:28.860270",
    "2021-09-30 17:54:31.689389",
    "2021-09-30 17:54:33.505257",
    "2021-09-30 17:54:35.842416",
    "2021-09-30 17:54:38.245108",
]

TEST_FIRST_PROBS = [
    0.7107394917661797,
    0.7291694332065035,
    0.732624685298732,
    0.7017866934752249,
    0.7275304788204621,
    0.7126109527686055,
    0.7246720268636593,
    0.7040374218528891,
    0.7095665447517838,
    0.7021937381372063,
]
TEST_LAST_PROBS = [
    0.7116408177006979,
    0.7119557616570122,
    0.71780127925996,
    0.7127075014419986,
    0.7085644453092131,
    0.7067520535764322,
    0.7103161247883791,
    0.7192568428839242,
    0.7118104532649111,
    0.7150387267232563,
]
TEST_POOL_START = [157, 301, 536, 567, 416, 171, 659, 335, 329, 428]


def test_init_project_folder(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    project = ASReviewProject.create(project_path)

    assert Path(project_path, "project.json").is_file()
    assert Path(project_path, "data").is_dir()
    assert Path(project_path, "feature_matrices").is_dir()
    assert Path(project_path, "reviews").is_dir()

    assert project.config["id"] == "test"


def test_init_project_already_exists(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with pytest.raises(ProjectExistsError):
        ASReviewProject.create(project_path)


def test_invalid_project_folder(tmpdir):
    project_path = Path(tmpdir, "this_is_not_a_project")
    with pytest.raises(StateNotFoundError):
        with open_state(project_path) as state:  # noqa
            pass

    # there should be no folder called "this_is_not_a_project"
    assert not Path(project_path).is_dir()


def test_state_not_found(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with pytest.raises(StateNotFoundError):
        with open_state(project_path) as state:  # noqa
            pass


def test_read_basic_state():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state, SQLiteState)


def test_version_number_state():
    with open_state(TEST_STATE_FP) as state:
        assert state.version[0] == "1"


def test_write_while_read_only_state():
    with open_state(TEST_STATE_FP, read_only=True) as state:
        with pytest.raises(OperationalError):
            state.add_last_probabilities([1.0] * len(TEST_RECORD_TABLE))


def test_print_state():
    with open_state(TEST_STATE_FP, read_only=True) as state:
        print(state)


def test_settings_state():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.settings, ASReviewSettings)


def test_n_records_labeled():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_records_labeled == len(TEST_LABELS)


def test_n_priors():
    with open_state(TEST_STATE_FP) as state:
        assert state.n_priors == TEST_N_PRIORS


def test_create_new_state_file(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state._is_valid_state()


def test_get_dataset():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_dataset(["query_strategy"]), pd.DataFrame)
        assert isinstance(state.get_dataset(), pd.DataFrame)

        # Try getting a specific column.
        assert (
            state.get_dataset(["record_id"])["record_id"].to_list() == TEST_RECORD_IDS
        )
        assert (
            state.get_dataset(["feature_extraction"])["feature_extraction"].to_list()
            == TEST_FEATURE_EXTRACTION
        )
        # Try getting all columns and that picking the right column.
        assert (
            state.get_dataset()["balance_strategy"].to_list() == TEST_BALANCE_STRATEGIES
        )
        # Try getting a specific column with column name as string, instead of
        # list containing column name.
        assert (
            state.get_dataset("training_set")["training_set"].to_list()
            == TEST_TRAINING_SETS
        )


def test_get_dataset_drop_prior():
    with open_state(TEST_STATE_FP) as state:
        assert (
            len(state.get_dataset(priors=False)) == len(TEST_RECORD_IDS) - TEST_N_PRIORS
        )
        assert (state.get_dataset(priors=False)["query_strategy"] != "prior").all()
        assert "query_strategy" in state.get_dataset(priors=False).columns
        assert "query_strategy" not in state.get_dataset("label", priors=False)


def test_get_dataset_drop_pending(tmpdir):
    record_table = range(1, 11)
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(record_table)
        state.add_last_ranking(test_ranking, "nb", "max", "double", "tfidf", 4)
        state.add_labeling_data([4, 5, 6], [1, 0, 1], prior=True)
        state.query_top_ranked(3)

        assert "label" in state.get_dataset(pending=False).columns
        assert "label" not in state.get_dataset("balance_strategy", pending=False)
        assert len(state.get_dataset(pending=False)) == 3
        assert state.get_dataset(pending=False)["label"].notna().all()


def test_get_data_by_query_number():
    with open_state(TEST_STATE_FP) as state:
        query = state.get_data_by_query_number(0)
        assert list(query.columns) == RESULTS_TABLE_COLUMNS
        assert (
            query["balance_strategy"].tolist()
            == TEST_BALANCE_STRATEGIES[:TEST_N_PRIORS]
        )
        assert query["classifier"].tolist() == TEST_CLASSIFIERS[:TEST_N_PRIORS]

        for query_num in [1, 3, 5]:
            query_idx = query_num + TEST_N_PRIORS - 1
            query = state.get_data_by_query_number(query_num)
            assert isinstance(query, pd.DataFrame)
            assert (
                query["feature_extraction"].to_list()[0]
                == TEST_FEATURE_EXTRACTION[query_idx]
            )
            assert query["label"].to_list()[0] == TEST_LABELS[query_idx]
            assert query["record_id"].to_list()[0] == TEST_RECORD_IDS[query_idx]

        columns = RESULTS_TABLE_COLUMNS[2:5]
        query = state.get_data_by_query_number(4, columns)
        assert list(query.columns) == columns


def test_get_data_by_record_id():
    with open_state(TEST_STATE_FP) as state:
        for idx in [2, 6, 8]:
            record_id = TEST_RECORD_IDS[idx]
            query = state.get_data_by_record_id(record_id)
            assert isinstance(query, pd.DataFrame)
            assert query["training_set"].to_list()[0] == TEST_TRAINING_SETS[idx]
            assert query["record_id"].to_list()[0] == TEST_RECORD_IDS[idx]


def test_get_query_strategies():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_query_strategies(), pd.Series)
        assert state.get_query_strategies().to_list() == TEST_QUERY_STRATEGIES


def test_get_classifiers():
    with open_state(TEST_STATE_FP) as state:
        assert isinstance(state.get_classifiers(), pd.Series)
        assert state.get_classifiers().to_list() == TEST_CLASSIFIERS


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


def test_get_labels_no_priors():
    with open_state(TEST_STATE_FP) as state:
        labels = state.get_labels(priors=False)
        assert isinstance(labels, pd.Series)
        assert all(labels == TEST_LABELS[4:])


def test_get_labeling_times():
    with open_state(TEST_WITH_TIMES_FP) as state:
        assert isinstance(state.get_labeling_times(), pd.Series)
        assert all(state.get_labeling_times() == TEST_LABELING_TIMES)


def test_create_empty_state(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        assert state.is_empty()


def test_get_feature_matrix():
    project = ASReviewProject(TEST_STATE_FP)

    assert len(project.feature_matrices) == 1

    feature_matrix = project.get_feature_matrix(project.feature_matrices[0]["id"])
    assert isinstance(feature_matrix, csr_matrix)


def test_get_record_table():
    with open_state(TEST_STATE_FP) as state:
        record_table = state.get_record_table()
        assert isinstance(record_table, pd.Series)
        assert record_table.name == "record_id"
        assert record_table.to_list() == TEST_RECORD_TABLE


def test_record_table(tmpdir):
    data_fp = Path("tests", "demo_data", "record_id.csv")
    as_data = ASReviewData.from_file(data_fp)

    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)

    with open_state(project_path, read_only=False) as state:
        state.add_record_table(as_data.record_ids)
        assert state.get_record_table().to_list() == list(range(len(as_data)))


def test_get_last_probabilities():
    with open_state(TEST_STATE_FP) as state:
        probabilities = state.get_last_probabilities()
        assert isinstance(probabilities, pd.Series)
        assert probabilities.name == "proba"
        assert probabilities.to_list()[:10] == TEST_FIRST_PROBS
        assert probabilities.to_list()[-10:] == TEST_LAST_PROBS


def test_add_last_probabilities_fail():
    with open_state(TEST_STATE_FP) as state:
        with pytest.raises(ValueError):
            state.add_last_probabilities([1.0, 2.0, 3.0])


def test_add_last_probabilities(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    probabilities = [float(num) for num in range(50)]
    with open_state(project_path, read_only=False) as state:
        state.add_last_probabilities(probabilities)
        state_probabilities = state.get_last_probabilities().to_list()
        assert state_probabilities == probabilities
        state.add_last_probabilities(None)
        state_probabilities = state.get_last_probabilities().to_list()
        assert not state_probabilities


def test_move_ranking_data_to_results(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(TEST_RECORD_TABLE)
        state.add_last_ranking(
            range(1, len(TEST_RECORD_TABLE) + 1), "nb", "max", "double", "tfidf", 4
        )
        state._move_ranking_data_to_results([4, 6, 5, 7])

        data = state.get_dataset(pending=True)
        assert data["record_id"].to_list() == [4, 6, 5, 7]
        assert data["label"].to_list() == [None] * 4
        assert data["classifier"].to_list() == ["nb"] * 4


def test_query_top_ranked(tmpdir):
    test_ranking = [2, 1, 0] + list(range(3, len(TEST_RECORD_TABLE)))
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(TEST_RECORD_TABLE)
        state.add_last_ranking(test_ranking, "nb", "max", "double", "tfidf", 4)
        top_ranked = state.query_top_ranked(5)

        assert top_ranked == [2, 1, 0, 3, 4]
        data = state.get_dataset(pending=True)
        assert data["record_id"].to_list() == [2, 1, 0, 3, 4]
        assert data["classifier"].to_list() == ["nb"] * 5
        assert data["query_strategy"].to_list() == ["max"] * 5
        assert data["balance_strategy"].to_list() == ["double"] * 5
        assert data["feature_extraction"].to_list() == ["tfidf"] * 5
        assert data["training_set"].to_list() == [4] * 5


def test_add_labeling_data(tmpdir):
    test_ranking = list(range(len(TEST_RECORD_TABLE)))
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(TEST_RECORD_TABLE)
        state.add_last_ranking(test_ranking, "nb", "max", "double", "tfidf", 4)
        for i in range(3):
            # Test without specifying notes.
            state.add_labeling_data([TEST_RECORD_IDS[i]], [TEST_LABELS[i]], prior=True)

        # Test with specifying notes and with larger batch.
        state.add_labeling_data(
            TEST_RECORD_IDS[3:6], TEST_LABELS[3:6], notes=TEST_NOTES[3:6], prior=True
        )

        data = state.get_dataset(pending=True)
        assert data["record_id"].to_list() == TEST_RECORD_IDS[:6]
        assert data["label"].to_list() == TEST_LABELS[:6]
        assert data["classifier"].to_list() == [None] * 6
        assert data["query_strategy"].to_list() == ["prior"] * 6
        assert data["balance_strategy"].to_list() == [None] * 6
        assert data["feature_extraction"].to_list() == [None] * 6
        assert data["training_set"].to_list() == [-1] * 6
        assert data["notes"].to_list() == TEST_NOTES[:6]

        state.query_top_ranked(3)
        data = state.get_dataset(pending=True)
        assert data["label"].to_list()[:6] == TEST_LABELS[:6]
        assert data["label"][6:].isna().all()
        assert data["record_id"].to_list() == TEST_RECORD_IDS[:6] + [0, 1, 2]

        state.add_labeling_data([1], [1])
        labels = state.get_labels(pending=True)
        assert labels.to_list()[:6] == TEST_LABELS[:6]
        assert labels[7] == 1

        state.add_labeling_data([0, 2], [0, 1], notes=["note0", "note2"])
        data = state.get_dataset(pending=True)
        assert data["label"].to_list() == TEST_LABELS[:6] + [0, 1, 1]
        assert data["notes"].to_list() == TEST_NOTES[:6] + ["note0", None, "note2"]


def test_pool_labeled_pending(tmpdir):
    record_table = range(1, 11)
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(record_table)
        state.add_last_ranking(test_ranking, "nb", "max", "double", "tfidf", 4)
        state.add_labeling_data([4, 5, 6], [1, 0, 1], prior=True)
        state.query_top_ranked(3)

        pool, labeled, pending = state.get_pool_labeled_pending()
        assert isinstance(pool, pd.Series)
        assert isinstance(labeled, pd.DataFrame)
        assert isinstance(pending, pd.Series)

        assert pool.name == "record_id"
        assert pending.name == "record_id"
        assert list(labeled.columns) == ["record_id", "label"]

        assert pool.to_list() == [7, 3, 2, 1]
        assert labeled["record_id"].to_list() == [4, 5, 6]
        assert labeled["label"].to_list() == [1, 0, 1]
        assert pending.to_list() == [10, 9, 8]

        pool2 = state.get_pool()
        labeled2 = state.get_labeled()
        pending2 = state.get_pending()

        assert isinstance(pool2, pd.Series)
        assert isinstance(labeled2, pd.DataFrame)
        assert isinstance(pending2, pd.Series)

        assert pool2.name == "record_id"
        assert pending2.name == "record_id"
        assert list(labeled2.columns) == ["record_id", "label"]

        assert pool.to_list() == pool2.to_list()
        assert labeled["record_id"].to_list() == labeled2["record_id"].to_list()
        assert labeled["label"].to_list() == labeled2["label"].to_list()
        assert pending.to_list() == pending2.to_list()


def test_exist_new_labeled_records(tmpdir):
    record_table = range(1, 11)
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(record_table)

        assert not state.exist_new_labeled_records
        state.add_labeling_data([4, 5, 6], [1, 0, 1], prior=True)
        assert state.exist_new_labeled_records
        state.add_last_ranking(test_ranking, "nb", "max", "double", "tfidf", 3)
        assert not state.exist_new_labeled_records
        state.query_top_ranked(3)
        assert not state.exist_new_labeled_records
        state.add_labeling_data([8, 9, 10], [1, 1, 1])
        assert state.exist_new_labeled_records


def test_add_note(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(TEST_RECORD_TABLE)
        state.add_labeling_data(
            TEST_RECORD_IDS[:3], TEST_LABELS[:3], TEST_NOTES[:3], prior=True
        )

        note = "An added note"
        record_id = TEST_RECORD_IDS[1]
        state.add_note(note, record_id)
        record_data = state.get_data_by_record_id(record_id)
        assert record_data["notes"][0] == note


def test_update_decision(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)
    with open_state(project_path, read_only=False) as state:
        state.add_record_table(TEST_RECORD_TABLE)
        state.add_labeling_data(TEST_RECORD_IDS[:3], TEST_LABELS[:3], prior=True)

        for i in range(3):
            state.update_decision(TEST_RECORD_IDS[i], 1 - TEST_LABELS[i])
            new_label = state.get_data_by_record_id(TEST_RECORD_IDS[i])["label"][0]
            assert new_label == 1 - TEST_LABELS[i]

        state.update_decision(TEST_RECORD_IDS[1], TEST_LABELS[1])
        new_label = state.get_data_by_record_id(TEST_RECORD_IDS[1])["label"][0]
        assert new_label == TEST_LABELS[1]

        change_table = state.get_decision_changes()
        changed_records = TEST_RECORD_IDS[:3] + [TEST_RECORD_IDS[1]]
        new_labels = [1 - x for x in TEST_LABELS[:3]] + [TEST_LABELS[1]]

        assert change_table["record_id"].to_list() == changed_records
        assert change_table["new_label"].to_list() == new_labels


def test_get_pool_labeled():
    with open_state(TEST_STATE_FP) as state:
        pool, labeled, _ = state.get_pool_labeled_pending()

    assert isinstance(pool, pd.Series)
    assert pool.name == "record_id"
    assert isinstance(labeled, pd.DataFrame)
    assert list(labeled.columns) == ["record_id", "label"]

    assert pool.to_list()[:10] == TEST_POOL_START
    assert labeled["record_id"].to_list() == TEST_RECORD_IDS
    assert labeled["label"].to_list() == TEST_LABELS


def test_last_ranking(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)

    record_ids = [1, 2, 3, 4, 5, 6]
    ranking = [1, 3, 4, 6, 2, 5]
    classifier = "nb"
    query_strategy = "max"
    balance_strategy = "double"
    feature_extraction = "tfidf"
    training_set = 2

    with open_state(project_path, read_only=False) as state:
        state.add_record_table(record_ids)
        state.add_last_ranking(
            ranking,
            classifier,
            query_strategy,
            balance_strategy,
            feature_extraction,
            training_set,
        )

        last_ranking = state.get_last_ranking()
        assert isinstance(last_ranking, pd.DataFrame)
        assert list(last_ranking.columns) == [
            "record_id",
            "ranking",
            "classifier",
            "query_strategy",
            "balance_strategy",
            "feature_extraction",
            "training_set",
            "time",
        ]

        assert last_ranking["ranking"].to_list() == [0, 1, 2, 3, 4, 5]
        assert last_ranking["record_id"].to_list() == ranking
        assert last_ranking["classifier"].to_list() == [classifier] * len(record_ids)


def test_get_pool():
    with open_state(TEST_STATE_FP) as state:
        pool = state.get_pool()

    assert isinstance(pool, pd.Series)
    assert len(pool) == 841
    assert pool[:10].to_list() == TEST_POOL_START


def test_get_labeled():
    with open_state(TEST_STATE_FP) as state:
        labeled = state.get_labeled()

    assert isinstance(labeled, pd.DataFrame)
    assert labeled["record_id"].to_list() == TEST_RECORD_IDS
    assert labeled["label"].to_list() == TEST_LABELS


def test_add_extra_column(tmpdir):
    """Check if state still works with extra colums added to tables."""
    project_path = Path(tmpdir, "test.asreview")
    ASReviewProject.create(project_path)

    with open_state(project_path, read_only=False) as state:
        con = state._connect_to_sql()
        cur = con.cursor()
        cur.execute("ALTER TABLE last_ranking ADD COLUMN test_lr INTEGER;")
        cur.execute("ALTER TABLE results ADD COLUMN test_res INTEGER;")
        con.commit()
        con.close()

    record_ids = [1, 2, 3, 4, 5, 6]
    ranking = [1, 3, 4, 6, 2, 5]
    classifier = "nb"
    query_strategy = "max"
    balance_strategy = "double"
    feature_extraction = "tfidf"
    training_set = 2

    with open_state(project_path, read_only=False) as state:
        state.add_record_table(record_ids)
        state.add_last_ranking(
            ranking,
            classifier,
            query_strategy,
            balance_strategy,
            feature_extraction,
            training_set,
        )

        top_ranked = state.query_top_ranked(1)
        pool, labeled, pending = state.get_pool_labeled_pending()
        assert len(pending) == 1
        assert len(pool) == len(record_ids) - 1
        assert len(labeled) == 0

        state.add_labeling_data(top_ranked, [0 for _ in top_ranked])
        pool, labeled, pending = state.get_pool_labeled_pending()
        assert len(pending) == 0
        assert len(pool) == len(record_ids) - 1
        assert len(labeled) == 1
