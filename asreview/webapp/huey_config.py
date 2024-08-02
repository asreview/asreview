import atexit
import sqlite3

from huey import SqliteHuey
from pathlib import Path
from asreview.webapp.utils import asreview_path


db_path = asreview_path() / Path("huey.sqlite")
huey = SqliteHuey(name="asreview", filename=db_path)

def flush_huey_db():
    """Remove all data from huey database."""
    print("Cleaning huey tables")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for table in ["kv", "task"]:
        cursor.execute(f"DELETE FROM {table}")

    conn.commit()
    conn.close()

atexit.register(flush_huey_db)
