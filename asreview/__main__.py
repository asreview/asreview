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
import sys
from importlib.metadata import metadata
from itertools import groupby

from asreview import __version__
from asreview.utils import _entry_points

# Internal or deprecated entry points. These entry points
# are not displayed in the help page of the  user interface.
INTERNAL_ENTRY_POINTS = ["web_run_model"]
DEPRECATED_ENTRY_POINTS = ["oracle"]


def main():
    # Get the available entry points.
    base_entries = _entry_points(group="asreview.entry_points")

    if (
        len(sys.argv) > 1
        and not sys.argv[1].startswith("-")
        and sys.argv[1] not in base_entries.names
    ):
        raise ValueError(f"'{sys.argv[1]}' is not a valid subcommand.")

    elif len(sys.argv) > 1 and sys.argv[1] in base_entries.names:
        entry = base_entries[sys.argv[1]]
        entry.load()().execute(sys.argv[2:])

    else:
        description_subcommands = ""

        for name, dist_entry_points in groupby(
            base_entries, lambda e: e.dist.name,
        ):

            description = metadata(name)["Summary"]
            version = metadata(name)["Version"]
            description_subcommands += f"\n[{name} {version}] - {description}\n"

            for entry in dist_entry_points:
                if entry.name not in INTERNAL_ENTRY_POINTS + DEPRECATED_ENTRY_POINTS:
                    description_subcommands += f"\t{entry.name}\n"

        parser = argparse.ArgumentParser(
            prog="asreview",
            formatter_class=argparse.RawTextHelpFormatter,
            description=metadata("asreview")["Summary"],
        )
        parser.add_argument(
            "subcommand",
            nargs="?",
            default=None,
            help=f"The subcommand to launch. Available commands:\n\n"
            f"{description_subcommands}",
        )

        parser.add_argument(
            "-V",
            "--version",
            action="version",
            version="%(prog)s {version}".format(version=__version__),
        )

        args, _ = parser.parse_known_args()

        parser.print_help()


if __name__ == "__main__":
    main()
