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

from importlib.metadata import entry_points as _entry_points


def extensions(group):
    """Get the extension class from an entry point.

    Arguments
    ---------
    group: str
        The group of the extension.

    Returns
    -------
    dict:
        The class corresponding to the extension.
    """

    return _entry_points(group=f"asreview.{group}")


def get_extension(group, name):
    """Get the extension class from an entry point.

    Arguments
    ---------
    group: str
        The group of the extension.
    name: str
        The name of the extension.

    Returns
    -------
    class:
        The class corresponding to the extension.
    """

    try:
        (entry_point,) = _entry_points(group=f"asreview.{group}", name=name)
        return entry_point
    except ValueError as err:
        raise ValueError(f"Extension {name} not found in group {group}.") from err


def load_extension(group, name):
    """Load the extension class from an entry point.

    Arguments
    ---------
    group: str
        The group of the extension.
    name: str
        The name of the extension.

    Returns
    -------
    class:
        The class corresponding to the extension.

    """

    if not get_extension(group, name):
        raise ValueError(f"Extension {name} not found in group {group}.")

    return get_extension(group, name).load()
