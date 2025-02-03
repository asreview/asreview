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

__all__ = []

import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import urlopen

try:
    import tomllib
except ImportError:
    import tomli as tomllib

import numpy as np


def _get_filename_from_url(url):
    if not _is_url(url):
        raise ValueError(f"'{url}' is not a valid URL.")

    if Path(urlparse(url).path).suffix:
        return Path(urlparse(url).path).name
    else:
        try:
            return urlopen(url).headers.get_filename()
        except HTTPError as err:
            # 308 (Permanent Redirect) not supported
            # See https://bugs.python.org/issue40321
            if err.code == 308:
                return _get_filename_from_url(err.headers.get("Location"))
            else:
                raise err


def _format_to_str(obj):
    """Create string from object, concatenate if list."""

    if isinstance(obj, str):
        return obj
    elif isinstance(obj, list):
        return " ".join(obj)
    elif obj is None or np.isnan(obj):
        return ""
    else:
        return str(obj)


def _is_url(url):
    """Check if object is a valid url."""
    try:
        result = urlparse(url)
        return all(
            getattr(result, x) not in [b"", ""] for x in ["scheme", "netloc", "path"]
        )
    except Exception:
        return False


def _read_config_file(file_name):
    """Read the configuration file and return the content as a dictionary."""
    path = Path(file_name)
    with open(file_name, "r") as f:
        if path.suffix == ".json":
            return json.load(f)
        elif path.suffix == ".toml":
            return tomllib.load(f)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")
