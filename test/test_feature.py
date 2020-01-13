import os

from pytest import mark

from asreview.feature_extraction.utils import get_feature_model
from asreview.readers import ASReviewData


@mark.parametrize(
    "feature_extraction",
    [
        "doc2vec",
        "embedding-idf",
        #  "sbert",
        "tfidf",
    ])
def test_features(feature_extraction):
    embedding_fp = os.path.join("test", "demo_data", "generic.vec")
    data_fp = os.path.join("test", "demo_data", "generic.csv")

    as_data = ASReviewData.from_file(data_fp)
    _, texts, _ = as_data.get_data()
    if feature_extraction.startswith("embedding-"):
        model = get_feature_model(feature_extraction, embedding_fp=embedding_fp)
    else:
        model = get_feature_model(feature_extraction)
    X = model.fit_transform(texts)

    assert X.shape[0] == len(as_data.title)
    assert X.shape[1] > 0
