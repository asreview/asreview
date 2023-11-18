from flask import current_app

import asreview.webapp.tests.utils.api_utils as au


# Test if index.html is available!
# Note: This test will fail if build is missing. Please run
# `python setup.py compile_assets` first.
def test_landing(setup):
    client, _, _ = setup

    status_code, _, html = au.call_root_url(client)
    assert status_code == 200
    assert (
        "<title>ASReview LAB - A tool for AI-assisted systematic reviews</title>"
        in html
    )  # noqa


# Test boot data!
def test_boot(setup_all_clients):
    status_code, data = au.call_boot_url(setup_all_clients)
    assert status_code == 200
    assert isinstance(data, dict)
    assert "authentication" in data.keys()
    # assert "status" in data.keys()  # what is the aim of this?
    assert "version" in data.keys()
    if not current_app.config.get("LOGIN_DISABLED"):
        assert data["authentication"]
        assert data["allow_account_creation"] == current_app.config.get(
            "ALLOW_ACCOUNT_CREATION"
        )
        assert data["email_verification"] == current_app.config.get(
            "EMAIL_VERIFICATION", False
        )
    else:
        assert not data["authentication"]
