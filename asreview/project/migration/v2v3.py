import json
import shutil
import sqlite3
from pathlib import Path

import jsonschema
from sqlalchemy import create_engine

from asreview.data.record import Base
from asreview.database.database import Database
from asreview.project.schema import SCHEMA


def _migrate(project):
    """Migrate an valid project file from version 2 to version 3.

    From version 2 to version 3 the changes to the project file are:

    - ./reviews/<review_id>/results.db is moved to ./results.db
    - ./data_store.db is merged into ./results.db
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
    reviews = project_config.pop("reviews", [{}])
    old_review_config = reviews[0] if reviews else {}
    review_config["status"] = old_review_config.get("status", "setup")

    # Move the results database to the project root and add the review settings to
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
            shutil.copy(tags_config_fp, Path(project, "tags.json"))
            with open(tags_config_fp) as f:
                project_config["tags"] = json.load(f)
    reviews_dir = Path(project, "reviews")
    if reviews_dir.exists():
        shutil.rmtree(reviews_dir)
    project_config["review"] = review_config

    with open(config_fp, "w") as f:
        json.dump(project_config, f)

    _copy_store_to_results(project)
    Path(project, "data_store.db").unlink()

    _migrate_decision_changes_table(project)
    _update_database_version(project)
    _add_database_triggers(project)


def _copy_store_to_results(project):
    engine = create_engine(f"sqlite:///{str(Path(project, 'results.db'))}")
    Base.metadata.create_all(engine)
    engine.dispose()
    conn = sqlite3.connect(Path(project, "results.db"))
    try:
        cur = conn.cursor()
        data_store_fp = Path(project, "data_store.db")
        cur.execute("ATTACH ? AS data_store", (str(data_store_fp),))
        cur.execute("""
            INSERT INTO record(dataset_row, dataset_id, duplicate_of, title, abstract,
                    authors, keywords, year, doi, url, included, record_id)
            SELECT dataset_row, dataset_id, duplicate_of, title, abstract, authors,
                    keywords, year, doi, url, included, record_id FROM data_store.record
        """)
        conn.commit()
        cur.execute("DETACH DATABASE data_store")
    finally:
        conn.close()


def _migrate_decision_changes_table(project):
    """Migrate the decision_changes table from the old v2 schema to the current schema.

    Older v2 projects have a decision_changes table with columns
    (record_id, new_label, time). The current schema expects
    (record_id, label, time, user_id).
    """
    conn = sqlite3.connect(Path(project, "results.db"))
    cur = conn.cursor()

    columns = [row[1] for row in cur.execute("PRAGMA table_info(decision_changes)")]

    if "new_label" in columns and "label" not in columns:
        cur.execute("ALTER TABLE decision_changes RENAME COLUMN new_label TO label")

    if "user_id" not in columns:
        cur.execute("ALTER TABLE decision_changes ADD COLUMN user_id INTEGER")

    conn.commit()
    conn.close()


def _update_database_version(project):
    conn = sqlite3.connect(Path(project, "results.db"))
    cur = conn.cursor()
    cur.execute("PRAGMA user_version = 3")
    conn.commit()
    conn.close()


def _add_database_triggers(project):
    with Database(Path(project, "results.db")) as db:
        db._set_results_changes_triggers()


def _validate(project):
    """Validate a migrated v3 project.

    Parameters
    ----------
    project : Path
        Path to the migrated project folder.

    Raises
    ------
    ValueError
        If the migrated project is not valid.
    """
    config_fp = Path(project, "project.json")
    if not config_fp.exists():
        raise ValueError("Migrated project is missing project.json.")

    with open(config_fp) as f:
        config = json.load(f)

    jsonschema.validate(instance=config, schema=SCHEMA)

    if config.get("project_file_version") != 3:
        raise ValueError(
            f"Expected project file version 3, "
            f"got {config.get('project_file_version')}."
        )

    results_db_fp = Path(project, "results.db")
    if not results_db_fp.exists():
        raise ValueError("Migrated project is missing results.db.")

    with Database(results_db_fp) as db:
        db._is_valid()
