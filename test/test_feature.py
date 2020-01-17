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
@mark.parametrize(
    "split_ta",
    [
        0,
        1,
    ])
def test_features(feature_extraction, split_ta):
    embedding_fp = os.path.join("test", "demo_data", "generic.vec")
    data_fp = os.path.join("test", "demo_data", "generic.csv")

    as_data = ASReviewData.from_file(data_fp)
    texts = as_data.texts
    if feature_extraction.startswith("embedding-"):
        model = get_feature_model(feature_extraction, split_ta=split_ta,
                                  embedding_fp=embedding_fp)
    else:
        model = get_feature_model(feature_extraction, split_ta=split_ta)
    X = model.fit_transform(texts, titles=as_data.title,
                            abstracts=as_data.abstract)

    assert X.shape[0] == len(as_data.title)
    assert X.shape[1] > 0
