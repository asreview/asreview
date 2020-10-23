def test_boot(client):
    """Test if version number is available on boot."""
    response = client.get("/boot")
    json_data = response.get_json()

    assert "version" in json_data
    assert "status" in json_data
