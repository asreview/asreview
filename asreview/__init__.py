# Copyright 2019-2022 The ASReview Authors. All Rights Reserved.
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

from sqlalchemy import event
from sqlalchemy.engine import Engine

from asreview.data.loader import load_dataset
from asreview.extensions import extensions
from asreview.extensions import get_extension
from asreview.extensions import load_extension
from asreview.project.api import Project
from asreview.project.api import is_project
from asreview.project.exceptions import ProjectError
from asreview.project.exceptions import ProjectNotFoundError
from asreview.search import fuzzy_find
from asreview.settings import ReviewSettings
from asreview.simulation.simulate import Simulate
from asreview.state.contextmanager import open_state
from asreview.state.sqlstate import SQLiteState

try:
    from asreview._version import __version__
    from asreview._version import __version_tuple__
except ImportError:
    __version__ = "0.0.0"
    __version_tuple__ = (0, 0, 0)

__all__ = [
    # classes
    "Project",
    "Simulate",
    "SQLiteState",
    "ReviewSettings",
    # functions
    "is_project",
    "load_dataset",
    "open_state",
    "fuzzy_find",
    "extensions",
    "get_extension",
    "load_extension",
    # errors
    "ProjectError",
    "ProjectNotFoundError",
]


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Configure SQLite to use foreign keys.

    By adding this function, everytime a connection is made to the sqlite engine, we
    make sure that foreign keys are configured (by default sqlite allows foreign keys,
    but ignores them and it's only SQLAlchemy that takes care of foreign keys). The only
    downside of enabling foreign keys on the database level is that we will run into
    problems if we have mutually dependent foreign keys.

    See also: https://docs.sqlalchemy.org/en/20/dialects/sqlite.html#sqlite-foreign-keys
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
