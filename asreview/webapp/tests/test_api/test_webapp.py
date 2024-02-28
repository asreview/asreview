import pytest
from flask import current_app

import asreview.webapp.tests.utils.api_utils as au


def test_landing(client):
    if client.application.testing:
        pytest.skip("Skipping landing page test in testing mode.")

    r = au.call_root_url(client)
    assert r.status_code == 200
    assert (
        "<title>ASReview LAB - A tool for AI-assisted systematic reviews</title>"
        in r.text
    )  # noqa


def test_boot(setup_all_clients):
    r = au.call_boot_url(setup_all_clients)
    assert r.status_code == 200
    assert isinstance(r.json, dict)
    assert "authentication" in r.json.keys()
    # assert "status" in data.keys()  # what is the aim of this?
    assert "version" in r.json.keys()
    if not current_app.config.get("LOGIN_DISABLED"):
        assert r.json["authentication"]
        assert r.json["allow_account_creation"] == current_app.config.get(
            "ALLOW_ACCOUNT_CREATION"
        )
        assert r.json["email_verification"] == current_app.config.get(
            "EMAIL_VERIFICATION", False
        )
    else:
        assert not r.json["authentication"]
