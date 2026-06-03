"""Reproduce the SQLite "database is locked" failure and verify the WAL fix.

ASReview rewrites two project-database tables on every model/ranking update:

  * ``last_ranking`` via ``DataFrame.to_sql(..., if_exists="replace")``
    (pandas issues ``DROP TABLE`` + recreate + bulk insert)
  * ``results`` via ``DELETE FROM results`` (SQLite's truncate optimisation)

Both need an exclusive write lock. In SQLite's default rollback-journal mode a
concurrent reader holding a shared lock blocks that write: the writer waits the
full busy-timeout (5s by default) and then fails with SQLITE_BUSY
("database is locked"). This is what a gunicorn worker reading project state
does to the task manager rewriting the ranking.

WAL (Write-Ahead Logging) lets one writer and many readers coexist without
blocking, so the same write succeeds immediately with a reader still open.

Run:        python reproduce_wal_lock.py
Requires:   pandas  (already an ASReview dependency)
"""

import os
import sqlite3
import tempfile
import time

import pandas as pd

N_ROWS = 10_000


def _fresh_db(path):
    """Create a project-like database with last_ranking and results tables."""
    for p in (path, path + "-wal", path + "-shm", path + "-journal"):
        if os.path.exists(p):
            os.remove(p)
    conn = sqlite3.connect(path)
    pd.DataFrame({"record_id": range(N_ROWS), "score": range(N_ROWS)}).to_sql(
        "last_ranking", conn, if_exists="replace", index=False
    )
    conn.execute("CREATE TABLE results (record_id INTEGER, label INTEGER)")
    conn.executemany(
        "INSERT INTO results VALUES (?, ?)", [(i, i % 2) for i in range(N_ROWS)]
    )
    conn.commit()
    conn.close()


def _attempt_write(path, journal_mode, write_kind):
    """Open a writer plus a concurrent reader, attempt one write, report result.

    The reader leaves a cursor mid-iteration so it keeps a shared lock on the
    database file (SQLite write locks are database-wide), mimicking a web worker
    reading project state while the task manager rewrites the ranking.
    """
    _fresh_db(path)

    writer = sqlite3.connect(path, uri=True)  # inherits the default 5s busy timeout
    if journal_mode == "WAL":
        writer.execute("PRAGMA journal_mode=WAL")

    reader = sqlite3.connect(path, uri=True)
    reader_cursor = reader.execute("SELECT * FROM last_ranking")
    reader_cursor.fetchone()  # begin reading; do NOT finish -> lock stays held

    start = time.time()
    try:
        if write_kind == "to_sql_replace":  # mirrors add_last_ranking()
            pd.DataFrame(
                {"record_id": range(N_ROWS), "score": range(N_ROWS)}
            ).to_sql("last_ranking", writer, if_exists="replace", index=False)
        elif write_kind == "delete_truncate":  # mirrors _replace_results_from_df()
            writer.execute("DELETE FROM results")
            writer.commit()
        outcome = f"OK   in {time.time() - start:5.2f}s"
    except Exception as exc:
        outcome = f"FAIL after {time.time() - start:5.2f}s  ({type(exc).__name__}: {exc})"
    finally:
        reader.close()
        writer.close()
    return outcome


def main():
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "project.sqlite")
        print(
            f"{N_ROWS} rows; a concurrent reader is held open during each write.\n"
        )
        cases = [
            ("to_sql_replace", "last_ranking  (to_sql if_exists='replace')"),
            ("delete_truncate", "results       (DELETE FROM = truncate)"),
        ]
        for write_kind, label in cases:
            default = _attempt_write(path, "DELETE", write_kind)
            wal = _attempt_write(path, "WAL", write_kind)
            print(label)
            print(f"    default (rollback journal): {default}")
            print(f"    WAL                       : {wal}\n")


if __name__ == "__main__":
    main()