from pathlib import Path

import asreview as asr
from asreview.models.classifiers import SVM


def test_project_load(asreview_test_project, tmpdir):
    project = asr.Project.load(asreview_test_project, tmpdir)

    assert Path(project.project_path, "results.db").exists()
    assert Path(project.project_path, "project.json").exists()
    assert Path(project.project_path, "data_store.db").exists()


def test_project_load_unknown_classifier(tmpdir):
    test_state_fp = Path(
        "tests", "asreview_files", "asreview-demo-project-invalid-classifier.asreview"
    )

    project = asr.Project.load(test_state_fp, tmpdir, reset_model_if_not_found=True)
    cycle = asr.ActiveLearningCycle.from_meta(
        asr.ActiveLearningCycleData(**project.get_model_config())
    )

    assert project.config["review"]["model"]["name"].startswith("elas_u")
    assert isinstance(cycle.classifier, SVM)
