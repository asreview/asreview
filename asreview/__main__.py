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

"""Command Line Interface (CLI) for ASReview project."""
import argparse
from itertools import groupby
import logging
import sys
import pkg_resources
from importlib import metadata


from asreview import __version__
from asreview.utils import get_entry_points

PROG_DESCRIPTION = "Automated Systematic Review (ASReview)."

# Internal or deprecated entry points. These entry points
# are not displayed in the help page of the  user interface.
INTERNAL_ENTRY_POINTS = ["web_run_model"]
DEPRECATED_ENTRY_POINTS = ["oracle"]


def _output_available_entry_points():

    s = ""

    entry_points = pkg_resources.iter_entry_points("asreview.entry_points")

    for name, pkg_entry_points in groupby(entry_points, lambda entry: entry.dist):

        description = metadata.metadata(name.project_name)['Summary']

        s += f"\n[{name}] - {description}\n"

        for entry in pkg_entry_points:

            # don't display the internal entry points
            if entry.name in INTERNAL_ENTRY_POINTS:
                continue

            # don't display the deprecated entry points
            if entry.name in DEPRECATED_ENTRY_POINTS:
                continue

            s+= f"\t{entry.name}\n"

    return s


def main():
    # Get the available entry points.
    entry_points = get_entry_points("asreview.entry_points")

    # Try to load the entry point if available.
    if len(sys.argv) > 1 and sys.argv[1] not in entry_points:
        raise ValueError(f"'{sys.argv[1]}' is not a valid subcommand.")

    elif len(sys.argv) > 1 and sys.argv[1] in entry_points:

        entry = entry_points[sys.argv[1]]
        entry.load()().execute(sys.argv[2:])

    else:

        # format the available subcommands
        description_subcommands = _output_available_entry_points()

        parser = argparse.ArgumentParser(
            prog="asreview",
            formatter_class=argparse.RawTextHelpFormatter,
            description=PROG_DESCRIPTION
        )
        parser.add_argument(
            "subcommand",
            nargs="?",
            default=None,
            help=f"The subcommand to launch. Available commands:\n\n"
            f"{description_subcommands}"
        )

        parser.add_argument(
            "-V",
            "--version",
            action="version",
            version='%(prog)s {version}'.format(version=__version__)
        )

        args, _ = parser.parse_known_args()

        parser.print_help()


# execute main function
if __name__ == "__main__":
    main()
