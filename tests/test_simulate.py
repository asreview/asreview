import os
from shutil import copyfile
from pathlib import Path

import numpy as np
import pytest

from asreview.models.classifiers import list_classifiers
from asreview.state import open_state
from asreview.review.factory import get_reviewer

ADVANCED_DEPS = {"tensorflow": False}

try:
    import tensorflow  # noqa
    ADVANCED_DEPS["tensorflow"] = True
except ImportError:
    pass

data_fp = Path("tests", "demo_data", "generic_labels.csv")
data_fp_no_abs = Path("tests", "demo_data", "generic_labels_no_abs.csv")
data_fp_no_title = Path("tests", "demo_data", "generic_labels_no_title.csv")
data_fp_partial = Path("tests", "demo_data", "generic_partial_labels.csv")
embedding_fp = Path("tests", "demo_data", "generic.vec")
cfg_dir = Path("tests", "cfg_files")
state_dir = Path("tests", "state_files")
h5_state_file = Path(state_dir, "test.h5")
json_state_file = Path(state_dir, "test.json")


@pytest.mark.xfail(
    raises=FileNotFoundError,
    reason="Dataset not found"
)
def test_dataset_not_found():
    reviewer = get_reviewer("doesnt_exist.csv", mode="simulate")
    reviewer.review()


def test_state_continue_json(tmpdir):

    inter_file = Path(state_dir, "test_1_inst.json")

    if not inter_file.is_file():
        reviewer = get_reviewer(data_fp,
                                mode="simulate",
                                model="nb",
                                embedding_fp=embedding_fp,
                                prior_idx=[1, 2, 3, 4],
                                state_file=inter_file,
                                n_instances=1,
                                n_queries=1)
        reviewer.review()

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(inter_file, tmp_json_state_fp)

    check_model(model="nb",
                state_file=tmp_json_state_fp,
                continue_from_state=True,
                n_instances=1,
                n_queries=2)


def test_state_continue_h5(tmpdir):

    inter_file = Path(state_dir, "test_1_inst.h5")

    if not inter_file.is_file():
        reviewer = get_reviewer(data_fp,
                                mode="simulate",
                                model="nb",
                                embedding_fp=embedding_fp,
                                prior_idx=[1, 2, 3, 4],
                                state_file=inter_file,
                                n_instances=1,
                                n_queries=1)
        reviewer.review()

    # copy state file to tmp dir for changes
    tmp_h5_state_fp = Path(tmpdir, "tmp_state.h5")
    copyfile(inter_file, tmp_h5_state_fp)

    check_model(model="nb",
                state_file=tmp_h5_state_fp,
                continue_from_state=True,
                n_instances=1,
                n_queries=2)


def test_nb(tmpdir):

    # copy state file to tmp dir for changes
    tmp_h5_state_fp = Path(tmpdir, "tmp_state_nb.h5")

    check_model(model="nb",
                state_file=tmp_h5_state_fp,
                use_granular=True,
                n_instances=1,
                n_queries=1)


def test_svm(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(json_state_file, tmp_json_state_fp)

    check_model(model="svm",
                state_file=tmp_json_state_fp,
                n_instances=1,
                n_queries=2,
                data_fp=data_fp_no_abs)


def test_rf(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(json_state_file, tmp_json_state_fp)

    check_model(model="rf",
                state_file=tmp_json_state_fp,
                n_instances=1,
                n_queries=2,
                data_fp=data_fp_no_title)


@pytest.mark.xfail(not ADVANCED_DEPS["tensorflow"],
                   raises=ImportError,
                   reason="requires tensorflow")
def test_nn_2_layer(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(json_state_file, tmp_json_state_fp)

    check_model(model="nn-2-layer",
                state_file=tmp_json_state_fp,
                n_instances=1,
                n_queries=2)


@pytest.mark.xfail(not ADVANCED_DEPS["tensorflow"],
                   raises=ImportError,
                   reason="requires tensorflow")
def test_lstm_base(tmpdir):

    # copy state file to tmp dir for changes
    tmp_h5_state_fp = Path(tmpdir, "tmp_state.h5")
    copyfile(h5_state_file, tmp_h5_state_fp)

    check_model(config_file=Path(cfg_dir, "lstm_base.ini"),
                state_file=tmp_h5_state_fp)


@pytest.mark.xfail(not ADVANCED_DEPS["tensorflow"],
                   raises=ImportError,
                   reason="requires tensorflow")
def test_lstm_pool(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(json_state_file, tmp_json_state_fp)

    check_model(config_file=Path(cfg_dir, "lstm_pool.ini"),
                state_file=tmp_json_state_fp)


def test_logistic(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(json_state_file, tmp_json_state_fp)

    check_model(model="logistic",
                state_file=tmp_json_state_fp,
                n_instances=1,
                n_queries=2)


def test_classifiers():
    assert len(list_classifiers()) >= 7


def test_partial_simulation(tmpdir):

    # copy state file to tmp dir for changes
    tmp_h5_state_fp = Path(tmpdir, "tmp_state.h5")
    copyfile(h5_state_file, tmp_h5_state_fp)

    check_model(data_fp=data_fp_partial,
                state_file=tmp_h5_state_fp,
                n_prior_included=1,
                n_prior_excluded=1,
                prior_idx=None,
                state_checker=check_partial_state)


@pytest.mark.xfail(
    raises=ValueError,
    reason="prior_idx not available for partly labeled data"
)
def test_partial_simulation_2(tmpdir):

    # copy state file to tmp dir for changes
    tmp_h5_state_fp = Path(tmpdir, "tmp_state.h5")
    copyfile(h5_state_file, tmp_h5_state_fp)

    check_model(data_fp=data_fp_partial,
                state_file=tmp_h5_state_fp,
                prior_idx=[0, 5],
                state_checker=check_partial_state)


def check_label_methods(label_methods, n_labels, methods):
    assert len(label_methods) == n_labels
    for method in label_methods:
        assert method in methods


def check_state(state):

    check_label_methods(state.get("label_methods", 0), 4, ["initial"])
    check_label_methods(state.get("label_methods", 1), 1, ["max", "random"])
    check_label_methods(state.get("label_methods", 2), 1, ["max", "random"])

    assert len(state.get("inclusions", 0)) == 4
    assert len(state.get("inclusions", 1)) == 1
    assert len(state.get("inclusions", 2)) == 1

    assert len(state.get("train_idx", 1)) == 4
    assert len(state.get("pool_idx", 1)) == 2

    assert len(state.get("train_idx", 2)) == 5
    assert len(state.get("pool_idx", 2)) == 1

    assert len(state.get("labels")) == 6


def check_partial_state(state):
    check_label_methods(state.get("label_methods", 0), 2, ["initial"])
    check_label_methods(state.get("label_methods", 1), 1, ["max", "random"])
    check_label_methods(state.get("label_methods", 2), 1, ["max", "random"])

    assert len(state.get("inclusions", 0)) == 2
    assert len(state.get("inclusions", 1)) == 1
    assert len(state.get("inclusions", 2)) == 1

    assert len(state.get("train_idx", 1)) == 2
    assert len(state.get("pool_idx", 1)) == 2

    assert len(state.get("train_idx", 2)) == 3
    assert len(state.get("pool_idx", 2)) == 1

    assert len(state.get("labels")) == 4


def check_model(monkeypatch=None,
                use_granular=False,
                state_file=h5_state_file,
                continue_from_state=False,
                mode="simulate",
                data_fp=data_fp,
                state_checker=check_state,
                prior_idx=[1, 2, 3, 4],
                **kwargs):
    # if not continue_from_state:
    #     try:
    #         if state_file is not None:
    #             os.unlink(state_file)
    #     except OSError as err:
    #         print(err)

    if monkeypatch is not None:
        monkeypatch.setattr('builtins.input', lambda _: "0")

    # start the review process.
    reviewer = get_reviewer(data_fp,
                            mode=mode,
                            embedding_fp=embedding_fp,
                            prior_idx=prior_idx,
                            state_file=state_file,
                            **kwargs)

    if use_granular:
        with open_state(state_file) as state:
            # Two loops of training and classification.
            reviewer.train()
            reviewer.log_probabilities(state)
            query_idx = reviewer.query(1)
            inclusions = reviewer._get_labels(query_idx)
            reviewer.classify(query_idx, inclusions, state)

            reviewer.train()
            reviewer.log_probabilities(state)
            query_idx = reviewer.query(1)
            inclusions = reviewer._get_labels(query_idx)
            reviewer.classify(query_idx, inclusions, state)
    else:

        with open_state(state_file) as state:
            if state_file is None:
                state.set_labels(reviewer.y)
                init_idx, init_labels = reviewer._prior_knowledge()
                reviewer.query_i = 0
                reviewer.train_idx = np.array([], dtype=np.int)

                reviewer.classify(init_idx,
                                  init_labels,
                                  state,
                                  method="initial")

            reviewer._do_review(state)
            if state_file is None:
                print(state._state_dict)
                check_state(state)

    if state_file is not None:
        with open_state(state_file, read_only=True) as state:
            state_checker(state)
