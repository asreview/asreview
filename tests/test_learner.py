from itertools import product
from pathlib import Path

import pytest

import asreview as asr
from asreview.extensions import extensions
from asreview.models.balancers import Balanced
from asreview.models.queriers import Max


classifier_parameters = {
    "nb": {"alpha": 3.822},
    "rf": {"n_estimators": 50},
    "svm": {"loss": "squared_hinge", "C": 0.15},
    "logistic": {"C": 0.1},
}

feature_extractor_parameters = {
    "tfidf": {
        "ngram_range": (1, 2),
        "sublinear_tf": True,
        "min_df": 1,
        "max_df": 0.9,
    },
    "onehot": {"ngram_range": (1, 2)},
}

# Get all classifiers and feature extractors from ASReview, filtering contrib models
classifiers = [cls for cls in extensions("models.classifiers")]
feature_extractors = [fe for fe in extensions("models.feature_extractors")]

# Generate all combinations of classifier and feature extractor
pairs = list(product(classifiers, feature_extractors))

test_ids = [
    f"{classifier.name}__{feature_extractor.name}"
    for classifier, feature_extractor in pairs
]


@pytest.mark.parametrize("classifier, feature_extractor", pairs, ids=test_ids)
def test_alc_to_and_from_meta(classifier, feature_extractor):
    alc1 = asr.ActiveLearningCycle(
        classifier=classifier.load()(**classifier_parameters.get(classifier.name)),
        feature_extractor=feature_extractor.load()(
            **feature_extractor_parameters.get(feature_extractor.name)
        ),
        balancer=Balanced(ratio=5),
        querier=Max(),
    )

    alc2_meta = asr.ActiveLearningCycleData(
        classifier=classifier.name,
        classifier_param=classifier_parameters.get(classifier.name),
        feature_extractor=feature_extractor.name,
        feature_extractor_param=feature_extractor_parameters.get(
            feature_extractor.name
        ),
        balancer="balanced",
        balancer_param={"ratio": 5},
        querier="max",
    )

    alc1_meta = alc1.to_meta()

    alc1_from_meta = asr.ActiveLearningCycle.from_meta(alc1_meta)

    alc2_from_meta = asr.ActiveLearningCycle.from_meta(alc2_meta)

    assert (
        alc1.classifier.name
        == alc1_from_meta.classifier.name
        == alc2_from_meta.classifier.name
    ), "Classifier names do not match"
    assert (
        alc1.classifier.get_params()
        == alc1_from_meta.classifier.get_params()
        == alc2_from_meta.classifier.get_params()
    ), "Classifier parameters do not match"

    assert (
        alc1.feature_extractor.name
        == alc1_from_meta.feature_extractor.name
        == alc2_from_meta.feature_extractor.name
    ), "Feature extractor names do not match"
    assert (
        alc1.feature_extractor.get_params(deep=False)
        == alc1_from_meta.feature_extractor.get_params(deep=False)
        == alc2_from_meta.feature_extractor.get_params(deep=False)
    ), "Feature extractor parameters do not match"

    assert (
        alc1.balancer.name
        == alc1_from_meta.balancer.name
        == alc2_from_meta.balancer.name
    ), "Balancer names do not match"
    assert (
        alc1.balancer.get_params()
        == alc1_from_meta.balancer.get_params()
        == alc2_from_meta.balancer.get_params()
    ), "Balancer parameters do not match"

    assert (
        alc1.querier.name == alc1_from_meta.querier.name == alc2_from_meta.querier.name
    ), "Querier names do not match"
    assert (
        alc1.querier.get_params()
        == alc1_from_meta.querier.get_params()
        == alc2_from_meta.querier.get_params()
    ), "Querier parameters do not match"


@pytest.mark.parametrize("classifier, feature_extractor", pairs, ids=test_ids)
def test_alc_to_and_from_file(tmpdir, classifier, feature_extractor):
    alc1 = asr.ActiveLearningCycle(
        classifier=classifier.load()(**classifier_parameters.get(classifier.name)),
        feature_extractor=feature_extractor.load()(
            **feature_extractor_parameters.get(feature_extractor.name)
        ),
        balancer=Balanced(ratio=5),
        querier=Max(),
    )

    alc2_meta = asr.ActiveLearningCycleData(
        classifier=classifier.name,
        classifier_param=classifier_parameters.get(classifier.name),
        feature_extractor=feature_extractor.name,
        feature_extractor_param=feature_extractor_parameters.get(
            feature_extractor.name
        ),
        balancer="balanced",
        balancer_param={"ratio": 5},
        querier="max",
    )

    meta_file_path = Path(tmpdir, "alc1.json")
    alc1.to_file(meta_file_path)
    alc1_from_file = asr.ActiveLearningCycle.from_file(meta_file_path)

    alc2_from_meta = asr.ActiveLearningCycle.from_meta(alc2_meta)

    assert (
        alc1.classifier.name
        == alc1_from_file.classifier.name
        == alc2_from_meta.classifier.name
    ), "Classifier names do not match"
    assert (
        alc1.classifier.get_params()
        == alc1_from_file.classifier.get_params()
        == alc2_from_meta.classifier.get_params()
    ), "Classifier parameters do not match"

    assert (
        alc1.feature_extractor.name
        == alc1_from_file.feature_extractor.name
        == alc2_from_meta.feature_extractor.name
    ), "Feature extractor names do not match"

    assert (
        alc1.feature_extractor.get_params(deep=False)
        == alc1_from_file.feature_extractor.get_params(deep=False)
        == alc2_from_meta.feature_extractor.get_params(deep=False)
    ), "Feature extractor parameters do not match"

    assert (
        alc1.balancer.name
        == alc1_from_file.balancer.name
        == alc2_from_meta.balancer.name
    ), "Balancer names do not match"
    assert (
        alc1.balancer.get_params()
        == alc1_from_file.balancer.get_params()
        == alc2_from_meta.balancer.get_params()
    ), "Balancer parameters do not match"

    assert (
        alc1.querier.name == alc1_from_file.querier.name == alc2_from_meta.querier.name
    ), "Querier names do not match"
    assert (
        alc1.querier.get_params()
        == alc1_from_file.querier.get_params()
        == alc2_from_meta.querier.get_params()
    ), "Querier parameters do not match"
