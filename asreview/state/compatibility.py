import sqlite3


def _migrate_1(con: sqlite3.Connection):
    pass  # initial version


def _migrate_2(con: sqlite3.Connection):
    con.execute("ALTER TABLE results ADD COLUMN custom_metadata_json TEXT")


# Contains version -> migration script pairs
CHANGE_LOG = {
    1: _migrate_1,
    2: _migrate_2
}


def check_and_update_version(current_version, new_version, con: sqlite3.Connection):
    current_version = int(current_version)
    new_version = int(new_version)

    if current_version >= new_version:
        return current_version

    while current_version != new_version:
        try:
            script = CHANGE_LOG[current_version + 1]
            script(con)
            current_version += 1
        except KeyError:
            raise KeyError(f"Migration script from version {current_version} to {current_version + 1} doesn't exist")

    return current_version
