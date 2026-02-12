# Copyright 2019-2025 The ASReview Authors. All Rights Reserved.
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

"""Active learning for Systematic Reviews.

Active learning for Systematic Reviews (ASReview) is a package for
systematic reviews. It is designed to automate the step of screening
titles and abstracts in a systematic review. It can be used for screening
any type of text data, such as scientific papers, but also, e.g. legal documents
or news articles. The package also includes rich simulation functionality, which
can be used to evaluate the performance of the active learning model.
"""

import sqlite3

from sqlalchemy import event
from sqlalchemy.engine import Engine

from asreview.data.loader import load_dataset
from asreview.data.record import Record
from asreview.data.store import DataStore
from asreview.extensions import extensions
from asreview.extensions import get_extension
from asreview.extensions import load_extension
from asreview.learner import ActiveLearningCycle
from asreview.learner import ActiveLearningCycleData
from asreview.project.api import Project
from asreview.project.api import is_project
from asreview.project.exceptions import ProjectError
from asreview.project.exceptions import ProjectNotFoundError
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
    # modules
    "data",
    "models",
    "metrics",
    "datasets",
    # classes
    "ActiveLearningCycle",
    "ActiveLearningCycleData",
    "Simulate",
    "Project",
    "SQLiteState",
    "DataStore",
    "Record",
    # functions
    "is_project",
    "load_dataset",
    "open_state",
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

    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
