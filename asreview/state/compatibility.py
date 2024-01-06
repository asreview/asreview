import sqlite3


def _alter_tag_column(state):
    """Add a tag column to the results table.

    Introduced in state version 1.1.
    """
    con: sqlite3.Connection = state.connect_to_sql_wr()
    con.execute("ALTER TABLE results ADD COLUMN custom_metadata_json TEXT")


def check_and_update_version(current_version, new_version, state):

    if current_version == new_version:
        return current_version

    if current_version in ["1.0", "1", 1] and new_version == "1.1":
        _alter_tag_column(state)
        return "1.1"

    raise ValueError(
        f"Migration script from version {current_version} "
        f"to {new_version} doesn't exist"
    )
