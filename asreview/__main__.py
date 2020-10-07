# Copyright 2019 The ASReview Authors. All Rights Reserved.
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
import logging
import sys

from asreview import __version__
from asreview.utils import get_entry_points


PROG_DESCRIPTION = "Automated Systematic Review (ASReview)."

# Entry points for internal use. These entry points are not displayed in the
# help page of the  user interface.
INTERNAL_ENTRY_POINTS = ["web_run_model"]


def _output_available_entry_points(entry_points):

    description_list = []
    for name, entry in entry_points.items():

        # don't display the internal entry points
        if name in INTERNAL_ENTRY_POINTS:
            continue

        # try to load entry points, hide when failing on loading
        try:
            description_list.append(entry.load()().format(name))
        except ModuleNotFoundError:
            logging.warning(
                f"Plugin with entry point {name} could not be loaded.")
    return "\n\n".join(description_list)


def main():
    # Get the available entry points.
    entry_points = get_entry_points("asreview.entry_points")

    # Try to load the entry point if available.
    if len(sys.argv) > 1 and (sys.argv[1] in entry_points or sys.argv[1] == "oracle"):

        # first argument is the subcommand
        subcommand = sys.argv[1]

        # replace 'oracle' by 'lab'
        if subcommand == "oracle":
            print("Warning: subcommmand 'oracle' is now 'lab'.")
            subcommand = "lab"

        try:
            entry = entry_points[subcommand]
            entry.load()().execute(sys.argv[2:])
        except ModuleNotFoundError:
            raise ValueError(
                f"Plugin with entry point {entry.name} could not be loaded.")

    # Print help message if subcommand not given of incorrect
    else:

        # format the available subcommands
        description_subcommands = _output_available_entry_points(entry_points)

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

        # version
        parser.add_argument(
            "-V", "--version",
            action='store_true',
            help="print the ASR version number and exit")

        args, _ = parser.parse_known_args()

        # output the version
        if args.version:
            print(__version__)
            return

        parser.print_help()


# execute main function
if __name__ == "__main__":
    main()
