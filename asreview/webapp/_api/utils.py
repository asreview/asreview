import json
from pathlib import Path

def read_tags_data(project):
    """Read tags data from the tags.json file."""
    tags_path = Path(
        project.project_path,
        "reviews",
        project.reviews[0]["id"],
        "tags.json",
    )
    try:
        with open(tags_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
    except Exception as err:
        raise RuntimeError(f"Failed to read tags data: {err}")
