import json
import os
import pytest
from pathlib import Path
from shutil import copyfile

import numpy as np

from asreview.entry_points.simulate import SimulateEntryPoint
from asreview.state import open_state
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_settings_metadata_path
from asreview.models.classifiers import list_classifiers
from asreview.review.factory import get_reviewer


ADVANCED_DEPS = {"tensorflow": False}

try:
    import tensorflow  # noqa
    ADVANCED_DEPS["tensorflow"] = True
except ImportError:
    pass


DATA_FP = Path('tests', 'demo_data', 'generic_labels.csv')
DATA_FP_URL = "https://raw.githubusercontent.com/asreview/asreview/master/tests/demo_data/generic_labels.csv"  # noqa
DATA_FP_NO_ABS = Path("tests", "demo_data", "generic_labels_no_abs.csv")
DATA_FP_NO_TITLE = Path("tests", "demo_data", "generic_labels_no_title.csv")
EMBEDDING_FP = Path("tests", "demo_data", "generic.vec")
CFG_DIR = Path("tests", "cfg_files")
STATE_DIR = Path("tests", "state_files")
H5_STATE_FILE = Path(STATE_DIR, "test.h5")
JSON_STATE_FILE = Path(STATE_DIR, "test.json")


@pytest.mark.xfail(raises=FileNotFoundError,
                   reason="File, URL, or dataset does not exist: "
                   "'this_doesnt_exist.csv'")
def test_dataset_not_found(tmpdir):
    entry_point = SimulateEntryPoint()
    project_fp = Path(tmpdir, 'project.asreview')
    argv = f'does_not.exist -s {project_fp}'.split()
    entry_point.execute(argv)


def test_simulate(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    argv = f'{str(DATA_FP)} -s {project_path}'.split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    assert project_config['reviews'][0]['review_finished']


def test_prior_idx(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    argv = f'{str(DATA_FP)} -s {project_path} --prior_idx 1 3'.split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(project_path) as state:
        labeling_order = state.get_order_of_labeling()
        query_strategies = state.get_query_strategies()

    assert labeling_order[0] == 1
    assert labeling_order[1] == 3
    assert all(query_strategies[:1] == 'initial')
    assert all(query_strategies[2:] != 'initial')


def test_n_prior_included(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    argv = f'{str(DATA_FP)} -s {project_path} --n_prior_included 2'.split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(project_path) as state:
        result = state.get_dataset(['labels', 'query_strategies'])

    prior_included = \
        result['labels'] & (result['query_strategies'] == 'initial')
    assert sum(prior_included) == 2

    with open(get_settings_metadata_path(project_path), 'r') as f:
        settings_metadata = json.load(f)

    assert settings_metadata['settings']['n_prior_included'] == 2


def test_n_prior_excluded(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    argv = f'{str(DATA_FP)} -s {project_path} --n_prior_excluded 2'.split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open_state(project_path) as state:
        result = state.get_dataset(['labels', 'query_strategies'])

    prior_excluded = \
        ~result['labels'] & (result['query_strategies'] == 'initial')
    assert sum(prior_excluded) == 2

    with open(get_settings_metadata_path(project_path), 'r') as f:
        settings_metadata = json.load(f)

    assert settings_metadata['settings']['n_prior_excluded'] == 2


# TODO: Add random seed to settings.
# def test_seed(tmpdir):
#     project_path = Path(tmpdir, 'test.asreview')
#     argv = f'{str(DATA_FP)} -s {project_path} --seed 42'.split()
#     entry_point = SimulateEntryPoint()
#     entry_point.execute(argv)
#
#     with open(get_settings_metadata_path(project_path), 'r') as f:
#         settings_metadata = json.load(f)
#
#     assert settings_metadata['random_seed'] == 42


def test_non_tf_models(tmpdir):
    models = [
        'logistic',
        'nb',
        'rf',
        'svm'
    ]
    for model in models:
        print(model)
        project_path = Path(tmpdir, f'test_{model}.asreview')
        argv = f'{str(DATA_FP)} -s {project_path} -m {model}'.split()
        entry_point = SimulateEntryPoint()
        entry_point.execute(argv)

        with open_state(project_path) as state:
            classifiers = state.get_classifiers()
        assert all(classifiers == model)

        with open(get_settings_metadata_path(project_path), 'r') as f:
            settings_metadata = json.load(f)

        assert settings_metadata['settings']['model'] == model


# TODO: More tests?


@pytest.mark.xfail(not ADVANCED_DEPS["tensorflow"],
                   raises=ImportError,
                   reason="requires tensorflow")
def test_nn_2_layer(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(JSON_STATE_FILE, tmp_json_state_fp)

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
    copyfile(H5_STATE_FILE, tmp_h5_state_fp)

    check_model(config_file=Path(CFG_DIR, "lstm_base.ini"),
                state_file=tmp_h5_state_fp)


@pytest.mark.xfail(not ADVANCED_DEPS["tensorflow"],
                   raises=ImportError,
                   reason="requires tensorflow")
def test_lstm_pool(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(JSON_STATE_FILE, tmp_json_state_fp)

    check_model(config_file=Path(CFG_DIR, "lstm_pool.ini"),
                state_file=tmp_json_state_fp)


def test_logistic(tmpdir):

    # copy state file to tmp dir for changes
    tmp_json_state_fp = Path(tmpdir, "tmp_state.json")
    copyfile(JSON_STATE_FILE, tmp_json_state_fp)

    check_model(model="logistic",
                state_file=tmp_json_state_fp,
                n_instances=1,
                n_queries=2)


def test_classifiers():
    assert len(list_classifiers()) >= 7


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
                state_file=None,
                continue_from_state=False,
                mode="simulate",
                data_fp=DATA_FP,
                state_checker=check_state,
                prior_idx=[1, 2, 3, 4],
                **kwargs):
    if not continue_from_state:
        try:
            os.unlink(state_file)
        except (OSError, TypeError) as err:
            print(err)

    if monkeypatch is not None:
        monkeypatch.setattr('builtins.input', lambda _: "0")

    # start the review process.
    reviewer = get_reviewer(data_fp,
                            mode=mode,
                            embedding_fp=EMBEDDING_FP,
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


def test_n_queries_min(tmpdir):

    check_model(model="nb",
                state_file=None,
                use_granular=True,
                n_instances=1,
                n_queries='min')
