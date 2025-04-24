from os import getenv

import pytest


def pytest_addoption(parser):
    parser.addoption("--url", action="store", default="http://localhost:3000/")
    parser.addoption("--database-uri", action="store")
    parser.addoption("--reading-time", action="store", type=int, default=5)


@pytest.fixture
def chrome_options(chrome_options):
    if bool(getenv("CI", False)):
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
    return chrome_options


@pytest.fixture(scope="session")
def url(pytestconfig):
    return pytestconfig.getoption("url")


@pytest.fixture(scope="session")
def database_uri(pytestconfig):
    return pytestconfig.getoption("database_uri")


@pytest.fixture(scope="session")
def reading_time(pytestconfig):
    return pytestconfig.getoption("reading_time")
