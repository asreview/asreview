import pytest

@pytest.fixture()
def setup_teardown():
    print("Hey1")
    yield
    print("Doei1")