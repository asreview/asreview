import shutil
from pathlib import Path

import jsonschema
import pandas
import pytest

import asreview as asr
from asreview.project.migration import detect_version
from asreview.project.schema import SCHEMA


@pytest.fixture
def asreview_v2_project(tmpdir):
    """Fixture to set up a test project for ASReview."""
    test_state_fp = Path("tests", "asreview_files", "asreview-demo-project-v2.asreview")
    tmp_project_path = Path(tmpdir, "asreview-demo-project-v2.asreview")
    shutil.copy(test_state_fp, tmp_project_path)
    return tmp_project_path


def assert_valid_project(project):
    assert detect_version(project.config) == 3
    jsonschema.validate(instance=project.config, schema=SCHEMA)

    # test state
    with asr.open_state(project) as state:
        state.get_results_table()
        state.get_last_ranking_table()
        state.get_decision_changes()

    data = project.data_store

    assert isinstance(data["title"], pandas.Series)
    assert isinstance(data["included"], pandas.Series)

    cycle_data = asr.ActiveLearningCycleData(
        **project.get_model_config()
    )
    cycle = asr.ActiveLearningCycle.from_meta(cycle_data)

    assert isinstance(cycle.classifier.name, str)


def test_project_migration_1_to_3(tmpdir):
    asreview_v1_file = Path(
        "asreview",
        "webapp",
        "tests",
        "asreview-project-file-archive",
        "v1.5",
        "asreview-project-v1-5-startreview.asreview",
    )
    assert asreview_v1_file.exists()
    project = asr.Project.load(open(asreview_v1_file, "rb"), tmpdir, safe_import=True)
    assert_valid_project(project)


def test_project_migration_2_to_3(tmpdir, asreview_v2_project):
    project = asr.Project.load(
        open(asreview_v2_project, "rb"), tmpdir, safe_import=True
    )
    assert_valid_project(project)
