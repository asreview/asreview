import pytest

import asreview.webapp._entry_points.lab as lab


@pytest.fixture
def mock_env_lab_testing(monkeypatch):
    monkeypatch.setenv("ASREVIEW_LAB_TESTING", "true")


def test_authentication_parameter(mock_env_lab_testing):
    app = lab.lab_entry_point(["--enable-auth"])
    assert app.config.get("AUTHENTICATION")


def test_without_authentication_parameter(mock_env_lab_testing):
    app = lab.lab_entry_point([])
    assert app.config.get("AUTHENTICATION") is False
