import pytest
from pathlib import Path

import asreview as asr
from asreview.models.balancers import Balanced
from asreview.models.classifiers import SVM


def test_init_project_folder(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    project = asr.Project.create(project_path)

    assert Path(project_path, project.PATH_CONFIG).is_file()
    assert project.data_dir.is_dir()
    assert Path(project_path, project.PATH_FEATURE_MATRICES).is_dir()
    assert project.config["id"] == "test"


def test_init_project_already_exists(tmpdir):
    project_path = Path(tmpdir, "test.asreview")
    asr.Project.create(project_path)
    with pytest.raises(ValueError):
        asr.Project.create(project_path)


def test_project_load(asreview_test_project_path, tmpdir):
    project = asr.Project.load(asreview_test_project_path, tmpdir)

    assert project.db_path.exists()
    assert Path(project.project_path, project.PATH_CONFIG).exists()
    assert isinstance(project.db, asr.Database)
    project.db._is_valid()


def test_project_load_unknown_classifier(tmpdir):
    project_fp = Path(
        "tests", "asreview_files", "asreview-demo-project-invalid-classifier.asreview"
    )

    with pytest.warns(
        UserWarning, match="'idontknow' not found in group models.classifiers"
    ):
        project = asr.Project.load(project_fp, tmpdir, reset_model_if_not_found=True)
    cycle = asr.ActiveLearningCycle.from_meta(
        asr.ActiveLearningCycleData(**project.get_model_config())
    )

    assert project.config["review"]["model"]["name"].startswith("elas_u")
    assert isinstance(cycle.classifier, SVM)


def test_al_cycle_state(asreview_test_project, tmpdir):
    cycle = asr.ActiveLearningCycle.from_meta(
        asr.ActiveLearningCycleData(**asreview_test_project.get_model_config())
    )

    assert asreview_test_project.config["review"]["model"]["name"].startswith("elas_u")
    assert isinstance(cycle.balancer, Balanced)
