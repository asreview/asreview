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
    review_config["model"] = {}
    if old_review_config and "id" in old_review_config:
        review_dir = Path(project, "reviews", old_review_config["id"])
        results_db = Path(review_dir, "results.db")
        if results_db.exists():
            shutil.move(results_db, project)
        review_config_fp = Path(review_dir, "settings_metadata.json")
        if review_config_fp.exists():
            with open(review_config_fp) as f:
                review_config["model"] = json.load(f)
        tags_config_fp = Path(review_dir, "tags.json")
        if tags_config_fp.exists():
            with open(tags_config_fp) as f:
                project_config["tags"] = json.load(f)
    reviews_dir = Path(project, "reviews")
    if reviews_dir.exists():
        shutil.rmtree(reviews_dir)
    project_config["review"] = review_config

    with open(config_fp, "w") as f:
        json.dump(project_config, f)

    # Ensure results.db exists with the v3 schema. For setup-state projects that
    # have no review (and thus no results.db was moved), this creates a fresh one.
    _ensure_results_db(project)

    data_store_fp = Path(project, "data_store.db")
    if data_store_fp.exists():
        _copy_store_to_results(project)
        data_store_fp.unlink()

    _update_database_version(project)
    _add_database_triggers(project)


def _ensure_results_db(project):
    """Ensure results.db exists with all required v3 tables.

    For projects that had an active review, results.db was moved from the review
    directory and already contains the results/last_ranking/decision_changes
    tables. This function adds the record table (new in v3) using SQLAlchemy.

    For setup-state projects with no review, this creates a fresh results.db
    with all tables so that subsequent steps (version update, triggers) have a
    valid database to work with.
    """
    results_db_fp = Path(project, "results.db")

    # Create the record table via SQLAlchemy ORM.
    engine = create_engine(f"sqlite:///{str(results_db_fp)}")
    Base.metadata.create_all(engine)
    engine.dispose()

    # Ensure the results/last_ranking/decision_changes tables exist. For
    # projects that had an active review these already exist (CREATE TABLE
    # IF NOT EXISTS is safe). For setup-state projects they need to be created.
    conn = sqlite3.connect(results_db_fp)
    cur = conn.cursor()
    cur.execute(
        """CREATE TABLE IF NOT EXISTS results
                        (record_id INTEGER UNIQUE,
                        label INTEGER,
                        classifier TEXT,
                        querier TEXT,
                        balancer TEXT,
                        feature_extractor TEXT,
                        training_set INTEGER,
                        time FLOAT,
                        note TEXT,
                        tags JSON,
                        user_id INTEGER)"""
    )
    cur.execute(
        """CREATE TABLE IF NOT EXISTS last_ranking
                        (record_id INTEGER UNIQUE,
                        ranking INT,
                        classifier TEXT,
                        querier TEXT,
                        balancer TEXT,
                        feature_extractor TEXT,
                        training_set INTEGER,
                        time FLOAT)"""
    )
    cur.execute(
        """CREATE TABLE IF NOT EXISTS decision_changes
                        (record_id INTEGER,
                        label INTEGER,
                        time FLOAT,
                        user_id INTEGER)"""
    )
    conn.commit()
    conn.close()


def _copy_store_to_results(project):
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
