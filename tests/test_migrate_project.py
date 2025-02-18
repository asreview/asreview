import json
from pathlib import Path

import jsonschema
import pandas

import asreview as asr
from asreview.project.schema import SCHEMA


def test_project_migration_1_to_2(tmpdir):
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

    assert project.config["version"].startswith("2.")
    jsonschema.validate(instance=project.config, schema=SCHEMA)

    # test state
    with asr.open_state(project) as state:
        state.get_results_table()
        state.get_last_ranking_table()
        state.get_decision_changes()

    data = project.data_store

    assert isinstance(data["title"], pandas.Series)
    assert isinstance(data["included"], pandas.Series)

    # test model settings
    with open(
        Path(
            project.project_path,
            "reviews",
            project.reviews[0]["id"],
            "settings_metadata.json",
        )
    ) as f:
        data = json.load(f)

    cycle_data = asr.ActiveLearningCycleData(**data["current_value"])
    cycle = asr.ActiveLearningCycle.from_meta(cycle_data)

    assert isinstance(cycle.classifier.name, str)
