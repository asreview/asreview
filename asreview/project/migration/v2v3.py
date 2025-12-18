import json
import shutil
from pathlib import Path


def _migrate(project):
    """Migrate an valid project file from version 2 to version 3.

    From version 2 to version 3 the changes to the project file are:

    - ./reviews/<review_id>/results.db is moved to ./results.db
    - ./reviews/<review_id>/settings_metadata.json is moved to ./settings_meta_data.json
    - ./reviews is deleted.
    In project.json:
    - The `reviews` attribute is moved to `review` and it is turned from a list into a
    single object.
    - The project file version is updated.

    Parameters
    ----------
    Project : str | Path
        Path to the root of the project (unzipped).
    """
    # In project.json, move the `reviews` attribute to `review`.
    config_fp = Path(project, "project.json")
    with open(config_fp) as f:
        project_config = json.load(f)
    project_config["project_file_version"] = 3
    review_config = project_config.pop("reviews", None)
    project_config["review"] = review_config or None
    with open(config_fp, "w") as f:
        json.dump(project_config, f)

    # Move the review state database and settings json to the project root.
    if review_config:
        review_id = review_config[0]["id"]
    review_dir = Path(project, "reviews", review_id)
    if review_dir.exists():
        results_db = Path(review_dir, "results.db")
        if results_db.exists():
            shutil.move(results_db, project)
        settings = Path(review_dir, "settings_metadata.json")
        if settings.exists():
            shutil.move(settings, project)
    shutil.rmtree(Path(project, "reviews"))
