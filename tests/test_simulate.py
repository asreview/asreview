from pathlib import Path
import shutil

import asreview as asr
import pandas as pd

from asreview.models.feature_extraction import get_feature_model
from asreview.models.classifiers import get_classifier
from asreview.models.query import get_query_model
from asreview.models.balance import get_balance_model

DATA_FP = Path("tests", "demo_data", "generic_labels.csv")


def test_simulate(tmpdir):
    project = asr.Project.create(
        Path(tmpdir, "simulate-example"),
        "simulate-example",
        "simulate",
        "simulate-example",
    )

    data_path = Path(project.project_path, "data") / "generic_labels.csv"
    shutil.copy(DATA_FP, data_path)
    project.add_dataset(data_path.name)

    as_data = project.read_data()

    feature_model = get_feature_model("tfidf")
    fm = feature_model.fit_transform(
        as_data.texts, as_data.headings, as_data.bodies, as_data.keywords
    )
    project.add_feature_matrix(fm, feature_model.name)

    sim = asr.Simulate(
        fm,
        labels=as_data.labels,
        classifier=get_classifier("svm"),
        query_strategy=get_query_model("max_random"),
        balance_strategy=get_balance_model("double"),
        feature_extraction=feature_model,
        prior_indices=[0, 1],
    )

    sim.review()

    assert isinstance(sim._results, pd.DataFrame)
    assert sim._results.shape[0] == 6
    assert sim._results["label"].to_list() == [1, 0, 0, 0, 1, 1]

    assert isinstance(sim._last_ranking, pd.DataFrame)
    assert sim._last_ranking.shape[0] == 6
