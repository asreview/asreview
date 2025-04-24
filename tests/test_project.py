from pathlib import Path
import json

import asreview as asr
from asreview.models.classifiers import SVM


def test_project_load(asreview_test_project, tmpdir):
    project = asr.Project.load(asreview_test_project, tmpdir)

    assert Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "results.db",
    ).exists()
    assert Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    ).exists()

    assert Path(
        project.project_path,
        "data_store.db",
    ).exists()


def test_project_load_unknown_classifier(tmpdir):
    test_state_fp = Path(
        "tests", "asreview_files", "asreview-demo-project-invalid-classifier.asreview"
    )

    project = asr.Project.load(test_state_fp, tmpdir, reset_model_if_not_found=True)

    cycle_fp = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "settings_metadata.json",
    )

    with open(cycle_fp) as f:
        data = json.load(f)

        cycle = asr.ActiveLearningCycle.from_meta(
            asr.ActiveLearningCycleData(**data["current_value"])
        )

    assert data["name"].startswith("elas_u")
    assert isinstance(cycle.classifier, SVM)
