import os
from pathlib import Path

import pytest

import asreview as asr
from asreview.data import DataStore
from asreview.extensions import extensions
from asreview.extensions import load_extension

REQUIRES_AI_MODEL_DEP = ["doc2vec", "embedding-idf", "sbert"]


def test_feature():
    assert len(extensions("models.feature_extraction")) >= 2


@pytest.mark.parametrize("feature_extraction", extensions("models.feature_extraction"))
def test_feature_name(feature_extraction):
    model = load_extension("models.feature_extraction", feature_extraction.name)()
    assert model.name == feature_extraction.name


@pytest.mark.parametrize("feature_extraction", extensions("models.feature_extraction"))
def test_feature_param(feature_extraction):
    model = load_extension("models.feature_extraction", feature_extraction.name)()
    assert isinstance(model.get_params(), dict)


@pytest.mark.parametrize("feature_extraction", extensions("models.feature_extraction"))
@pytest.mark.parametrize("split_ta", [False, True])
def test_features(tmpdir, feature_extraction, split_ta):
    print(feature_extraction.name)

    data_fp = os.path.join("tests", "demo_data", "generic.csv")

    records = asr.load_dataset(data_fp, dataset_id="test_id")
    data_store = DataStore(Path(tmpdir, "store.db"))
    data_store.create_tables()
    data_store.add_records(records)
    model = load_extension("models.feature_extraction", feature_extraction.name)()
    if split_ta:
        titles = data_store["title"]
        abstracts = data_store["abstract"]
        X = model.fit_transform(titles, abstracts)
    else:
        X = model.fit_transform(data_store.get_texts())

    assert X.shape[0] == len(data_store)
    assert X.shape[1] > 0
