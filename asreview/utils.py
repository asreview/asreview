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

__all__ = []

from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlparse
from urllib.request import urlopen

import numpy as np

from asreview.extensions import get_extension
from asreview.config import DEFAULT_CLASSIFIER
from asreview.config import DEFAULT_QUERY_STRATEGY
from asreview.config import DEFAULT_BALANCE_STRATEGY
from asreview.config import DEFAULT_FEATURE_EXTRACTION


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


def _check_model(settings):
    warnings = []

    try:
        get_extension("models.feature_extraction", settings.feature_extraction)
    except ValueError:
        warnings.append(f"Feature extractor={settings.feature_extraction}")

    try:
        get_extension("models.classifiers", settings.classifier)
    except ValueError:
        warnings.append(f"Classifier={settings.classifier}")

    try:
        get_extension("models.query", settings.query_strategy)
    except ValueError:
        warnings.append(f"Query strategy={settings.query_strategy}")

    try:
        get_extension("models.balance", settings.balance_strategy)
    except ValueError:
        warnings.append(f"Balance strategy={settings.balance_strategy}")

    if warnings:
        raise ValueError(
            ", ".join(warnings) + " not available. Check if the extension is installed."
        )


def _reset_model_settings(settings):
    """Reset model settings to default values."""
    settings.classifier = DEFAULT_CLASSIFIER
    settings.query_strategy = DEFAULT_QUERY_STRATEGY
    settings.balance_strategy = DEFAULT_BALANCE_STRATEGY
    settings.feature_extraction = DEFAULT_FEATURE_EXTRACTION
    settings.classifier_param = None
    settings.query_param = None
    settings.balance_param = None
    settings.feature_param = None

    return settings
