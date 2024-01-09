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

__all__ = ["list_readers", "list_writers", "get_reader_class", "get_writer_class"]


from asreview.utils import _entry_points


def type_from_column(col_name, col_definitions):
    """Transform a column name to its standardized form.

    Arguments
    ---------
    col_name: str
        Name of the column in the dataframe.
    col_definitions: dict
        Dictionary of {standardized_name: [list of possible names]}.
        Ex. {"title": ["title", "primary_title"],
            "authors": ["authors", "author names", "first_authors"]}

    Returns
    -------
    str:
        The standardized name. If it wasn't found, return None.
    """
    for name, definition in col_definitions.items():
        if col_name.lower() in definition:
            return name
    return None


def convert_keywords(keywords):
    """Split keywords separated by commas etc to lists."""
    if not isinstance(keywords, str):
        return keywords

    current_best = [keywords]
    for splitter in [", ", "; ", ": ", ";", ":"]:
        new_split = keywords.split(splitter)
        if len(new_split) > len(current_best):
            current_best = new_split
    return current_best


def list_readers():
    """List available dataset reader classes.

    Returns
    -------
    list:
        Classes of available dataset readers in alphabetical order.
    """
    return [e.load() for e in _entry_points(group="asreview.readers")]


def list_writers():
    """List available dataset writer classes.

    Returns
    -------
    list:
        Classes of available dataset writers in alphabetical order.
    """
    return [e.load() for e in _entry_points(group="asreview.writers")]


def get_reader_class(name):
    """Get class of dataset reader from string.

    Arguments
    ---------
    name: str
        Name of the dataset reader, e.g. '.csv', '.tsv' or '.xlsx'.

    Returns
    -------
    class:
        Class corresponding to the name.
    """
    return _entry_points(group="asreview.readers")[name].load()


def get_writer_class(name):
    """Get class of dataset writer from string.

    Arguments
    ---------
    name: str
        Name of the dataset writer, e.g. '.csv', '.tsv' or '.xlsx'.

    Returns
    -------
    class:
        Class corresponding to the name.
    """

    return _entry_points(group="asreview.writers")[name].load()
