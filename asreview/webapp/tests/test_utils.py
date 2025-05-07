from asreview.webapp._api.utils import get_all_model_components
from asreview.webapp._api.utils import get_dist_extensions_metadata


def test_get_dist_extensions_metadata():
    assert "balancers" in get_dist_extensions_metadata()
    assert "classifiers" in get_dist_extensions_metadata()
    assert "feature_extractors" in get_dist_extensions_metadata()
    assert "queriers" in get_dist_extensions_metadata()

    assert "balanced" in get_dist_extensions_metadata()["balancers"]
    assert "label" in get_dist_extensions_metadata()["balancers"]["balanced"]


def test_get_all_model_components():
    # Call the function
    result = get_all_model_components()

    # Assert the result structure
    assert "balancers" in result
    assert "classifiers" in result
    assert "feature_extractors" in result
    assert "queriers" in result

    # Assert the mocked components are added correctly
    assert {"name": "balanced", "label": "Balanced Sample Weight"} in result[
        "balancers"
    ]
    assert len(result["classifiers"]) >= 1
    assert len(result["feature_extractors"]) >= 1
    assert len(result["queriers"]) >= 1
