import os
from pathlib import Path

import pytest

import asreview as asr
from asreview.data import DataStore
from asreview.extensions import extensions
from asreview.extensions import load_extension

REQUIRES_AI_MODEL_DEP = ["doc2vec", "embedding-idf", "sbert"]


@pytest.mark.parametrize(
    "feature_extraction",
    [
        "tfidf",
    ],  # + REQUIRES_AI_MODEL_DEP
)
@pytest.mark.parametrize(
    "split_ta",
    [False, True],
)
def test_features(tmpdir, feature_extraction, split_ta):
    if feature_extraction in REQUIRES_AI_MODEL_DEP:
        pytest.skip()

    data_fp = os.path.join("tests", "demo_data", "generic.csv")

    records = asr.load_dataset(data_fp, dataset_id="test_id")
    data_store = DataStore(Path(tmpdir, "store.db"))
    data_store.create_tables()
    data_store.add_records(records)
    if feature_extraction.startswith("embedding-"):
        model = load_extension("models.feature_extraction", feature_extraction)()
    else:
        model = load_extension("models.feature_extraction", feature_extraction)()
    if split_ta:
        titles = data_store["title"]
        abstracts = data_store["abstract"]
        X = model.fit_transform(titles, abstracts)
    else:
        X = model.from_data_store(data_store)

    assert X.shape[0] == len(data_store)
    assert X.shape[1] > 0
    assert isinstance(model.param, dict)
    assert model.name == feature_extraction


def test_feature_general():
    assert len(extensions("models.feature_extraction")) == 2
