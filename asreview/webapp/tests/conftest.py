import pytest

from asreview.webapp.start_flask import create_app


@pytest.fixture
def app():

    app = create_app()

    return app


@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()
