import shutil
from pathlib import Path

import pandas as pd
import pytest
from scipy.sparse import csr_matrix

import asreview as asr
from asreview.project.exceptions import ProjectNotFoundError

TEST_LABELS = [1, 0, 0, 1, 1, 1, 0, 1, 1, 1]
TEST_INDICES = [16, 346, 509, 27, 11, 555, 554, 680, 264, 309]
TEST_RECORD_IDS = [17, 347, 510, 28, 12, 556, 555, 681, 265, 310]
TEST_RECORD_TABLE = list(range(851))
TEST_CLASSIFIERS = [None, None, None, None, "nb", "nb", "nb", "nb", "nb", "nb"]
TEST_QUERY_STRATEGIES = [
    None,
    None,
    None,
    None,
    "max",
    "max",
    "max",
    "max",
    "max",
    "max",
]
# The data in the test file still contains 'double' instead of 'balanced'.
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
TEST_feature_extractor = [
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
TEST_TRAINING_SETS = [pd.NA, pd.NA, pd.NA, pd.NA, 4, 5, 6, 7, 8, 9]
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

TEST_STATE_FP = Path(
    "tests", "asreview_files", "test_project_example_converted.asreview"
)
TEST_POOL_START = [157, 301, 536, 567, 416, 171, 659, 335, 329, 428]


@pytest.fixture
def asreview_test_project(tmpdir):
    shutil.copytree(
        TEST_STATE_FP, Path(tmpdir, "test_project_example_converted.asreview")
    )
    return Path(tmpdir, "test_project_example_converted.asreview")


def test_init_project_folder(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    project = asr.Project.create(project_path)

    assert Path(project_path, "project.json").is_file()
    assert project.data_dir.is_dir()
    assert Path(project_path, "feature_matrices").is_dir()
    assert Path(project_path, "reviews").is_dir()

    assert project.config["id"] == "test"


def test_init_project_already_exists(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with pytest.raises(ValueError):
        asr.Project.create(project_path)


def test_invalid_project_folder(tmpdir):
    project_path = Path(tmpdir, "this_is_not_a_project")
    with pytest.raises(ProjectNotFoundError):
        with asr.open_state(project_path):
            pass

    # there should be no folder called "this_is_not_a_project"
    assert not Path(project_path).is_dir()


def test_state_not_found(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with pytest.raises(FileNotFoundError):
        with asr.open_state(project_path, create_new=False):
            pass


def test_read_basic_state(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert isinstance(state, asr.SQLiteState)


def test_version_number_state(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert state.user_version == 2


def test_print_state(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        print(state)


def test_al_cycle_state(asreview_test_project):
    project = asr.Project(asreview_test_project)
    review_id = project.reviews[0]["id"]
    asr.ActiveLearningCycle.from_file(
        Path(project.project_path, "reviews", review_id, "settings_metadata.json")
    )


def test_create_new_state_file(tmpdir):
    project = asr.Project.create(Path(tmpdir, "test.asreview"))

    with asr.open_state(project) as state:
        state._is_valid_state()

    with pytest.raises(FileNotFoundError):
        asr.ActiveLearningCycle.from_file(
            Path(
                project.project_path,
                "reviews",
                project.reviews[0]["id"],
                "settings_metadata.json",
            )
        )


def test_get_dataset(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert isinstance(state.get_results_table(["querier"]), pd.DataFrame)
        assert isinstance(state.get_results_table(), pd.DataFrame)

        # Try getting a specific column.
        assert (
            state.get_results_table(["record_id"])["record_id"].to_list()
            == TEST_RECORD_IDS
        )
        assert (
            state.get_results_table(["feature_extractor"])[
                "feature_extractor"
            ].to_list()
            == TEST_feature_extractor
        )
        # Try getting all columns and that picking the right column.
        assert (
            state.get_results_table()["balancer"].to_list() == TEST_BALANCE_STRATEGIES
        )
        # Try getting a specific column with column name as string, instead of
        # list containing column name.

        assert (
            state.get_results_table("training_set")["training_set"].to_list()
            == TEST_TRAINING_SETS
        )


def test_get_dataset_drop_prior(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert (
            len(state.get_results_table(priors=False))
            == len(TEST_RECORD_IDS) - TEST_N_PRIORS
        )
        assert (state.get_results_table(priors=False)["querier"].notnull()).all()
        assert "querier" in state.get_results_table(priors=False).columns
        assert "querier" not in state.get_results_table("label", priors=False)


def test_get_dataset_drop_pending(tmpdir):
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_last_ranking(test_ranking, "nb", "max", "balanced", "tfidf", 4)
        state.add_labeling_data([4, 5, 6], [1, 0, 1])
        state.query_top_ranked(3)

        assert "label" in state.get_results_table(pending=False).columns
        assert "label" not in state.get_results_table("balancer", pending=False)
        assert len(state.get_results_table(pending=False)) == 3
        assert state.get_results_table(pending=False)["label"].notna().all()


def test_get_results_record(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        for idx in [2, 6, 8]:
            record_id = TEST_RECORD_IDS[idx]
            query = state.get_results_record(record_id)
            assert isinstance(query, pd.DataFrame)

            assert query["label"][0] == TEST_LABELS[idx]
            assert query["record_id"][0] == TEST_RECORD_IDS[idx]


def test_get_query_strategies(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert state.get_results_table()["querier"].to_list() == TEST_QUERY_STRATEGIES


def test_get_classifiers(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert state.get_results_table()["classifier"].to_list() == TEST_CLASSIFIERS


def test_get_training_sets(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert isinstance(state.get_results_table()["training_set"], pd.Series)

        assert state.get_results_table()["training_set"].to_list() == TEST_TRAINING_SETS


def test_get_order_of_labeling(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        assert isinstance(state.get_results_table()["record_id"], pd.Series)
        assert all(state.get_results_table()["record_id"] == TEST_RECORD_IDS)


def test_get_labels(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        labels = state.get_results_table("label")["label"]
        assert isinstance(labels, pd.Series)
        assert all(labels == TEST_LABELS)


def test_get_labels_no_priors(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        labels = state.get_results_table("label", priors=False)["label"]
        assert isinstance(labels, pd.Series)
        assert all(labels == TEST_LABELS[4:])


def test_get_labeling_times(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        results = state.get_results_table()
        assert isinstance(results["time"], pd.Series)
        assert results["time"].dtype == "Float64"


def test_get_feature_matrix(asreview_test_project):
    project = asr.Project(asreview_test_project)

    assert len(project.feature_matrices) == 1

    feature_model_name = project.feature_matrices[0]["id"]

    print(project.config)
    feature_matrix = project.get_feature_matrix(feature_model_name)
    assert isinstance(feature_matrix, csr_matrix)


def test_move_ranking_data_to_results(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_last_ranking(
            range(1, len(TEST_RECORD_TABLE) + 1), "nb", "max", "balanced", "tfidf", 4
        )
        state.query_top_ranked(4)
        data = state.get_results_table(pending=True)

    assert data["record_id"].to_list() == [1, 2, 3, 4]
    assert data["label"].isnull().sum() == 4
    assert data["classifier"].to_list() == ["nb"] * 4


def test_query_top_ranked(tmpdir):
    test_ranking = [2, 1, 0] + list(range(3, len(TEST_RECORD_TABLE)))
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_last_ranking(test_ranking, "nb", "max", "balanced", "tfidf", 4)
        top_ranked = state.query_top_ranked(5)

        assert top_ranked["record_id"].to_list() == [2, 1, 0, 3, 4]
        data = state.get_results_table(pending=True)
        assert data["record_id"].to_list() == [2, 1, 0, 3, 4]
        assert data["classifier"].to_list() == ["nb"] * 5
        assert data["querier"].to_list() == ["max"] * 5
        assert data["balancer"].to_list() == ["balanced"] * 5
        assert data["feature_extractor"].to_list() == ["tfidf"] * 5
        assert data["training_set"].to_list() == [4] * 5


def test_add_labeling_data(tmpdir):
    test_ranking = list(range(len(TEST_RECORD_TABLE)))
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_last_ranking(test_ranking, "nb", "max", "balanced", "tfidf", 4)
        for i in range(3):
            # Test without specifying notes.
            state.add_labeling_data([TEST_RECORD_IDS[i]], [TEST_LABELS[i]])

        # Test with specifying notes and with larger batch.
        state.add_labeling_data(TEST_RECORD_IDS[3:6], TEST_LABELS[3:6])

        data = state.get_results_table(pending=True)
        assert data["record_id"].to_list() == TEST_RECORD_IDS[:6]
        assert data["label"].to_list() == TEST_LABELS[:6]
        assert data["classifier"].to_list() == [None] * 6
        assert data["querier"].to_list() == [None] * 6
        assert data["balancer"].to_list() == [None] * 6
        assert data["feature_extractor"].to_list() == [None] * 6
        assert data["training_set"].isna().all()

        state.query_top_ranked(3)
        data = state.get_results_table(pending=True)
        assert data["label"].to_list()[:6] == TEST_LABELS[:6]
        assert data["label"][6:].isna().all()
        assert data["record_id"].to_list() == TEST_RECORD_IDS[:6] + [0, 1, 2]

        state.add_labeling_data([1], [1])
        labels = state.get_results_table("label", pending=True)["label"]
        assert labels.to_list()[:6] == TEST_LABELS[:6]
        assert labels[7] == 1

        state.add_labeling_data([0, 2], [0, 1])
        data = state.get_results_table(pending=True)
        assert data["label"].to_list() == TEST_LABELS[:6] + [0, 1, 1]


def test_ranking_with_labels(tmpdir):
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_last_ranking(test_ranking, "nb", "max", "balanced", "tfidf", 4)
        state.add_labeling_data([4, 5, 6], [1, 0, 1])

        ranking_with_labels = state.get_ranking_with_labels()
        assert isinstance(ranking_with_labels, pd.DataFrame)
        assert list(ranking_with_labels.columns) == ["record_id", "label"]

        subset_with_labels = ranking_with_labels[ranking_with_labels["label"].notnull()]
        subset_without_labels = ranking_with_labels[
            ranking_with_labels["label"].isnull()
        ]

        assert subset_without_labels["record_id"].to_list() == [10, 9, 8, 7, 3, 2, 1]
        assert subset_with_labels["record_id"].to_list() == [6, 5, 4]
        assert subset_with_labels["label"].to_list() == [1, 0, 1]

        pool2 = state.get_pool()
        labeled2 = state.get_results_table()[["record_id", "label"]]

        assert isinstance(pool2, pd.Series)
        assert isinstance(labeled2, pd.DataFrame)

        assert pool2.name == "record_id"
        assert list(labeled2.columns) == ["record_id", "label"]

        assert subset_without_labels["record_id"].to_list() == pool2.to_list()
        assert set(subset_with_labels["record_id"]) == set(labeled2["record_id"])
        assert subset_with_labels["label"].to_list() == labeled2["label"].to_list()


def test_exist_new_labeled_records(tmpdir):
    test_ranking = range(10, 0, -1)
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        assert not state.exist_new_labeled_records
        state.add_last_ranking(test_ranking, "nb", "max", "balanced", "tfidf", 3)

        assert not state.exist_new_labeled_records
        state.add_labeling_data([4, 5, 6], [1, 0, 1])

        assert not state.exist_new_labeled_records
        state.query_top_ranked(3)
        assert not state.exist_new_labeled_records
        state.add_labeling_data([8, 9, 10], [1, 1, 1])
        assert state.exist_new_labeled_records


def test_update_decision(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with asr.open_state(project_path) as state:
        state.add_labeling_data(TEST_RECORD_IDS[:3], TEST_LABELS[:3])

        for i in range(3):
            state.update(TEST_RECORD_IDS[i], 1 - TEST_LABELS[i])
            new_label = state.get_results_record(TEST_RECORD_IDS[i])["label"][0]
            assert new_label == 1 - TEST_LABELS[i]

        state.update(TEST_RECORD_IDS[1], TEST_LABELS[1])
        new_label = state.get_results_record(TEST_RECORD_IDS[1])["label"][0]
        assert new_label == TEST_LABELS[1]

        change_table = state.get_decision_changes()
        changed_records = TEST_RECORD_IDS[:3] + [TEST_RECORD_IDS[1]]
        new_labels = [1 - x for x in TEST_LABELS[:3]] + [TEST_LABELS[1]]

        assert change_table["record_id"].to_list() == changed_records
        assert change_table["new_label"].to_list() == new_labels


def test_get_ranking_with_labels(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        ranking_with_labels = state.get_ranking_with_labels()

    assert isinstance(ranking_with_labels, pd.DataFrame)
    assert list(ranking_with_labels.columns) == ["record_id", "label"]

    assert (
        ranking_with_labels.loc[ranking_with_labels["label"].isnull(), "record_id"][
            :10
        ].to_list()
        == TEST_POOL_START
    )
    assert set(
        ranking_with_labels.loc[ranking_with_labels["label"].notnull(), "record_id"]
    ) == set(TEST_RECORD_IDS)
    assert set(
        ranking_with_labels.loc[ranking_with_labels["label"].notnull(), "label"]
    ) == set(TEST_LABELS)


def test_last_ranking(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)

    record_ids = [1, 2, 3, 4, 5, 6]
    ranking = [1, 3, 4, 6, 2, 5]
    classifier = "nb"
    querier = "max"
    balancer = "balanced"
    feature_extractor = "tfidf"
    training_set = 2

    with asr.open_state(project_path) as state:
        state.add_last_ranking(
            ranking,
            classifier,
            querier,
            balancer,
            feature_extractor,
            training_set,
        )

        last_ranking = state.get_last_ranking_table()
        assert isinstance(last_ranking, pd.DataFrame)
        assert list(last_ranking.columns) == [
            "record_id",
            "ranking",
            "classifier",
            "querier",
            "balancer",
            "feature_extractor",
            "training_set",
            "time",
        ]

        assert last_ranking["ranking"].to_list() == [0, 1, 2, 3, 4, 5]
        assert last_ranking["record_id"].to_list() == ranking
        assert last_ranking["classifier"].to_list() == [classifier] * len(record_ids)


def test_get_pool(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        pool = state.get_pool()

    assert isinstance(pool, pd.Series)
    assert len(pool) == 841
    assert pool[:10].to_list() == TEST_POOL_START


def test_get_labeled(asreview_test_project):
    with asr.open_state(asreview_test_project) as state:
        labeled = state.get_results_table()[["record_id", "label"]]

    assert isinstance(labeled, pd.DataFrame)
    assert labeled["record_id"].to_list() == TEST_RECORD_IDS
    assert labeled["label"].to_list() == TEST_LABELS


def test_add_extra_column(tmpdir):
    """Check if state still works with extra colums added to tables."""
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)

    with asr.open_state(project_path) as state:
        con = state._conn
        cur = con.cursor()
        cur.execute("ALTER TABLE last_ranking ADD COLUMN test_lr INTEGER;")
        cur.execute("ALTER TABLE results ADD COLUMN test_res INTEGER;")
        con.commit()
        con.close()

    record_ids = [1, 2, 3, 4, 5, 6]
    ranking = [1, 3, 4, 6, 2, 5]
    classifier = "nb"
    querier = "max"
    balancer = "balanced"
    feature_extractor = "tfidf"
    training_set = 2

    with asr.open_state(project_path) as state:
        state.add_last_ranking(
            ranking,
            classifier,
            querier,
            balancer,
            feature_extractor,
            training_set,
        )

        top_ranked = state.query_top_ranked(1)["record_id"]
        ranking_with_labels = state.get_ranking_with_labels()
        assert ranking_with_labels["label"].isnull().sum() == len(record_ids)
        assert ranking_with_labels["label"].notnull().sum() == 0

        state.add_labeling_data(top_ranked, [0 for _ in top_ranked])
        ranking_with_labels = state.get_ranking_with_labels()

        assert ranking_with_labels["label"].isnull().sum() == len(record_ids) - 1
        assert ranking_with_labels["label"].notnull().sum() == 1
