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

import argparse
import functools
import logging
import warnings


def _deprecated_func(msg):
    def dec(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            warnings.warn(msg, stacklevel=2)
            return func(*args, **kwargs)

        return wrapper

    return dec


def _deprecated_kwarg(kwarg_map):
    def dec(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            new_kwargs = {}
            for k, v in kwargs.items():
                if k in kwarg_map:
                    warnings.warn(
                        f"Keyword argument '{k}' is deprecated. "
                        "Use '{kwarg_map[k]}' instead.",
                        DeprecationWarning,
                        stacklevel=2,
                    )  # noqa
                new_kwargs[kwarg_map.get(k, k)] = v
            return func(*args, **new_kwargs)

        return wrapper

    return dec


class DeprecateAction(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        logging.warning(
            f"Argument {self.option_strings} is deprecated and is ignored.",
            stacklevel=2,
        )
        delattr(namespace, self.dest)


def mark_deprecated_help_strings(parser, prefix="DEPRECATED"):
    for action in parser._actions:
        if isinstance(action, DeprecateAction):
            h = action.help
            if h is None:
                action.help = prefix
            else:
                action.help = prefix + ": " + h
