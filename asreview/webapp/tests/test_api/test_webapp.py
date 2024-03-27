import pytest

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
