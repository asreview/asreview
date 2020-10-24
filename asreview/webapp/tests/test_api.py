
def test_get_projects(client):
    """Test get projects."""
    response = client.get("/api/projects")
    json_data = response.get_json()

    assert "result" in json_data
    assert isinstance(json_data["result"], list)
