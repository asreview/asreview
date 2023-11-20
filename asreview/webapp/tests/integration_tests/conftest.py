import pytest


def pytest_addoption(parser):
    parser.addoption("--url", action="store", default="http://localhost:3000/")
    parser.addoption("--database-uri", action="store")
    parser.addoption("--reading-time", action="store", type=int, default=5)


@pytest.fixture(scope="session")
def url(pytestconfig):
    return pytestconfig.getoption("url")


@pytest.fixture(scope="session")
def database_uri(pytestconfig):
    return pytestconfig.getoption("database_uri")


@pytest.fixture(scope="session")
def reading_time(pytestconfig):
    return pytestconfig.getoption("reading_time")
