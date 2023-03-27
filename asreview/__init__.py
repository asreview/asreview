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

from . import compat  # so you can remove it from the api later
from . import config
from . import data
from . import datasets
from . import entry_points
from . import exceptions
from . import io
from . import models
from . import project
from . import review   # so you can remove it from the api later
from . import search   # so you can remove it from the api later
from . import settings
from . import state
from . import types
from . import utils
from . import webapp   # so you can remove it from the api later
from asreview.data.base import ASReviewData
from asreview.data.base import load_data
from asreview.io.utils import list_readers
from asreview.io.utils import list_writers
from asreview.models.feature_extraction.embedding_lstm import load_embedding
from asreview.models.feature_extraction.embedding_lstm import sample_embedding
from asreview.models.feature_extraction.embedding_lstm import text_to_features
from asreview.project import ASReviewProject
from asreview.project import open_state
from asreview.utils import asreview_path
from asreview.utils import get_data_home
from ._version import get_versions


__version__ = get_versions()['version']
del get_versions
del webapp
del search
del review
del compat
del _version  # noqa: F821


__all__ = [
    "__version__",
    "asreview_path",
    "ASReviewData",
    "ASReviewProject",
    "config",
    "data",
    "datasets",
    "entry_points",
    "exceptions",
    "get_data_home",
    "io",
    "list_readers",
    "list_writers",
    "load_data",
    "load_embedding",
    "models",
    "open_state",
    "project",
    "sample_embedding",
    "settings",
    "state",
    "text_to_features",
    "types",
    "utils"
]

for _item in dir():
    if not _item.endswith('__'):
        assert _item in __all__, f"Named export {_item} missing from __all__ in {__package__}"
for _item in __all__:
    assert _item in dir(), f"__all__ includes unknown item {_item} in {__package__}"
del _item
