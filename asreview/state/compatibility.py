import sqlite3


def _check_and_update_version(new_version, state):
    if state.user_version == new_version:
        return state.user_version

    if state.user_version == 0 and new_version == 2:
        con: sqlite3.Connection = state._conn
        con.execute("ALTER TABLE results ADD COLUMN custom_metadata_json TEXT")
        return 2

    raise ValueError(
        f"Migration script from version {state.user_version} "
        f"to {new_version} doesn't exist"
    )
