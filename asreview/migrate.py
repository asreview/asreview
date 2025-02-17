import json
import os
import sqlite3
from dataclasses import asdict
from pathlib import Path
from uuid import uuid4

import pandas

from asreview.data.store import DataStore

from asreview.data.loader import _from_file
from asreview._version import __version__
from asreview.models.models import get_ai_config
from asreview.state.sqlstate import SQLiteState


def _project_config_converter_v1_v2(project_json):
    # Convert the project config from version 1 to version 2.
    # This is a helper function for the main migration function.

    project_json["version"] = __version__
    del project_json["datetimeCreated"]

    for i, _ in enumerate(project_json["reviews"]):
        del project_json["reviews"][i]["start_time"]
        try:
            del project_json["reviews"][i]["end_time"]
        except KeyError:
            pass

    return project_json


def _project_data_converter_v1_v2(project_config, project_folder):
    fp_data = Path(project_folder, "data", project_config["dataset_path"])

    dataset_id = uuid4().hex
    records = _from_file(fp_data, dataset_id=dataset_id)

    data_store = DataStore(Path(project_folder, "data_store.db"))
    data_store.create_tables()
    data_store.add_records(records=records)

    project_config["datasets"] = [{"id": dataset_id, "name": fp_data.name}]
    del project_config["dataset_path"]


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
    df_results["time"] = (
        pandas.to_datetime(df_results["labeling_time"]).astype("int64")
        // int(1e3)
        / int(1e6)
    )
    del df_results["labeling_time"]
    sqlstate._replace_results_from_df(df_results)

    df_last_ranking = pandas.read_sql_query("SELECT * FROM last_ranking", conn)

    if not df_last_ranking.empty:
        df_last_ranking = df_last_ranking.rename(
            columns={
                "query_strategy": "querier",
                "balance_strategy": "balancer",
                "feature_extraction": "feature_extractor",
            }
        )
        df_last_ranking["time"] = (
            pandas.to_datetime(df_last_ranking["time"]).astype("int64")
            // int(1e3)
            / int(1e6)
        )

        sqlstate._replace_last_ranking_from_df(df_last_ranking)

    try:
        df_decision_updates = pandas.read_sql_table(
            "SELECT * FROM decision_updates", conn
        )
        df_decision_updates["time"] = (
            pandas.to_datetime(df_decision_updates["time"]).astype("int64")
            // int(1e3)
            / int(1e6)
        )
        df_decision_updates.to_sql(
            "decision_updates", sqlstate._conn, if_exists="replace", index=False
        )
    except ValueError:
        pass

    conn.close()
    sqlstate.close()

    os.unlink(Path(review_path, "results.sql"))


def _project_model_settings_converter_v1_v2(fp_cycle_metadata):
    with open(fp_cycle_metadata, "w") as f:
        default_model = get_ai_config()
        json.dump(
            {
                "name": default_model["name"],
                "current_value": asdict(default_model["value"]),
            },
            f,
        )


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

    fp_project_config = Path(folder, "project.json")

    # update the project config file
    with open(fp_project_config) as f:
        project_config = json.load(f)

    project_config = _project_config_converter_v1_v2(project_config)

    # update the data file
    _project_data_converter_v1_v2(project_config, folder)

    with open(fp_project_config, "w") as f:
        json.dump(project_config, f)

    # update the state file
    for review in project_config["reviews"]:
        _project_state_converter_v1_v2(Path(folder, "reviews", review["id"]))

        # Update the model settings file
        _project_model_settings_converter_v1_v2(
            Path(folder, "reviews", review["id"], "settings_metadata.json"),
        )
