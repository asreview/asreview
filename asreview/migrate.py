import json
import os
import sqlite3
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

import pandas

from asreview._version import __version__
from asreview.models.models import get_model_config
from asreview.state.sqlstate import SQLiteState


def _project_config_converter_v1_v2(project_json):
    # Convert the project config from version 1 to version 2.
    # This is a helper function for the main migration function.

    project_json["version"] = __version__
    del project_json["datetimeCreated"]

    # todo update time in reviews
    for i, review in enumerate(project_json["reviews"]):
        if isinstance(review["start_time"], str):
            dt = datetime.fromisoformat(review["start_time"])
            project_json["reviews"][i]["start_time"] = int(dt.timestamp())

        if "end_time" in review and isinstance(review["end_time"], str):
            dt = datetime.fromisoformat(review["end_time"])
            project_json["reviews"][i]["end_time"] = int(dt.timestamp())

    return project_json


def _project_data_converter_v1_v2(data_path):
    pass


def _project_state_converter_v1_v2(review_path):
    sqlstate = SQLiteState(Path(review_path, "results.db"))
    sqlstate.create_tables()

    conn = sqlite3.connect(Path(review_path, "results.sql"))

    df_results = pandas.read_sql_query(
        "SELECT * FROM results WHERE label is not NULL", conn
    ).rename(
        columns={
            "notes": "note",
            "query_strategy": "querier",
            "balance_strategy": "balancer",
            "feature_extraction": "feature_extractor",
        }
    )
    df_results["tags"] = None
    df_results["user_id"] = None
    df_results["time"] = pandas.to_datetime(df_results["labeling_time"]).astype("int64")
    del df_results["labeling_time"]
    sqlstate._replace_results_from_df(df_results)

    try:
        df_last_ranking = pandas.read_sql_query("SELECT * FROM last_ranking", conn)
        df_last_ranking["time"] = pandas.to_datetime(df_results["time"]).astype("int64")

        sqlstate._replace_last_ranking_from_df(df_last_ranking)
    except ValueError:
        pass

    try:
        df_decision_updates = pandas.read_sql_table(
            "SELECT * FROM decision_updates", conn
        ).to_sql("decision_updates", sqlstate._conn, index=False)
        df_decision_updates["time"] = pandas.to_datetime(df_results["time"]).astype(
            "int64"
        )
        df_decision_updates.to_sql("decision_updates", sqlstate._conn, index=False)
    except ValueError:
        pass

    conn.close()
    sqlstate.close()

    os.unlink(Path(review_path, "results.sql"))


def _project_model_settings_converter_v1_v2(fp_cycle_metadata):
    with open(fp_cycle_metadata, "w") as f:
        json.dump(asdict(get_model_config()), f)


def migrate_v1_v2(folder):
    """Migrate a project from version 1 to version 2.

    Parameters
    ----------
    folder: str
        The folder of the project to migrate

    Returns
    -------
    None
    """

    # update the project config file
    with open(Path(folder, "project.json")) as f:
        project = json.load(f)

    project = _project_config_converter_v1_v2(project)

    with open(Path(folder, "project.json"), "w") as f:
        json.dump(project, f)

    # update the data file
    _project_data_converter_v1_v2(Path(folder, "data"))

    # update the state file
    for review in project["reviews"]:
        _project_state_converter_v1_v2(Path(folder, "reviews", review["id"]))

        # Update the model settings file
        _project_model_settings_converter_v1_v2(
            Path(folder, "reviews", review["id"], "settings_metadata.json"),
        )
