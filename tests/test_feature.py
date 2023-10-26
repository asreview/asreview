import os

import pytest

from asreview import ASReviewData
from asreview.models.feature_extraction import get_feature_model
from asreview.models.feature_extraction import list_feature_extraction

ADVANCED_DEPS = {"tensorflow": False}

REQUIRES_EXTRA_DEPS = ["doc2vec", "embedding-idf", "sbert"]

try:
    import tensorflow  # noqa

    ADVANCED_DEPS["tensorflow"] = True
except ImportError:
    pass


@pytest.mark.parametrize(
    "feature_extraction",
    [
        "doc2vec",
        "embedding-idf",
        #  "sbert",
        "tfidf",
    ],
)
@pytest.mark.parametrize(
    "split_ta",
    [
        0,
        1,
    ],
)
def test_features(feature_extraction, split_ta):
    if feature_extraction in REQUIRES_EXTRA_DEPS and not ADVANCED_DEPS["tensorflow"]:
        pytest.skip()

    embedding_fp = os.path.join("tests", "demo_data", "generic.vec")
    data_fp = os.path.join("tests", "demo_data", "generic.csv")

    as_data = ASReviewData.from_file(data_fp)
    texts = as_data.texts
    if feature_extraction.startswith("embedding-"):
        model = get_feature_model(
            feature_extraction, split_ta=split_ta, embedding_fp=embedding_fp
        )
    else:
        model = get_feature_model(feature_extraction, split_ta=split_ta)
    X = model.fit_transform(texts, titles=as_data.title, abstracts=as_data.abstract)

    assert X.shape[0] == len(as_data.title)
    assert X.shape[1] > 0
    assert isinstance(model.param, dict)
    assert model.name == feature_extraction


def test_feature_general():
    assert len(list_feature_extraction()) >= 5
