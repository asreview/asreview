import pytest
from pathlib import Path
import json

from asreview.entry_points.simulate import SimulateEntryPoint
from asreview.state import open_state
from asreview.state.paths import get_project_file_path
from asreview.state.paths import get_settings_metadata_path

DATASET_FP = Path('tests', 'demo_data', 'generic_labels.csv')


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
    argv = f'{str(DATASET_FP)} -s {project_path}'.split()
    entry_point = SimulateEntryPoint()
    entry_point.execute(argv)

    with open(get_project_file_path(project_path), 'r') as f:
        project_config = json.load(f)

    assert project_config['reviews'][0]['review_finished']


def test_prior_idx(tmpdir):
    project_path = Path(tmpdir, 'test.asreview')
    argv = f'{str(DATASET_FP)} -s {project_path} --prior_idx 1 3'.split()
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
    argv = f'{str(DATASET_FP)} -s {project_path} --n_prior_included 2'.split()
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
    argv = f'{str(DATASET_FP)} -s {project_path} --n_prior_excluded 2'.split()
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
#     argv = f'{str(DATASET_FP)} -s {project_path} --seed 42'.split()
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
        argv = f'{str(DATASET_FP)} -s {project_path} -m {model}'.split()
        entry_point = SimulateEntryPoint()
        entry_point.execute(argv)

        with open_state(project_path) as state:
            classifiers = state.get_classifiers()
        assert all(classifiers == model)

        with open(get_settings_metadata_path(project_path), 'r') as f:
            settings_metadata = json.load(f)

        assert settings_metadata['settings']['model'] == model


# TODO: More tests?
