import os

import pytest

import asreview as asr
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
    [
        0,
        1,
    ],
)
def test_features(feature_extraction, split_ta):
    if feature_extraction in REQUIRES_AI_MODEL_DEP:
        pytest.skip()

    embedding_fp = os.path.join("tests", "demo_data", "generic.vec")
    data_fp = os.path.join("tests", "demo_data", "generic.csv")

    as_data = asr.load_dataset(data_fp)
    texts = as_data.texts
    if feature_extraction.startswith("embedding-"):
        model = load_extension("models.feature_extraction", feature_extraction)(
            split_ta=split_ta, embedding_fp=embedding_fp
        )
    else:
        model = load_extension("models.feature_extraction", feature_extraction)(
            split_ta=split_ta
        )
    X = model.fit_transform(texts, titles=as_data.title, abstracts=as_data.abstract)

    assert X.shape[0] == len(as_data.title)
    assert X.shape[1] > 0
    assert isinstance(model.param, dict)
    assert model.name == feature_extraction


def test_feature_general():
    assert len(extensions("models.feature_extraction")) == 2
