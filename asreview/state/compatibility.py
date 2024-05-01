import sqlite3


def _alter_tag_column(state):
    """Add a tag column to the results table.

    Introduced in state version 2.
    """
    con: sqlite3.Connection = state._conn()
    con.execute("ALTER TABLE results ADD COLUMN custom_metadata_json TEXT")


def check_and_update_version(current_version, new_version, state):
    if current_version == new_version:
        return current_version

    if current_version == 0 and new_version == 2:
        _alter_tag_column(state)
        return 2

    raise ValueError(
        f"Migration script from version {current_version} "
        f"to {new_version} doesn't exist"
    )
