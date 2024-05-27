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

# deprecated in __init__.py, use asreview.models.feature_extraction instead
from asreview.data.base import Dataset
from asreview.data.base import Record
from asreview.data.loader import load_dataset
from asreview.extensions import extensions
from asreview.extensions import get_extension
from asreview.extensions import load_extension
from asreview.project import Project
from asreview.project import is_project
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
    "Record",
    "Dataset",
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
]
