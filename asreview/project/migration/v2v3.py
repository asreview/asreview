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
    review_config = {}
    old_review_config = project_config.pop("reviews", [{}])[0]
    review_config["status"] = old_review_config.get("status", "setup")

    # Move the review state database to the project root and add the review settings to
    # the project config.
    if old_review_config and "id" in old_review_config:
        review_dir = Path(project, "reviews", old_review_config["id"])
        results_db = Path(review_dir, "results.db")
        if results_db.exists():
            shutil.move(results_db, project)
        review_config_fp = Path(review_dir, "settings_metadata.json")
        if review_config_fp.exists():
            with open(review_config_fp) as f:
                review_config["model"] = json.load(f)
        else:
            review_config["model"] = {}
        tags_config_fp = Path(review_dir, "tags.json")
        if tags_config_fp.exists():
            with open(tags_config_fp) as f:
                project_config["tags"] = json.load(f)
    shutil.rmtree(Path(project, "reviews"))
    project_config["review"] = review_config

    with open(config_fp, "w") as f:
        json.dump(project_config, f)
