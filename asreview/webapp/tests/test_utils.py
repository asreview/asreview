from asreview.webapp._api.utils import get_all_model_components


def test_get_all_model_components():
    # Call the function
    result = get_all_model_components()

    # Assert the result structure
    assert "balancer" in result
    assert "classifier" in result
    assert "feature_extractor" in result
    assert "querier" in result

    # Assert the mocked components are added correctly
    assert {"name": "balanced", "label": "Balanced Sample Weight"} in result["balancer"]
    assert len(result["classifier"]) >= 1
    assert len(result["feature_extractor"]) >= 1
    assert len(result["querier"]) >= 1
