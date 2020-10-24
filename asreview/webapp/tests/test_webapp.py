
def test_landing(client):
    """Test if index.html is available.

    This test will fail if build is missing. Please run
    `python setup.py compile_assets` first.
    """
    response = client.get("/")
    html = response.data.decode()

    assert "<title>ASReview - A tool for AI-assisted systematic reviews</title>" in html  # noqa


def test_boot(client):
    """Test if version number is available on boot."""
    response = client.get("/boot")
    json_data = response.get_json()

    assert "version" in json_data
    assert "status" in json_data
