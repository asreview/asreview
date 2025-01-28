import os

import pytest

import asreview as asr
from asreview.extensions import extensions
from asreview.extensions import load_extension

REQUIRES_AI_MODEL_DEP = ["doc2vec", "embedding-idf", "sbert"]


def test_feature():
    assert len(extensions("models.feature_extractors")) >= 2


@pytest.mark.parametrize("feature_extractor", extensions("models.feature_extractors"))
def test_feature_name(feature_extractor):
    model = load_extension("models.feature_extractors", feature_extractor.name)()
    assert model.name == feature_extractor.name


@pytest.mark.parametrize("feature_extractor", extensions("models.feature_extractors"))
def test_feature_extractor_param(feature_extractor):
    model = load_extension("models.feature_extractors", feature_extractor.name)()
    assert isinstance(model.get_params(), dict)


@pytest.mark.parametrize("feature_extractor", extensions("models.feature_extractors"))
def test_features(tmpdir, feature_extractor):
    data_fp = os.path.join("tests", "demo_data", "generic.csv")

    data_store = asr.load_dataset(data_fp, dataset_id="test_id")
    model = load_extension("models.feature_extractors", feature_extractor.name)()

    X = model.fit_transform(data_store.get_df())

    assert X.shape[0] == len(data_store)
    assert X.shape[1] > 0
