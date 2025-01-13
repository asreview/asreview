import pytest

from asreview.extensions import extensions
from asreview.extensions import load_extension


def test_classifiers():
    assert len(extensions("models.classifiers")) >= 1


@pytest.mark.parametrize("classifier", extensions("models.classifiers"))
def test_classifier_name(classifier):
    model = load_extension("models.classifiers", classifier.name)()
    assert model.name == classifier.name


@pytest.mark.parametrize("classifier", extensions("models.classifiers"))
def test_classifier_param(classifier):
    model = load_extension("models.classifiers", classifier.name)()
    assert isinstance(model.get_params(), dict)
