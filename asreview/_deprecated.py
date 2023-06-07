# Copyright 2019-2023 The ASReview Authors. All Rights Reserved.
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

import argparse
import functools
import warnings

from asreview.models.feature_extraction.embedding_lstm import load_embedding as _load_embedding    # NOQA
from asreview.models.feature_extraction.embedding_lstm import sample_embedding as _sample_embedding    # NOQA
from asreview.models.feature_extraction.embedding_lstm import text_to_features as _text_to_features    # NOQA


def _deprecated_func(msg):
    def dec(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            warnings.warn(msg)
            return func(*args, **kwargs)

        return wrapper

    return dec


class DeprecateAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        warnings.warn(f"Argument {self.option_strings} is deprecated and is ignored.")
        delattr(namespace, self.dest)


@_deprecated_func(
    "Importing load_embedding from asreview.load_embedding is deprecated, "
    "use asreview.models.feature_extraction.load_embedding instead"
)
def load_embedding(*args, **kwargs):
    return _load_embedding(*args, **kwargs)


@_deprecated_func(
    "Importing sample_embedding from asreview.sample_embedding is deprecated, "
    "use asreview.models.feature_extraction.sample_embedding instead"
)
def sample_embedding(*args, **kwargs):
    return _sample_embedding(*args, **kwargs)


@_deprecated_func(
    "Importing text_to_features from asreview.text_to_features is deprecated, "
    "use asreview.models.feature_extraction.text_to_features instead"
)
def text_to_features(*args, **kwargs):
    return _text_to_features(*args, **kwargs)
