# Copyright 2019-2021 The ASReview Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
import os
import sqlite3
from time import sleep, time


def _log_msg(msg, project_id=None):
    """Return the log message with project_id."""
    if project_id is not None:
        return f"Project {project_id} - {msg}"

    return msg


def get_db(db_file):
    """Retrieve SQLite database."""
    db = sqlite3.connect(str(db_file), detect_types=sqlite3.PARSE_DECLTYPES)
    db.row_factory = sqlite3.Row
    return db


def release_all_locks(db_file):
    """Release all locked projects."""
    db = get_db(db_file)
    db.execute('DELETE FROM locks;')
    db.close()
    return None


class SQLiteLock():
    def __init__(self,
                 db_file,
                 lock_name="global",
                 blocking=False,
                 timeout=30,
                 polling_rate=0.4,
                 project_id=None):
        self.db_file = db_file
        self.lock_name = lock_name
        self.lock_acquired = False
        self.timeout = timeout
        self.polling_rate = polling_rate
        self.project_id = project_id

        # acquire
        self.acquire(
            blocking=blocking, timeout=timeout, polling_rate=polling_rate)

    def acquire(self, blocking=False, timeout=30, polling_rate=0.4):
        if self.lock_acquired:
            return

        if not os.path.isfile(self.db_file):
            self.init_db()

        cur_timeout = 0  # Sounds like timeout parameter has no effect here
        while True and not self.lock_acquired:
            db = get_db(self.db_file)
            try:
                db.isolation_level = 'EXCLUSIVE'
                db.execute('BEGIN EXCLUSIVE')
                lock_entry = db.execute('SELECT * FROM locks WHERE name = ?',
                                        (self.lock_name, )).fetchone()
                if lock_entry is None:
                    db.execute('INSERT INTO locks (name) VALUES (?)',
                               (self.lock_name, ))
                    self.lock_acquired = True
                    logging.debug(
                        _log_msg(f"Acquired lock {self.lock_name}",
                                 self.project_id))
                db.commit()
            except sqlite3.OperationalError as e:
                logging.error(
                    _log_msg(f"Encountering operational error {e}",
                             self.project_id))
            db.close()
            if self.lock_acquired or not blocking:
                break
            cur_timeout += polling_rate
            sleep(polling_rate)

    def init_db(self):
        db = get_db(self.db_file)
        db.executescript('DROP TABLE IF EXISTS locks; '
                         'CREATE TABLE locks (name TEXT NOT NULL);')
        db.close()

    def locked(self):
        return self.lock_acquired

    def __enter__(self):
        return self

    def __exit__(self, *_, **__):
        self.release()

    def release(self):
        if not self.locked():
            return
        while True:
            db = get_db(self.db_file)
            try:
                db.execute('DELETE FROM locks WHERE name = ?',
                           (self.lock_name, ))
                db.commit()
                db.close()
                break
            except sqlite3.OperationalError:
                pass
            db.close()
            sleep(0.4)
        logging.debug(
            _log_msg(f"Released lock {self.lock_name}", self.project_id))
        self.lock_acquired = False


class SQLiteUserLock():
    def __init__(self,
                 db_file,
                 owner,
                 project_id=None,
                 duration=15 * 60):
        self.db_file = db_file
        self.project_id = project_id
        self.owner = owner
        self.duration = duration

        if not os.path.isfile(self.db_file):
            self.init_db()

    @property
    def is_locked_by_another_user(self):
        locking_entry = self.locking_entry

        return locking_entry and (locking_entry[0] != self.owner)

    @property
    def locking_entry(self):
        db = get_db(self.db_file)
        cur_time = int(time())
        try:
            db.isolation_level = 'EXCLUSIVE'
            db.execute('BEGIN EXCLUSIVE')

            lock_entry = db.execute('SELECT * FROM locks WHERE expires > ? ' +
                                    'ORDER BY expires ASC',
                                    (cur_time, )).fetchone()

            if lock_entry is None:
                return False
            else:
                return lock_entry

        except sqlite3.OperationalError as e:
            logging.error(
                _log_msg(f"Encountering operational error {e}",
                         self.project_id))

        db.close()

        return False

    def acquire(self, extend=True):
        try:
            locking_entry = self.locking_entry
            if (not locking_entry) or (locking_entry[0] == self.owner):
                db = get_db(self.db_file)
                cur_time = int(time())

                if not locking_entry:
                    db.execute('INSERT INTO locks (owner, expires) VALUES (?, ?)',
                               (self.owner, cur_time + self.duration))
                elif extend:
                    db.execute('UPDATE locks SET expires = ? WHERE owner = ? AND '
                               'expires > ?',
                               (cur_time + self.duration, self.owner, cur_time))

                logging.debug(
                    _log_msg(f"User {self.owner} acquired lock for",
                             self.project_id))
                db.commit()
                db.close()

                return True
            else:
                return False

        except sqlite3.OperationalError as e:
            logging.error(
                _log_msg(f"Encountering operational error {e}",
                         self.project_id))

        db.close()

        return False

    def init_db(self):
        db = get_db(self.db_file)
        db.executescript('DROP TABLE IF EXISTS locks; '
                         'CREATE TABLE locks ('
                         'owner TEXT DEFAULT NULL,'
                         'expires INT DEFAULT 2524604400'  # Jan 1 2050
                         ');')
        db.close()

    def release(self):
        if not self.locked():
            return
        while True:
            db = get_db(self.db_file)
            try:
                db.execute('DELETE FROM locks WHERE owner = ?',
                           (self.owner))
                db.commit()
                db.close()
                break
            except sqlite3.OperationalError:
                pass
            db.close()
            sleep(0.4)
        logging.debug(
            _log_msg(f"Released lock {self.owner}", self.project_id))
