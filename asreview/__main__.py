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

"""Command Line Interface (CLI) for ASReview project."""

import argparse
import inspect
import sys
from importlib.metadata import metadata
from itertools import groupby

from asreview import __version__
from asreview.extensions import extensions


def _execute_entry_point(entry, args):
    if inspect.isclass(entry):
        entry().execute(args)
    else:
        entry(args)


def main():
    # Get the available entry points.
    base_entries = extensions("entry_points")
    base_entries_internal = extensions("entry_points_internal")

    if (
        len(sys.argv) > 1
        and not sys.argv[1].startswith("-")
        and not (
            sys.argv[1] in base_entries.names
            or sys.argv[1] in base_entries_internal.names
        )
    ):
        raise ValueError(f"'{sys.argv[1]}' is not a valid subcommand.")

    elif len(sys.argv) > 1 and sys.argv[1] in base_entries.names:
        entry = base_entries[sys.argv[1]].load()
        _execute_entry_point(entry, sys.argv[2:])
    elif len(sys.argv) > 1 and sys.argv[1] in base_entries_internal.names:
        entry = base_entries_internal[sys.argv[1]].load()
        _execute_entry_point(entry, sys.argv[2:])

    else:
        description_subcommands = ""

        for name, dist_extensions in groupby(
            base_entries,
            lambda e: e.dist.name,
        ):
            description = metadata(name)["Summary"]
            version = metadata(name)["Version"]
            description_subcommands += f"\n[{name} {version}] - {description}\n"

            for entry in dist_extensions:
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
            version=f"%(prog)s {__version__}",
        )

        args, _ = parser.parse_known_args()

        parser.print_help()


if __name__ == "__main__":
    main()
